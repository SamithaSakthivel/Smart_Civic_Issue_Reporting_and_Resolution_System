// models/CitizenProfile.js
const mongoose = require("mongoose");

const citizenProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,        // one profile per user
    },
    fullName: { type: String, required: true },
    ward: { type: String },           // ward/zone/location
    phone: { type: String },
    avatarUrl: { type: String },      // URL of uploaded image
    address: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CitizenProfile", citizenProfileSchema);