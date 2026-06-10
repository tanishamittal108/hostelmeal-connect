const Order = require('../models/Order');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Menu = require('../models/Menu');
const { Notification, WalletTransaction, Coupon } = require('../models/index');
const { getIO } = require('../socket/socketManager');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/orders/create
exports.createOrder = async (req, res, next) => {
  try {
    const {
      providerId, menuId, items, paymentMethod,
      deliveryAddress, couponCode, specialInstructions, isEmergency
    } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider || provider.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Provider not available' });
    }

    // Calculate pricing
    let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = 20;
    const platformFee = 5;
    let couponDiscount = 0;
    let appliedCoupon = null;

    // Apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) return res.status(400).json({ success: false, message: 'Invalid coupon code' });
      if (new Date() > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon expired' });
      if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      if (subtotal < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderAmount} required` });
      if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'You have already used this coupon' });

      couponDiscount = coupon.type === 'percentage'
        ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
        : coupon.value;
      appliedCoupon = coupon;
    }

    const totalAmount = subtotal + deliveryCharge + platformFee - couponDiscount;

    // Check wallet
    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id);
      if (user.walletBalance < totalAmount) {
        return res.status(400).json({ success: false, message: `Insufficient wallet balance. Available: ₹${user.walletBalance}` });
      }
    }

    // Generate OTP and QR
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const qrData = JSON.stringify({ otp: deliveryOtp, studentId: req.user._id.toString() });
    const qrCode = await QRCode.toDataURL(qrData);

    const order = await Order.create({
      student: req.user._id,
      provider: providerId,
      menu: menuId,
      items,
      subtotal,
      deliveryCharge,
      platformFee,
      couponDiscount,
      totalAmount,
      couponCode,
      paymentMethod,
      deliveryAddress,
      specialInstructions,
      isEmergency: isEmergency || false,
      deliveryOtp,
      qrCode,
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000), // 1 hour estimate
      statusHistory: [{ status: 'placed', note: 'Order placed by student' }],
    });

    // Handle wallet payment immediately
    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id);
      user.walletBalance -= totalAmount;
      user.totalOrders += 1;
      user.loyaltyPoints += Math.floor(totalAmount / 10);
      await user.save({ validateBeforeSave: false });

      await WalletTransaction.create({
        user: req.user._id,
        type: 'debit',
        amount: totalAmount,
        balance: user.walletBalance,
        description: `Order #${order.orderNumber}`,
        category: 'order_payment',
        orderId: order._id,
      });

      order.paymentStatus = 'paid';
      await order.save();
    }

    // Handle Razorpay
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: order._id.toString(),
        notes: { orderNumber: order.orderNumber },
      });
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    }

    // Update coupon usage
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      appliedCoupon.usedBy.push(req.user._id);
      await appliedCoupon.save();
    }

    // Notify provider
    await Notification.create({
      recipient: provider.user,
      title: '🆕 New Order Received!',
      message: `Order #${order.orderNumber} - ₹${totalAmount}`,
      type: 'order',
      data: { orderId: order._id },
    });

    const io = getIO();
    io.to(`provider_${providerId}`).emit('new_order', { order });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { order, razorpayOrder },
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { student: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('provider', 'businessName kitchenAddress')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({ success: true, data: orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name phone avatar')
      .populate('provider')
      .populate('deliveryPartner', 'name phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization check
    const isOwner = order.student._id.toString() === req.user._id.toString();
    const isProvider = req.user.role === 'provider';
    const isDelivery = req.user.role === 'delivery';
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isProvider && !isDelivery && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('student', 'name');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const validTransitions = {
      placed: ['accepted', 'rejected'],
      accepted: ['preparing'],
      preparing: ['ready'],
      ready: ['picked_up'],
      picked_up: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === 'delivered') {
      order.actualDelivery = new Date();
      // Add loyalty points
      const student = await User.findById(order.student._id);
      student.loyaltyPoints += 20;
      await student.save({ validateBeforeSave: false });
    }

    await order.save();

    // Notify student
    const statusMessages = {
      accepted: '✅ Your order has been accepted!',
      rejected: '❌ Your order was rejected.',
      preparing: '👨‍🍳 Your food is being prepared!',
      ready: '📦 Your order is ready for pickup!',
      picked_up: '🛵 Delivery partner picked up your order!',
      out_for_delivery: '🚀 Your order is out for delivery!',
      delivered: '🎉 Your order has been delivered! Enjoy your meal!',
    };

    await Notification.create({
      recipient: order.student._id,
      title: 'Order Update',
      message: statusMessages[status] || `Order status: ${status}`,
      type: 'order',
      data: { orderId: order._id },
    });

    const io = getIO();
    io.to(`student_${order.student._id}`).emit('order_status_update', { orderId: order._id, status, note });

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

// @POST /api/orders/:id/verify-delivery
exports.verifyDelivery = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.deliveryOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    order.deliveryOtpVerified = true;
    order.status = 'delivered';
    order.actualDelivery = new Date();
    order.statusHistory.push({ status: 'delivered', note: 'OTP verified by delivery partner' });
    await order.save();

    // Credit delivery partner earnings
    if (order.deliveryPartner) {
      const { DeliveryPartner } = require('../models/index');
      await DeliveryPartner.findOneAndUpdate(
        { user: order.deliveryPartner },
        { $inc: { totalDeliveries: 1, totalEarnings: 30, pendingPayout: 30 } }
      );
    }

    res.json({ success: true, message: 'Delivery verified successfully!' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['placed', 'accepted'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by user' });

    // Refund to wallet if paid
    if (order.paymentStatus === 'paid') {
      const user = await User.findById(order.student);
      user.walletBalance += order.totalAmount;
      await user.save({ validateBeforeSave: false });

      await WalletTransaction.create({
        user: order.student,
        type: 'credit',
        amount: order.totalAmount,
        balance: user.walletBalance,
        description: `Refund for Order #${order.orderNumber}`,
        category: 'order_refund',
        orderId: order._id,
      });

      order.paymentStatus = 'refunded';
    }

    await order.save();
    res.json({ success: true, message: 'Order cancelled. Refund processed to wallet.' });
  } catch (error) {
    next(error);
  }
};

// @GET /api/orders/provider/active
exports.getProviderOrders = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { provider: provider._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('student', 'name phone avatar deliveryAddress')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};
