const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  photo: { url: String, publicId: String },
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  isSpicy: { type: Boolean, default: false },
  allergens: [String],
  voteCount: { type: Number, default: 0 },
});

const menuSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },

  // Menu options
  sabjiOptions: {
    type: [dishSchema],
    validate: [v => v.length >= 3 && v.length <= 6, 'Must provide 3-6 sabji options'],
  },
  dalOptions: {
    type: [dishSchema],
    validate: [v => v.length >= 1 && v.length <= 3, 'Must provide 1-3 dal options'],
  },
  rotiRiceOptions: {
    type: [dishSchema],
    validate: [v => v.length >= 1 && v.length <= 3, 'Must provide 1-3 roti/rice options'],
  },
  sweetDishOptions: {
    type: [dishSchema],
    validate: [v => v.length >= 2 && v.length <= 4, 'Must provide 2-4 sweet dish options'],
  },

  // Finalized menu (after voting)
  finalizedMenu: {
    selectedSabji: [{ type: mongoose.Schema.Types.ObjectId }], // top 3
    selectedDal: { type: mongoose.Schema.Types.ObjectId },
    selectedRotiRice: { type: mongoose.Schema.Types.ObjectId },
    selectedSweetDish: { type: mongoose.Schema.Types.ObjectId },
    finalizedAt: Date,
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'voting_open', 'voting_closed', 'finalized', 'delivered'],
    default: 'draft',
  },

  // Voting window
  votingOpenAt: Date,
  votingCloseAt: Date,

  // Dynamic pricing
  basePrice: { type: Number, required: true },
  finalPrice: Number,
  pricingFactors: {
    demandMultiplier: { type: Number, default: 1.0 },
    specialDishSurcharge: { type: Number, default: 0 },
    discountApplied: { type: Number, default: 0 },
  },

  // Delivery timing
  deliveryStartTime: Date,
  deliveryEndTime: Date,

  // Total votes cast
  totalVotesCast: { type: Number, default: 0 },

  // Notifications sent
  notificationSent: { type: Boolean, default: false },

  // Special tags
  isSpecialDay: { type: Boolean, default: false },
  specialDayNote: String,

}, { timestamps: true });

menuSchema.index({ provider: 1, date: -1 });
menuSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Menu', menuSchema);
