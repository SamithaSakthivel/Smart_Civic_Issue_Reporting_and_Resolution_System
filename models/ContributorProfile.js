const mongoose = require('mongoose');

const BADGES = {
  FIRST_CONTRIBUTION: {
    id: 'first_contribution',
    name: 'First Step',
    description: 'Made your first contribution',
    icon: '🌱',
    color: '#10b981',
  },
  CONSISTENT_5: {
    id: 'consistent_5',
    name: 'Consistent Supporter',
    description: 'Contributed 5 times',
    icon: '⭐',
    color: '#f59e0b',
  },
  CONSISTENT_10: {
    id: 'consistent_10',
    name: 'Dedicated Citizen',
    description: 'Contributed 10 times',
    icon: '🏅',
    color: '#3b82f6',
  },
  CONSISTENT_25: {
    id: 'consistent_25',
    name: 'Community Champion',
    description: 'Contributed 25 times',
    icon: '🏆',
    color: '#8b5cf6',
  },
  AMOUNT_1000: {
    id: 'amount_1000',
    name: 'Bronze Donor',
    description: 'Contributed ₹1,000 total',
    icon: '🥉',
    color: '#cd7f32',
  },
  AMOUNT_5000: {
    id: 'amount_5000',
    name: 'Silver Donor',
    description: 'Contributed ₹5,000 total',
    icon: '🥈',
    color: '#94a3b8',
  },
  AMOUNT_10000: {
    id: 'amount_10000',
    name: 'Gold Donor',
    description: 'Contributed ₹10,000 total',
    icon: '🥇',
    color: '#f59e0b',
  },
  AMOUNT_50000: {
    id: 'amount_50000',
    name: 'Diamond Patron',
    description: 'Contributed ₹50,000 total',
    icon: '💎',
    color: '#22d3ee',
  },
  MULTI_CATEGORY: {
    id: 'multi_category',
    name: 'All-Rounder',
    description: 'Contributed to 3+ different categories',
    icon: '🌐',
    color: '#ec4899',
  },
  ISSUE_RESOLVER: {
    id: 'issue_resolver',
    name: 'Issue Resolver',
    description: 'Contributed to a fully-funded issue',
    icon: '✅',
    color: '#10b981',
  },
};

const contributorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  bankAccount: { type: String, default: '' },

  // Aggregated stats — updated on every contribution
  totalContributed: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastContributedAt: { type: Date, default: null },

  badges: [{
    id: { type: String },
    name: { type: String },
    description: { type: String },
    icon: { type: String },
    color: { type: String },
    earnedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

contributorProfileSchema.statics.BADGES = BADGES;

// Recalculate badges after each contribution
contributorProfileSchema.methods.recalculateBadges = async function(Contribution) {
  const contributions = await Contribution.find({ contributor: this.user }).populate('issue', 'category fundedAmount fundingGoal');

  const earnedIds = new Set(this.badges.map(b => b.id));
  const newBadges = [];

  const count = contributions.length;
  const total = contributions.reduce((s, c) => s + c.amount, 0);
  const categories = new Set(contributions.map(c => c.issue?.category).filter(Boolean));
  const resolvedIssue = contributions.some(c => c.issue && c.issue.fundedAmount >= (c.issue.fundingGoal || 5000));

  const check = (key) => {
    const b = BADGES[key];
    if (!earnedIds.has(b.id)) {
      newBadges.push({ ...b, earnedAt: new Date() });
      earnedIds.add(b.id);
    }
  };

  if (count >= 1) check('FIRST_CONTRIBUTION');
  if (count >= 5) check('CONSISTENT_5');
  if (count >= 10) check('CONSISTENT_10');
  if (count >= 25) check('CONSISTENT_25');
  if (total >= 1000) check('AMOUNT_1000');
  if (total >= 5000) check('AMOUNT_5000');
  if (total >= 10000) check('AMOUNT_10000');
  if (total >= 50000) check('AMOUNT_50000');
  if (categories.size >= 3) check('MULTI_CATEGORY');
  if (resolvedIssue) check('ISSUE_RESOLVER');

  if (newBadges.length > 0) {
    this.badges.push(...newBadges);
  }

  this.totalContributed = total;
  this.totalCount = count;
  return newBadges; // return newly earned ones for frontend notification
};

module.exports = mongoose.model('ContributorProfile', contributorProfileSchema);
