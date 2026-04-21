const Complaint = require("../models/Complaint");
const User = require("../models/User");

const getMyComplaints = async (req, res) => {
  const email = req.user?.userInfo?.email || req.user?.email;
  if (!email) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findOne({ email }).select("_id").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const complaints = await Complaint.find({ 
    userId: user._id 
  })
  .sort({ createdAt: -1 })
  .lean();

  res.json(complaints);
};

const createComplaint = async (req, res) => {
  try {
    const email = req.user?.userInfo?.email || req.user?.email;
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findOne({ email }).select("_id").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 DUPLICATE PREVENTION: Check same user + same council + recent (24h)
    const recentDuplicate = await Complaint.findOne({
      userId: user._id,
      councilId: req.body.councilId,
      title: { $regex: req.body.title, $options: 'i' },
      description: { $regex: req.body.description.substring(0, 50), $options: 'i' },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: { $ne: 'cancelled' }
    });

    if (recentDuplicate) {
      console.log('🚫 DUPLICATE BLOCKED:', recentDuplicate._id);
      return res.status(409).json({ 
        message: "You recently submitted this issue. Please wait or edit existing complaint.",
        existingId: recentDuplicate._id
      });
    }

    let photoUrls = [];
    
    if (req.file) {
      photoUrls = [`/uploads/${req.file.filename}`];
    } 
    else if (req.body.photoUrl) {
      if (Array.isArray(req.body.photoUrl)) {
        photoUrls = req.body.photoUrl;
      } else {
        photoUrls = [req.body.photoUrl];
      }
    }

    const fields = {
      topic: req.body.topic || "",
      title: req.body.title || "",
      description: req.body.description || "",
      category: req.body.category || "",
      isEmergency: req.body.isEmergency === 'true' || req.body.isEmergency === true || false,
      administration: req.body.administration || "",
      councilId: req.body.councilId || "",
      councilName: req.body.councilName || "",
      lat: req.body.lat ? parseFloat(req.body.lat) : null,
      lng: req.body.lng ? parseFloat(req.body.lng) : null,
      locationAddress: req.body.locationAddress || "",
      visibility: req.body.visibility || 'adminOnly',
      aiSuggestion: req.body.aiSuggestion ? JSON.parse(req.body.aiSuggestion) : null
    };

    if (!fields.title || !fields.description || !fields.administration || !fields.councilId) {
      return res.status(400).json({ message: "Title, description, administration, council required" });
    }

    const complaint = await Complaint.create({
      userId: user._id,
      ...fields,
      photoUrl: photoUrls
    });

    console.log('✅ NEW COMPLAINT CREATED:', complaint._id, 'with photo:', !!photoUrls.length);
    res.status(201).json(complaint);
  } catch (err) {
    console.error('CREATE COMPLAINT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateComplaintPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ message: "photoUrl is required" });
    }

    const email = req.user?.userInfo?.email || req.user?.email;
    const user = await User.findOne({ email }).select("_id").lean();
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const complaint = await Complaint.findOne({
      _id: id,
      userId: user._id,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!Array.isArray(complaint.photoUrl)) {
      complaint.photoUrl = [];
    }

    complaint.photoUrl.push(photoUrl);
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    console.error("updateComplaintPhoto error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const cancelComplaint = async (req, res) => {
  const email = req.user?.userInfo?.email || req.user?.email;
  const user = await User.findOne({ email }).select("_id").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const complaint = await Complaint.findOne({
    _id: req.params.id,
    userId: user._id,
  });

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  if (complaint.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Only pending complaints can be cancelled" });
  }

  await complaint.deleteOne();
  res.status(204).end();
};

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findById(id)
      .populate('userId', 'username')
      .lean()
      .exec();
      
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    res.json(complaint);
  } catch (err) {
    console.error("getComplaintById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const markCitizenNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { citizenNotification: false, citizenRead: true },
      { new: true }
    ).exec();
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  getMyComplaints, 
  createComplaint, 
  cancelComplaint, 
  updateComplaintPhoto,
  getComplaintById,
  markCitizenNotificationRead 
};