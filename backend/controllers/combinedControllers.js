// ======================== ANALYTICS CONTROLLER ========================
const Order = require('../models/Order');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Menu = require('../models/Menu');
const { Subscription, Review, WalletTransaction } = require('../models/index');

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalProviders, totalOrders, totalRevenue,
      newUsers, newOrders, activeSubscriptions,
      ordersByStatus, revenueByDay, topProviders, topDishes
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Provider.countDocuments({ status: 'approved' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Subscription.countDocuments({ status: 'active' }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$provider', totalOrders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { totalOrders: -1 } }, { $limit: 5 },
        { $lookup: { from: 'providers', localField: '_id', foreignField: '_id', as: 'provider' } },
        { $unwind: '$provider' }
      ]),
      Menu.aggregate([
        { $unwind: '$sabjiOptions' },
        { $group: { _id: '$sabjiOptions.name', totalVotes: { $sum: '$sabjiOptions.voteCount' } } },
        { $sort: { totalVotes: -1 } }, { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers, totalProviders, totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          newUsers, newOrders, activeSubscriptions,
        },
        ordersByStatus,
        revenueByDay,
        topProviders,
        topDishes,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProviderAnalytics = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const { range = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000);

    const [orders, revenueByDay, ratingDist, topDishes] = await Promise.all([
      Order.aggregate([
        { $match: { provider: provider._id, createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { provider: provider._id, createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Review.aggregate([
        { $match: { provider: provider._id } },
        { $group: { _id: '$rating', count: { $sum: 1 } } }
      ]),
      Menu.aggregate([
        { $match: { provider: provider._id } },
        { $unwind: '$sabjiOptions' },
        { $group: { _id: '$sabjiOptions.name', totalVotes: { $sum: '$sabjiOptions.voteCount' } } },
        { $sort: { totalVotes: -1 } }, { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: { provider, orders, revenueByDay, ratingDist, topDishes }
    });
  } catch (error) {
    next(error);
  }
};

// ======================== ADMIN CONTROLLER ========================
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search, isBanned } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(filter)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: reason },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User banned', data: user });
  } catch (error) {
    next(error);
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: undefined },
      { new: true }
    );
    res.json({ success: true, message: 'User unbanned', data: user });
  } catch (error) {
    next(error);
  }
};

exports.getPendingProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({ status: 'pending' })
      .populate('user', 'name email phone createdAt');
    res.json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
};

exports.approveProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verifiedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      to: provider.user.email,
      subject: '🎉 Your HostelMeal Connect Provider Account is Approved!',
      html: `<h2>Congratulations ${provider.user.name}!</h2><p>Your provider account has been approved. Start adding your daily menus!</p>`,
    });

    res.json({ success: true, message: 'Provider approved', data: provider });
  } catch (error) {
    next(error);
  }
};

exports.rejectProvider = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    res.json({ success: true, message: 'Provider rejected', data: provider });
  } catch (error) {
    next(error);
  }
};

// ======================== WALLET CONTROLLER ========================
exports.getWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance loyaltyPoints');
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: { balance: user.walletBalance, loyaltyPoints: user.loyaltyPoints, transactions } });
  } catch (error) {
    next(error);
  }
};

exports.topUpWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 10 || amount > 10000) {
      return res.status(400).json({ success: false, message: 'Amount must be between ₹10 and ₹10,000' });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

    const rzpOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `wallet_${req.user._id}_${Date.now()}`,
      notes: { type: 'wallet_topup', userId: req.user._id.toString() },
    });

    res.json({ success: true, data: { razorpayOrder: rzpOrder, amount } });
  } catch (error) {
    next(error);
  }
};

exports.confirmWalletTopUp = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const user = await User.findById(req.user._id);
    user.walletBalance += amount;
    await user.save({ validateBeforeSave: false });

    await WalletTransaction.create({
      user: req.user._id,
      type: 'credit',
      amount,
      balance: user.walletBalance,
      description: 'Wallet top-up via Razorpay',
      category: 'top_up',
      reference: razorpayPaymentId,
    });

    res.json({ success: true, message: `₹${amount} added to wallet!`, data: { balance: user.walletBalance } });
  } catch (error) {
    next(error);
  }
};
