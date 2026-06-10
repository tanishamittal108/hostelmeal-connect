const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  description: { type: String, maxlength: 500 },

  // Verification
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  fssaiNumber: { type: String },
  fssaiDocument: { url: String, publicId: String },
  licenseDocument: { url: String, publicId: String },
  verifiedAt: Date,
  rejectionReason: String,

  // Kitchen details
  kitchenAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number },
  },
  kitchenPhotos: [{ url: String, publicId: String }],
  kitchenVideo: { url: String, publicId: String },

  // Serving details
  maxCapacity: { type: Number, default: 50 }, // max meals per day
  currentCapacity: { type: Number, default: 0 },
  cuisineTypes: [{ type: String }],
  isVegetarianOnly: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  availableDays: [{
    type: String,
    enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  }],
  serviceRadius: { type: Number, default: 5 }, // in km

  // Pricing
  basePrice: { type: Number, default: 80 }, // per meal
  subscriptionPrice: { type: Number, default: 2000 }, // monthly

  // Ratings
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  // Earnings
  totalEarnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String,
  },

  // Delivery partners linked
  linkedDeliveryPartners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
  }],

  // Stats
  totalOrdersServed: { type: Number, default: 0 },
  totalMenusPosted: { type: Number, default: 0 },

  // Badges
  badges: [{
    name: String,
    icon: String,
    awardedAt: Date,
  }],

  // Subscription plan they're on
  platformPlan: {
    type: String,
    enum: ['basic', 'pro', 'premium'],
    default: 'basic',
  },

}, { timestamps: true });

providerSchema.index({ 'kitchenAddress.coordinates': '2dsphere' });
providerSchema.index({ status: 1 });
providerSchema.index({ avgRating: -1 });

module.exports = mongoose.model('Provider', providerSchema);
