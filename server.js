require('dotenv').config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/dbConn");
const cors = require('cors')
const corsOptions = require('./config/corsOptions');
const passport = require('./config/passport');
const citizenProfileRoutes = require('./routes/citizenProfileRoutes')
const Complaint = require("./models/Complaint");
const mongoose = require("mongoose");
connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));


app.use("/uploads", require("./routes/uploadRoutes"));
app.use('/auth', require('./routes/authRoutes'));
app.use("/citizen-profile", citizenProfileRoutes);
app.use('/complaints', require("./routes/ComplaintRoutes"));
app.use("/councils", require("./routes/councilRoutes"));
app.use("/api/admin", require("./routes/adminComplaintRoutes"));
app.use('/api/query', require('./routes/queryRoutes'));

// ✅ FIX: Register contributor routes (was completely missing)
app.use('/contributor', require('./routes/contributorRoutes'));

const aiController = require('./controllers/aiController');
const multer = require("multer");
const path = require("path");

const aiStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const aiUpload = multer({ storage: aiStorage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/verify-photo', aiUpload.single('photo'), aiController.verifyPhoto);
app.post('/api/auto-categorize', aiController.autoCategorize);
app.post('/api/check-duplicates', aiController.checkDuplicates);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
