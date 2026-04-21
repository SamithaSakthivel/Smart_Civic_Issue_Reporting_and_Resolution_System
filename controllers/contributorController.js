const ContributorProfile = require('../models/ContributorProfile');
const Contribution = require('../models/Contribution');
// ✅ FIX: Was require('../models/Issue') — that model does not exist.
// The actual model is Complaint.js which exports mongoose.model("Complaint", ...)
const Complaint = require('../models/Complaint');

// ─── GET MY PROFILE ──────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    let profile = await ContributorProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await ContributorProfile.create({ user: req.user.id });
    }
    res.json({ profile, user: req.user });
  } catch (err) {
    console.error('getMyProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── UPDATE MY PROFILE ───────────────────────────────────────────────────────
const updateMyProfile = async (req, res) => {
  const { fullName, phone, address, avatarUrl, bankAccount } = req.body;
  try {
    const profile = await ContributorProfile.findOneAndUpdate(
      { user: req.user.id },
      { fullName, phone, address, avatarUrl, bankAccount },
      { new: true, upsert: true }
    );
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET ISSUES AVAILABLE FOR CONTRIBUTION ───────────────────────────────────
const getContributorIssues = async (req, res) => {
  try {
    // ✅ FIX: Query Complaint model (not Issue). 
    // Filter by visibility = 'contributors' or 'public', and not cancelled.
    const issues = await Complaint.find({
      visibility: { $in: ['contributors', 'public'] },
      status: { $ne: 'cancelled' },
    })
      .populate('councilId', 'username')
      .sort({ isEmergency: -1, createdAt: -1 })
      .lean();

    res.json(issues);
  } catch (err) {
    console.error('getContributorIssues:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── RECORD A PAYMENT ────────────────────────────────────────────────────────
const recordContribution = async (req, res) => {
  const { issueId, amount, razorpayPaymentId, razorpayOrderId, note } = req.body;
  if (!issueId || !amount || !razorpayPaymentId) {
    return res.status(400).json({ message: 'issueId, amount and razorpayPaymentId are required' });
  }

  try {
    const existing = await Contribution.findOne({ razorpayPaymentId });
    if (existing) return res.json({ contribution: existing, newBadges: [] });

    const contribution = await Contribution.create({
      contributor: req.user.id,
      // ✅ FIX: Contribution.issue references the Complaint _id
      issue: issueId,
      amount,
      razorpayPaymentId,
      razorpayOrderId,
      note,
      status: 'verified',
    });

    // Update contributorCount on the complaint
    await Complaint.findByIdAndUpdate(issueId, {
      $inc: { contributorCount: 1 },
    });

    let profile = await ContributorProfile.findOne({ user: req.user.id });
    if (!profile) profile = await ContributorProfile.create({ user: req.user.id });

    const newBadges = await profile.recalculateBadges(Contribution);

    const now = new Date();
    const last = profile.lastContributedAt;
    if (last) {
      const daysDiff = (now - last) / (1000 * 60 * 60 * 24);
      profile.streak = daysDiff <= 30 ? profile.streak + 1 : 1;
    } else {
      profile.streak = 1;
    }
    profile.lastContributedAt = now;

    await profile.save();

    res.status(201).json({ contribution, newBadges, profile });
  } catch (err) {
    console.error('recordContribution:', err);
    if (err.code === 11000) return res.status(409).json({ message: 'Payment already recorded' });
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── MY CONTRIBUTION HISTORY ─────────────────────────────────────────────────
const getMyContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({
      contributor: req.user.id,
      status: 'verified',
    })
      .populate('issue', 'title category status contributorCount')
      .sort({ createdAt: -1 })
      .lean();

    res.json(contributions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── MY STATS (for charts) ───────────────────────────────────────────────────
const getMyStats = async (req, res) => {
  try {
    const contributions = await Contribution.find({
      contributor: req.user.id,
      status: 'verified',
    })
      .populate('issue', 'title category status')
      .sort({ createdAt: 1 })
      .lean();

    const monthly = {};
    contributions.forEach(c => {
      const key = new Date(c.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthly[key] = (monthly[key] || 0) + c.amount;
    });

    const byCategory = {};
    contributions.forEach(c => {
      const cat = c.issue?.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + c.amount;
    });

    const heatmap = {};
    contributions.forEach(c => {
      const day = new Date(c.createdAt).toISOString().split('T')[0];
      heatmap[day] = (heatmap[day] || 0) + c.amount;
    });

    const resolvedIssues = contributions
      .filter(c => c.issue?.status === 'resolved')
      .map(c => c.issue);
    const uniqueResolved = [...new Map(resolvedIssues.map(i => [i?._id?.toString(), i])).values()].filter(Boolean);

    const profile = await ContributorProfile.findOne({ user: req.user.id });

    res.json({
      totalContributed: contributions.reduce((s, c) => s + c.amount, 0),
      totalCount: contributions.length,
      monthly,
      byCategory,
      heatmap,
      resolvedIssues: uniqueResolved,
      badges: profile?.badges || [],
      streak: profile?.streak || 0,
    });
  } catch (err) {
    console.error('getMyStats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getContributorIssues,
  recordContribution,
  getMyContributions,
  getMyStats,
};
