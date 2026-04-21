// routes/authRoutes.js - UPDATED ✅
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const passport = require('../config/passport')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/User') // ✅ Add this import

// ✅ YOUR EXISTING ROUTES
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/refresh',authController.refresh)
router.delete('/users/me', authController.logout); // ✅ Uses logout controller
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/?error=google-auth-failed',
  }),
  authController.googleCallback
)

router.post('/forgot-password', async (req, res) => {
  console.log('🚀 FORGOT PASSWORD HIT:', req.body);
  
  try {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    console.log('🔍 User found:', user ? user.email : 'NO USER');
    
    if (!user) return res.status(200).json({ message: 'Check your Gmail!' });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    console.log('✅ Token saved for:', user.email);

    // ✅ OFFICIAL DOCS SYNTAX - createTransport + let transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'spsamitha30@gmail.com',     // ← YOUR GMAIL
        pass: 'huhgnhsniaylodcw'      // ← YOUR APP PASSWORD
      }
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      from: '"Citizen Dashboard" <spsamitha30@gmail.com>',
      to: user.email,
      subject: '🔐 Password Reset',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click <a href="${resetUrl}">here</a> to reset your password</p>
        <p><strong>Link expires in 1 hour</strong></p>
      `
    });

    console.log('✅ EMAIL SENT!');
    res.json({ message: 'Reset link sent to your Gmail inbox!' });

  } catch (error) {
    console.error('💥 ERROR:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({ message: 'Password reset successful!' });

  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router