// models/User.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  roles: {
    type: [String],
    enum: ["citizen", "adminCouncil", "contributor"],  // ✅ Added contributor
    default: ['citizen'],
  },

  active: {
    type: Boolean,
    default: true,
  },
  councilName: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  contributorStats: {
    totalContributed: { type: Number, default: 0 },
    rewards: [{ type: String }], // "bronze", "silver", "gold"
    bankAccount: String,
  },
  
  // ✅ Citizen profile fields (if you want)
  profile: {
    fullName: String,
    phone: String,
    ward: String,
    address: String,
    avatarUrl: String,
  },
  issueVisibility: { type: String, enum: ["adminOnly", "public", "contributors"], default: "adminOnly" }
})

module.exports = mongoose.model('User', userSchema, 'civicUsers');