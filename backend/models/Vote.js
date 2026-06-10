const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },

  // Voted dishes
  selectedSabji: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }], // max 3

  selectedSweetDish: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  selectedDal: mongoose.Schema.Types.ObjectId,
  selectedRotiRice: mongoose.Schema.Types.ObjectId,

  votedAt: { type: Date, default: Date.now },

}, { timestamps: true });

// One vote per student per menu
voteSchema.index({ student: 1, menu: 1 }, { unique: true });
voteSchema.index({ menu: 1 });
voteSchema.index({ provider: 1 });

module.exports = mongoose.model('Vote', voteSchema);
