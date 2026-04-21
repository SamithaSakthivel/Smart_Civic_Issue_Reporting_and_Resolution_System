// routes/queryRoutes.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Rate limiting — max 5 queries per IP per hour
const rateLimit = require('express-rate-limit');
const queryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many queries submitted. Please try again later.' },
});

router.post('/', queryLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ message: 'Message must be at least 10 characters.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,   // your Gmail address
        pass: process.env.GMAIL_PASS,   // your Gmail App Password
      },
    });

    // ── Email to YOU (spsamitha30@gmail.com) ──────────────────────
    await transporter.sendMail({
      from: `"CivicHub Queries" <${process.env.GMAIL_USER}>`,
      to: 'spsamitha30@gmail.com',
      replyTo: email,   // so when you hit Reply it goes directly to the user
      subject: `📬 New Query from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1228; color: #e8efff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(148,183,255,0.15);">
          <div style="background: linear-gradient(135deg, #0f1b3d, #1a2a5e); padding: 28px 32px; border-bottom: 1px solid rgba(34,211,238,0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 10px; height: 10px; background: #22d3ee; border-radius: 3px; box-shadow: 0 0 12px #22d3ee;"></div>
              <span style="font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em;">CivicHub Pro</span>
            </div>
            <h2 style="margin: 12px 0 4px; font-size: 1.4rem; color: #fff;">New Query Received</h2>
            <p style="margin: 0; color: #a6b3d0; font-size: 0.9rem;">Someone submitted a query through the website</p>
          </div>
          <div style="padding: 28px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6e7a99; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; width: 80px;">Name</td>
                <td style="padding: 10px 0; color: #e8efff; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6e7a99; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #22d3ee; text-decoration: none;">${email}</a></td>
              </tr>
            </table>
            <div style="margin-top: 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(148,183,255,0.12); border-radius: 12px; padding: 18px 20px;">
              <p style="margin: 0 0 8px; color: #6e7a99; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
              <p style="margin: 0; color: #e8efff; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 24px;">
              <a href="mailto:${email}?subject=Re: Your CivicHub Query" style="display: inline-block; background: linear-gradient(135deg, #22d3ee, #7c5cff); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 0.9rem;">Reply to ${name} →</a>
            </div>
          </div>
          <div style="padding: 18px 32px; border-top: 1px solid rgba(148,183,255,0.1); color: #6e7a99; font-size: 0.78rem;">
            Sent via CivicHub Pro contact form • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      `,
    });

    // ── Confirmation email to the USER ────────────────────────────
    await transporter.sendMail({
      from: `"CivicHub Pro" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `We received your query, ${name}! 🙌`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1228; color: #e8efff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(148,183,255,0.15);">
          <div style="background: linear-gradient(135deg, #0f1b3d, #1a2a5e); padding: 28px 32px; border-bottom: 1px solid rgba(34,211,238,0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 10px; height: 10px; background: #22d3ee; border-radius: 3px; box-shadow: 0 0 12px #22d3ee;"></div>
              <span style="font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em;">CivicHub Pro</span>
            </div>
          </div>
          <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <div style="font-size: 2.5rem; margin-bottom: 12px;">✅</div>
              <h2 style="margin: 0 0 8px; font-size: 1.5rem; color: #fff;">We got your message!</h2>
              <p style="margin: 0; color: #a6b3d0;">Hi ${name}, thanks for reaching out.</p>
            </div>
            <div style="background: rgba(34,211,238,0.06); border: 1px solid rgba(34,211,238,0.2); border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #6e7a99; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em;">Your message</p>
              <p style="margin: 0; color: #e8efff; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #a6b3d0; line-height: 1.7; margin: 0 0 8px;">We'll review your query and get back to you at <strong style="color: #22d3ee;">${email}</strong> within <strong style="color: #f5c451;">24–48 hours</strong> on working days.</p>
            <p style="color: #6e7a99; font-size: 0.88rem; margin: 0;">In the meantime, feel free to explore CivicHub and report any civic issues in your area.</p>
          </div>
          <div style="padding: 18px 32px; border-top: 1px solid rgba(148,183,255,0.1); color: #6e7a99; font-size: 0.78rem; text-align: center;">
            © CivicHub Pro • You're receiving this because you submitted a query on our website
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Query sent successfully!' });
  } catch (err) {
    console.error('Query email error:', err);
    res.status(500).json({ message: 'Failed to send query. Please try again.' });
  }
});

module.exports = router;