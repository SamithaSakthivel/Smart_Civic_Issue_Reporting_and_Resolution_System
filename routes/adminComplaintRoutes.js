// routes/adminComplaintRoutes.js
const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getAdminComplaints,
  updateAdminComplaint,
  cancelComplaintByAdmin,
  markAdminRead,
} = require("../controllers/adminComplaintController");
const { getComplaintById } = require("../controllers/ComplaintController");

// list complaints
router.get(
  "/complaints",
  verifyJWT,
  verifyAdmin(["adminCouncil"]), // required role(s)
  getAdminComplaints
);

router.get(
  "/complaints/:id",
  verifyJWT,
  verifyAdmin(["adminCouncil"]), // required role(s)
  getComplaintById
);

// update complaint status / target date
router.patch(
  "/complaints/:id",
  verifyJWT,
  verifyAdmin(["adminCouncil"]),
  updateAdminComplaint
);

// cancel complaint
router.patch(
  "/complaints/:id/cancel",
  verifyJWT,
  verifyAdmin(["adminCouncil"]),
  cancelComplaintByAdmin
);

// mark as read
router.patch(
  "/complaints/:id/read",
  verifyJWT,
  verifyAdmin(["adminCouncil"]),
  markAdminRead
);

module.exports = router;