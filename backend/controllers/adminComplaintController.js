// controllers/adminComplaintController.js
const Complaint = require("../models/Complaint");
const User = require("../models/User");

// controllers/adminComplaintController.js
const getAdminComplaints = async (req, res) => {
  try {
    const email = req.user?.userInfo?.email;
    const adminUser = await User.findOne({ email }).lean();
    const complaints = await Complaint.find({
      councilId: adminUser._id
    })
      .populate('userId', 'username email')  // ✅ FIXED: username field
      .sort({ createdAt: -1 })
      .lean();

    const complaintsWithNames = complaints.map(complaint => ({
      ...complaint,
      citizenName: complaint.userId?.username || complaint.userId?.email || 'Anonymous'  // ✅ PRIORITY: username > email
    }));

    res.json(complaintsWithNames);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// PATCH /admin/complaints/:id
// body: { status, targetDate }
const updateAdminComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, targetDate } = req.body;

    const complaint = await Complaint.findById(id).exec();
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (status) {
      complaint.status = status;
    }
    if (targetDate) {
      complaint.targetDate = targetDate;
    }

    await complaint.save();

    return res.json(complaint);
  } catch (err) {
    console.error("updateAdminComplaint error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW VERSION - REPLACE WITH THIS:
const cancelComplaintByAdmin = async (req, res) => {
  console.log('🔥 CANCEL API HIT:', req.params.id, req.body.reason); // ✅ DEBUG

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findById(id).exec();
    console.log('📋 FOUND:', complaint?._id, complaint?.status); // ✅ DEBUG

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "cancelled";
    complaint.cancelReason = reason;
    complaint.cancelReasonTimestamp = new Date();
    complaint.cancelByAdmin = req.user?.userInfo?.name || 'Admin Council';
    complaint.citizenNotification = true;

    await complaint.save();
    console.log('✅ SAVED:', complaint.status, complaint.cancelReason); // ✅ DEBUG

    return res.json({ message: 'Success', complaint });
  } catch (err) {
    console.error('💥 ERROR:', err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /admin/complaints/:id/read
// controllers/adminComplaintController.js
const markAdminRead = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { adminUnread: false },
      { new: true, runValidators: true }  // return UPDATED document
    ).exec();

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json(complaint);  // <- must return the updated complaint
  } catch (err) {
    console.error("markAdminRead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAdminComplaints,
  updateAdminComplaint,
  cancelComplaintByAdmin,
  markAdminRead,
};