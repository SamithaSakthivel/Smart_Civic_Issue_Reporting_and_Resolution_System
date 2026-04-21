const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const Complaint = require("../models/Complaint");
const complaintController = require("../controllers/ComplaintController");
const multer = require("multer");  // ✅ DIRECT MULTER!
const path = require("path");

// 🔥 MULTER CONFIG - SAME AS uploadRoutes!
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");            
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ✅ YOUR contributor-issues route - UNCHANGED!
router.get('/contributor-issues', verifyJWT, async (req, res) => {
  try {
    console.log('🔍 Contributor endpoint hit!');
    console.log('🔍 DEBUG - req.user:', req.user);
    
    if (!req.user?.userInfo || !req.user.userInfo.roles.includes('contributor')) {
      console.log('❌ NO CONTRIBUTOR ROLE - req.user.userInfo:', req.user?.userInfo);
      return res.status(403).json({ message: 'Contributor access only' });
    }
    
    console.log('🔍 User:', req.user.userInfo.username, 'Roles:', req.user.userInfo.roles);
    
    const issues = await Complaint.find({
      visibility: { $in: ['contributors', 'public'] },
      status: { $ne: 'cancelled' }
    }).populate('councilId');
    
    console.log('🔍 Found issues:', issues.length);
    res.json(issues);
  } catch (error) {
    console.error('Contributor issues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ YOUR Global middleware - UNCHANGED!
router.use(verifyJWT);

// ✅ YOUR ROUTES - ONLY POST got multer!
router.route("/my")
  .get(complaintController.getMyComplaints);

router.route("/")
  .post(upload.single('photo'), complaintController.createComplaint);  // ✅ WORKS NOW!

router.route('/:id')
  .get(complaintController.getComplaintById)
  .patch(complaintController.updateComplaintPhoto)
  .delete(complaintController.cancelComplaint);
   
router.patch('/:id/read-notification', complaintController.markCitizenNotificationRead);

module.exports = router;