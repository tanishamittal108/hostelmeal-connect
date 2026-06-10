// ===================== routes/reviews.js =====================
const express = require('express');
const reviewRouter = express.Router();
const { Review } = require('../models/index');
const Provider = require('../models/Provider');
const { protect, authorize } = require('../middleware/auth');

reviewRouter.post('/', protect, authorize('student'), async (req, res, next) => {
  try {
    const { providerId, orderId, rating, title, comment, tags } = req.body;
    const review = await Review.create({ student: req.user._id, provider: providerId, order: orderId, rating, title, comment, tags });
    // Update provider avg rating
    const stats = await Review.aggregate([{ $match: { provider: review.provider } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
    if (stats.length) {
      await Provider.findByIdAndUpdate(providerId, { avgRating: Math.round(stats[0].avg * 10) / 10, totalRatings: stats[0].count });
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
});

reviewRouter.get('/provider/:providerId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId, isFlagged: false })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

// ===================== routes/notifications.js =====================
const notifRouter = express.Router();
const { Notification } = require('../models/index');

notifRouter.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) { next(err); }
});

notifRouter.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

notifRouter.put('/:id/read', protect, async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ===================== routes/subscriptions.js =====================
const subRouter = express.Router();
const { Subscription } = require('../models/index');
//const Provider = require('../models/Provider');

subRouter.post('/', protect, authorize('student'), async (req, res, next) => {
  try {
    const { providerId, plan, startDate, mealsPerDay, autoRenew } = req.body;
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (plan === 'monthly' ? 30 : 7));

    const days = plan === 'monthly' ? 30 : 7;
    const totalAmount = days * mealsPerDay * provider.basePrice;

    const subscription = await Subscription.create({
      student: req.user._id, provider: providerId, plan, startDate: start, endDate: end,
      mealsPerDay, totalAmount, autoRenew: autoRenew || false,
    });
    res.status(201).json({ success: true, data: subscription });
  } catch (err) { next(err); }
});

subRouter.get('/my', protect, async (req, res, next) => {
  try {
    const subs = await Subscription.find({ student: req.user._id })
      .populate({ path: 'provider', populate: { path: 'user', select: 'name avatar' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  } catch (err) { next(err); }
});

subRouter.put('/:id/pause', protect, async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id },
      { status: 'paused', $push: { pauseHistory: { pausedAt: new Date(), reason: req.body.reason } } },
      { new: true }
    );
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
});

subRouter.put('/:id/resume', protect, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, student: req.user._id });
    if (sub && sub.pauseHistory.length) {
      sub.pauseHistory[sub.pauseHistory.length - 1].resumedAt = new Date();
    }
    sub.status = 'active';
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
});

// ===================== routes/chat.js =====================
const chatRouter = express.Router();
const { Chat } = require('../models/index');
const { getIO } = require('../socket/socketManager');

chatRouter.get('/', protect, async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id, isActive: true })
      .populate('participants', 'name avatar role')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, data: chats });
  } catch (err) { next(err); }
});

chatRouter.get('/:chatId/messages', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate('participants', 'name avatar');
    if (!chat || !chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: chat });
  } catch (err) { next(err); }
});

chatRouter.post('/send', protect, async (req, res, next) => {
  try {
    const { recipientId, content, type } = req.body;
    let chat = await Chat.findOne({ participants: { $all: [req.user._id, recipientId] } });
    if (!chat) {
      chat = await Chat.create({ participants: [req.user._id, recipientId], messages: [] });
    }
    const message = { sender: req.user._id, content, type: type || 'text' };
    chat.messages.push(message);
    chat.lastMessage = content;
    chat.lastMessageAt = new Date();
    await chat.save();

    const io = getIO();
    io.to(`user_${recipientId}`).emit('new_message', { chatId: chat._id, message });

    res.json({ success: true, data: message });
  } catch (err) { next(err); }
});

// ===================== routes/coupons.js =====================
const couponRouter = express.Router();
const { Coupon } = require('../models/index');

couponRouter.get('/validate/:code', protect, async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usedBy.includes(req.user._id)) return res.status(400).json({ success: false, message: 'Already used' });
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
});

couponRouter.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) { next(err); }
});

couponRouter.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
});

// ===================== routes/delivery.js =====================
const deliveryRouter = express.Router();
const { DeliveryPartner } = require('../models/index');
const Order = require('../models/Order');

deliveryRouter.get('/active', protect, authorize('delivery'), async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id, status: { $in: ['picked_up', 'out_for_delivery'] } })
      .populate('student', 'name phone')
      .populate('provider', 'businessName kitchenAddress');
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

deliveryRouter.get('/earnings', protect, authorize('delivery'), async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    const completedOrders = await Order.countDocuments({ deliveryPartner: req.user._id, status: 'delivered' });
    res.json({ success: true, data: { ...partner?.toObject(), completedOrders } });
  } catch (err) { next(err); }
});

deliveryRouter.put('/location', protect, authorize('delivery'), async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    await DeliveryPartner.findOneAndUpdate({ user: req.user._id }, { currentLocation: { lat, lng } });
    const { getIO } = require('../socket/socketManager');
    getIO().emit('delivery_location_update', { deliveryPartnerId: req.user._id, lat, lng });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ===================== routes/payments.js =====================
const payRouter = express.Router();
const crypto2 = require('crypto');

payRouter.post('/verify', protect, async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const expectedSig = crypto2
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) { next(err); }
});

// Export all routers
module.exports = {
  reviewRouter,
  notifRouter,
  subRouter,
  chatRouter,
  couponRouter,
  deliveryRouter,
  payRouter,
};
