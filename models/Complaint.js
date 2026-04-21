const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    photoUrl: [String], // we’ll store a URL or path for now
    isEmergency: { type: Boolean, default: false },
    administration: { type: String, required: true },
    councilId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // or "Council" if you create a separate model
  required: true,
},
councilName: { type: String, required: true }, // e.g. "Cuddalore Council"
    // status to be updated by admin council later
    status: {
      type: String,
      enum: ["pending", "inprogress", "resolved","cancelled"],
      default: "pending",
    },
    adminUnread:{
      type:Boolean,
      default:true
    },
    // ADD THESE FIELDS to your Complaint schema:
citizenNotification: { 
  type: Boolean, 
  default: false 
},
cancelReason: {
  type: String,
  default: ""
},
cancelReasonTimestamp: {
  type: Date
},
cancelByAdmin: {
  type: String,
  default: ""
},
citizenRead:{
  type:Boolean,
  default:false
},
visibility: { 
  type: String, 
  enum: ["adminOnly", "public", "contributors"], 
  default: "adminOnly" 
},
contributions: [{
    contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
    contributedAt: { type: Date, default: Date.now },
    comment: String
  }],
  contributorCount: { type: Number, default: 0 },
  lat: { type: Number },
  lng: { type: Number },
  locationAddress: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);