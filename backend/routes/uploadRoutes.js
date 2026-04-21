const express = require("express");
const multer = require("multer");
const path = require("path");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// where and how to store files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");            // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname)); // 12345.jpg
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.use(verifyJWT);

// POST /uploads/photo
router.post("/photo", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // public URL for this file
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

module.exports = router;