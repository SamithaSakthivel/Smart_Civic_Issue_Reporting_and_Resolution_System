const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayOrderId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'refunded'],
    default: 'verified',
  },
  note: {
    type: String,
    maxlength: 200,
  },
}, { timestamps: true });

contributionSchema.index({ contributor: 1, createdAt: -1 });
contributionSchema.index({ issue: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);
