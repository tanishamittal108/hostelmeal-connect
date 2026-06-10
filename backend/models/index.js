const mongoose = require('mongoose');

// ===================== SUBSCRIPTION =====================
const subscriptionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  plan: { type: String, enum: ['monthly', 'weekly', 'custom'], default: 'monthly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused', 'expired', 'cancelled'], default: 'active' },
  mealsPerDay: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  daysSkipped: [{ type: Date }],
  pauseHistory: [{
    pausedAt: Date,
    resumedAt: Date,
    reason: String,
  }],
  autoRenew: { type: Boolean, default: false },
  razorpaySubscriptionId: String,
  streakDays: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
}, { timestamps: true });

subscriptionSchema.index({ student: 1, status: 1 });
subscriptionSchema.index({ provider: 1, status: 1 });

// ===================== NOTIFICATION =====================
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['order', 'vote', 'payment', 'subscription', 'review', 'system', 'promo', 'delivery'],
    default: 'system',
  },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  icon: String,
  actionUrl: String,
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ===================== REVIEW =====================
const reviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 500 },
  photos: [{ url: String, publicId: String }],
  tags: [String], // ['tasty', 'on-time', 'hygienic', etc.]
  providerReply: {
    message: String,
    repliedAt: Date,
  },
  isVerified: { type: Boolean, default: true },
  helpfulCount: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
}, { timestamps: true });

reviewSchema.index({ provider: 1, rating: -1 });
reviewSchema.index({ student: 1 });
reviewSchema.index({ order: 1 }, { unique: true });

// ===================== CHAT =====================
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  type: { type: String, enum: ['text', 'image', 'order_ref'], default: 'text' },
  imageUrl: String,
  orderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

chatSchema.index({ participants: 1 });

// ===================== WALLET TRANSACTION =====================
const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  description: { type: String, required: true },
  reference: String,
  category: {
    type: String,
    enum: ['order_payment', 'order_refund', 'referral_bonus', 'loyalty_reward', 'cashback', 'withdrawal', 'top_up'],
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
}, { timestamps: true });

walletTransactionSchema.index({ user: 1, createdAt: -1 });

// ===================== COUPON =====================
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  maxDiscount: Number,
  minOrderAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicableTo: { type: String, enum: ['all', 'new_users', 'specific_provider'], default: 'all' },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ validUntil: 1, isActive: 1 });

// ===================== DELIVERY PARTNER =====================
const deliveryPartnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vehicleType: { type: String, enum: ['bicycle', 'scooter', 'motorcycle', 'foot'] },
  vehicleNumber: String,
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  currentLocation: { lat: Number, lng: Number },
  zone: String,
  linkedHotels: [{ name: String, address: String, coordinates: { lat: Number, lng: Number } }],
  activeOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  bankDetails: { accountNumber: String, ifscCode: String, upiId: String },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  idProof: { url: String, publicId: String },
}, { timestamps: true });

module.exports = {
  Subscription: mongoose.model('Subscription', subscriptionSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Review: mongoose.model('Review', reviewSchema),
  Chat: mongoose.model('Chat', chatSchema),
  WalletTransaction: mongoose.model('WalletTransaction', walletTransactionSchema),
  Coupon: mongoose.model('Coupon', couponSchema),
  DeliveryPartner: mongoose.model('DeliveryPartner', deliveryPartnerSchema),
};
