import '../Contributor.css';
import { useState, useEffect } from 'react';
import CitizenTopBar from './CitizenTopBar';
import ContributorIssueCardList from './ContributorIssueCardList';
import ContributionCharts from './ContributionCharts';
import BadgesSection from './BadgesSection';
import PaymentModal from './PaymentModal';

import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetContributorIssuesQuery,
  useRecordContributionMutation,
  useGetMyContributionsQuery,
  useGetMyStatsQuery,
} from '../app/api/contributorApiSlice';

import { useUploadPhotoMutation } from '../features/uploadApiSlice';

// ── Badge earned popup ───────────────────────────────────────
const BadgePopup = ({ badges, onClose }) => {
  const badge = badges[0]; // show one at a time
  if (!badge) return null;
  return (
    <div className="badge-popup-overlay">
      <div className="badge-popup">
        <div className="badge-popup-icon">{badge.icon}</div>
        <h2>New Badge Earned!</h2>
        <p>
          <strong>{badge.name}</strong><br />
          {badge.description}
        </p>
        <button className="badge-popup-close" onClick={onClose}>
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────
const Contributor = () => {
  const [activeTab, setActiveTab]             = useState('opportunities');
  const [isEditing, setIsEditing]             = useState(false);
  const [paymentIssue, setPaymentIssue]       = useState(null);
  const [newBadgeQueue, setNewBadgeQueue]     = useState([]);
  const [formState, setFormState]             = useState({
    fullName: '', phone: '', address: '', avatarUrl: '', bankAccount: '',
  });

  // ── Queries ────────────────────────────────────────────────
  const { data: profileData,      isLoading: profileLoading,  isError: profileError } = useGetMyProfileQuery();
  const { data: contributorIssues = [], isLoading: issuesLoading }                    = useGetContributorIssuesQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: stats,            isLoading: statsLoading }                           = useGetMyStatsQuery();
  const { data: myContributions = [] }                                                = useGetMyContributionsQuery();

  // ── Mutations ──────────────────────────────────────────────
  const [updateProfile, { isLoading: isSaving }]       = useUpdateMyProfileMutation();
  const [uploadPhoto]                                   = useUploadPhotoMutation();
  const [recordContribution]                            = useRecordContributionMutation();

  // Populate form when profile loads
  useEffect(() => {
    if (profileData?.profile) {
      const { profile, user } = profileData;
      setFormState({
        fullName:    profile.fullName    || user.username || '',
        phone:       profile.phone       || '',
        address:     profile.address     || '',
        avatarUrl:   profile.avatarUrl   || '',
        bankAccount: profile.bankAccount || '',
      });
    }
  }, [profileData]);

  // ── Handlers ───────────────────────────────────────────────
  const handleChange = (e) =>
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formState).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadPhoto(file).unwrap();
      const newUrl = res.url;
      setFormState(prev => ({ ...prev, avatarUrl: newUrl }));
      await updateProfile({ ...formState, avatarUrl: newUrl }).unwrap();
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      e.target.value = '';
    }
  };

  // Called when Razorpay returns a success response
  const handlePaymentSuccess = async ({ issueId, amount, razorpayPaymentId, razorpayOrderId }) => {
    setPaymentIssue(null);
    try {
      const result = await recordContribution({ issueId, amount, razorpayPaymentId, razorpayOrderId }).unwrap();
      if (result.newBadges?.length > 0) {
        setNewBadgeQueue(result.newBadges);
      }
    } catch (err) {
      console.error('Failed to record contribution:', err);
    }
  };

  // ── Loading / error ────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="citizen-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">Loading contributor dashboard…</div>
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="citizen-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="error-container">Failed to load profile. Please refresh.</div>
      </div>
    );
  }

  const { user, profile = {} } = profileData;
  const totalContributed = stats?.totalContributed ?? 0;
  const totalCount       = stats?.totalCount       ?? 0;
  const streak           = stats?.streak           ?? 0;
  const badges           = stats?.badges           ?? [];

  const TABS = [
    { id: 'opportunities', label: '💰 Opportunities' },
    { id: 'analytics',     label: '📊 Analytics'     },
    { id: 'badges',        label: '🎖 Badges'         },
    { id: 'history',       label: '📋 History'        },
  ];

  return (
    <div className="citizen-layout">
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="citizen-sidebar">
        <div className="citizen-profile-card">
          <div className="citizen-profile-card-top">
            <div className="avatar-wrapper">
              {formState.avatarUrl ? (
                <img
                  src={`http://localhost:3500${formState.avatarUrl}`}
                  alt="Profile"
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.username?.[0]?.toUpperCase() || 'C'}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id="avatar-file-input"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                className="avatar-add-btn"
                onClick={() => document.getElementById('avatar-file-input').click()}
                title="Change photo"
              >
                +
              </button>
            </div>

            <div className="citizen-info">
              <h3>Full Name</h3>
              <h2>{profile.fullName || user.username}</h2>
              <h3>Username</h3>
              <p className="citizen-username">@{user.username}</p>
              {profile.phone && (
                <>
                  <h3>Contact</h3>
                  <p className="citizen-phone">{profile.phone}</p>
                </>
              )}
              {profile.bankAccount && (
                <>
                  <h3>Bank Account</h3>
                  <p className="citizen-phone">{profile.bankAccount}</p>
                </>
              )}
            </div>
          </div>

          <div className="citizen-profile-card-bottom">
            <button
              className="btn-edit-profile"
              type="button"
              onClick={() => { setIsEditing(p => !p); setActiveTab('opportunities'); }}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* Stats pills */}
        <div className="sidebar-stats">
          <div className="stat-pill">
            <span className="stat-pill-label">💰 Total Donated</span>
            <span className="stat-pill-value green">₹{totalContributed.toLocaleString()}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-label">🔢 Contributions</span>
            <span className="stat-pill-value cyan">{totalCount}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-label">🔥 Streak</span>
            <span className="stat-pill-value amber">{streak}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-label">🎖 Badges</span>
            <span className="stat-pill-value amber">{badges.length}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="citizen-main">
        <div className="citizen-main-inner">
          <CitizenTopBar unreadNotifications={0} availableCouncils={[]} />

          {/* Edit profile form */}
          {isEditing && (
            <div className="section-card">
              <form className="profile-form" onSubmit={handleSave}>
                <h3>Edit Profile</h3>
                <label>
                  Full Name
                  <input name="fullName" value={formState.fullName} onChange={handleChange} required />
                </label>
                <label>
                  Phone Number
                  <input name="phone" value={formState.phone} onChange={handleChange} />
                </label>
                <label>
                  Address
                  <textarea name="address" value={formState.address} onChange={handleChange} rows={3} />
                </label>
                <label>
                  Bank Account (for rewards)
                  <input name="bankAccount" value={formState.bankAccount} onChange={handleChange} />
                </label>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!isEditing && (
            <>
              {/* Dashboard header */}
              <div className="dashboard-header">
                <h1>Contributor Dashboard</h1>
                <p>
                  {totalCount === 0
                    ? 'Start contributing to local issues and earn badges!'
                    : `You've contributed ₹${totalContributed.toLocaleString()} across ${totalCount} payment${totalCount > 1 ? 's' : ''}. Thank you! 🙏`
                  }
                </p>
              </div>

              {/* Tabs */}
              <div className="dash-tabs">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    className={`dash-tab${activeTab === t.id ? ' active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── OPPORTUNITIES ── */}
              {activeTab === 'opportunities' && (
                <div>
                  <div style={{ marginBottom: '1rem', color: '#a6b3d0', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#e8efff' }}>
                      {contributorIssues.filter(i =>
                        i.status !== 'resolved' && i.status !== 'completed'
                      ).length}
                    </strong>{' '}
                    issues need your support
                  </div>
                  {issuesLoading ? (
                    <div className="loading-container">Loading issues…</div>
                  ) : (
                    <ContributorIssueCardList
                      issues={contributorIssues}
                      onContribute={(issue) => setPaymentIssue(issue)}
                    />
                  )}
                </div>
              )}

              {/* ── ANALYTICS ── */}
              {activeTab === 'analytics' && (
                statsLoading
                  ? <div className="loading-container">Loading analytics…</div>
                  : <ContributionCharts stats={stats} />
              )}

              {/* ── BADGES ── */}
              {activeTab === 'badges' && (
                <BadgesSection earnedBadges={badges} />
              )}

              {/* ── HISTORY ── */}
              {activeTab === 'history' && (
                <div className="section-card">
                  <h2 className="section-title">📋 Contribution History</h2>
                  {myContributions.length === 0 ? (
                    <p style={{ color: '#6e7a99', textAlign: 'center', padding: '2rem' }}>
                      No contributions yet. Start by funding an issue! 💰
                    </p>
                  ) : (
                    <div className="history-list">
                      {myContributions.map(c => (
                        <div key={c._id} className="history-item">
                          <span className="history-amount">₹{c.amount.toLocaleString()}</span>
                          <div className="history-info">
                            <div className="history-title">{c.issue?.title || 'Unknown Issue'}</div>
                            <div className="history-cat">{c.issue?.category}</div>
                          </div>
                          <span className="history-date">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── PAYMENT MODAL ────────────────────────────────────── */}
      {paymentIssue && (
        <PaymentModal
          issue={paymentIssue}
          onClose={() => setPaymentIssue(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* ── NEW BADGE POPUP ──────────────────────────────────── */}
      {newBadgeQueue.length > 0 && (
        <BadgePopup
          badges={newBadgeQueue}
          onClose={() => setNewBadgeQueue(prev => prev.slice(1))}
        />
      )}
    </div>
  );
};

export default Contributor;
