const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: () => 'HMC' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2,4).toUpperCase(),
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Order items
  items: [{
    name: String,
    type: { type: String, enum: ['sabji', 'dal', 'roti_rice', 'sweet_dish'] },
    quantity: { type: Number, default: 1 },
    price: Number,
  }],

  // Pricing
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 20 },
  discount: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  platformFee: { type: Number, default: 5 },
  totalAmount: { type: Number, required: true },

  // Coupon
  couponCode: String,

  // Payment
  paymentMethod: {
    type: String,
    enum: ['wallet', 'razorpay', 'cod', 'subscription'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,

  // Order status
  status: {
    type: String,
    enum: ['placed', 'accepted', 'rejected', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],

  // Delivery
  deliveryAddress: {
    hostelName: String,
    roomNumber: String,
    street: String,
    city: String,
    coordinates: { lat: Number, lng: Number },
  },
  deliveryOtp: String,
  deliveryOtpVerified: { type: Boolean, default: false },
  estimatedDelivery: Date,
  actualDelivery: Date,

  // QR Code for pickup
  qrCode: String,

  // Special instructions
  specialInstructions: String,

  // Rating
  isRated: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  review: String,

  // Subscription linked
  isSubscriptionOrder: { type: Boolean, default: false },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },

  // Emergency order
  isEmergency: { type: Boolean, default: false },

}, { timestamps: true });

orderSchema.index({ student: 1, createdAt: -1 });
orderSchema.index({ provider: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
