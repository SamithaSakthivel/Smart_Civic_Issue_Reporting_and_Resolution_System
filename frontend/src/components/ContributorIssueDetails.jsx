import '../Contributor.css';

const ContributorIssueDetails = ({ issue, onClose, onContribute }) => {
  const goal = issue.fundingGoal || 5000;
  const funded = issue.fundedAmount || 0;
  const progress = Math.min((funded / goal) * 100, 100);

  return (
    <div className="contrib-details-panel">
      <div className="contrib-details-main">
        {/* Header */}
        <div className="contrib-details-header">
          <div>
            <h2 className="contrib-details-title">{issue.title}</h2>
            <div className="contrib-details-tags">
              {issue.isEmergency && (
                <span className="contrib-priority-tag emergency">🚨 URGENT</span>
              )}
              {issue.category && (
                <span className="contrib-category-badge">{issue.category}</span>
              )}
              <span className="contrib-status-tag">{issue.status}</span>
            </div>
          </div>
          <button className="contrib-details-close" onClick={onClose}>✕</button>
        </div>

        {/* Funding progress */}
        <div className="contrib-progress-large">
          <h4>Funding Progress</h4>
          <div className="contrib-progress-bar-large">
            <div className="contrib-progress-fill-large" style={{ width: `${progress}%` }} />
          </div>
          <div className="contrib-progress-text-large">
            <span>₹{funded.toLocaleString()} raised ({Math.round(progress)}%)</span>
            <span>Goal: ₹{goal.toLocaleString()}</span>
          </div>
          {issue.contributorCount > 0 && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: '#6e7a99' }}>
              👥 {issue.contributorCount} contributor{issue.contributorCount > 1 ? 's' : ''} so far
            </p>
          )}
        </div>

        {/* Info grid */}
        <div className="contrib-info-grid">
          <div className="contrib-info-item">
            <span className="contrib-info-label">Council</span>
            <span className="contrib-info-value">{issue.councilName || '—'}</span>
          </div>
          <div className="contrib-info-item">
            <span className="contrib-info-label">Category</span>
            <span className="contrib-info-value">{issue.category || '—'}</span>
          </div>
          <div className="contrib-info-item">
            <span className="contrib-info-label">Status</span>
            <span className="contrib-info-value" style={{ textTransform: 'capitalize' }}>{issue.status}</span>
          </div>
          <div className="contrib-info-item">
            <span className="contrib-info-label">Reported</span>
            <span className="contrib-info-value">{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          {issue.location && (
            <div className="contrib-info-item">
              <span className="contrib-info-label">Location</span>
              <span className="contrib-info-value">{issue.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {issue.description && (
          <div className="contrib-description-section">
            <h3>Description</h3>
            <p>{issue.description}</p>
          </div>
        )}

        {/* Photos */}
        {issue.photos?.length > 0 && (
          <div className="contrib-photos-section">
            <h3>📸 Photos ({issue.photos.length})</h3>
            <div className="contrib-photos-grid">
              {issue.photos.map((photo, i) => (
                <div key={i} className="contrib-photo-item">
                  <img
                    src={`http://localhost:3500${photo}`}
                    alt={`Issue photo ${i + 1}`}
                    className="contrib-photo-img"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="contrib-details-actions">
          <button className="contrib-btn-back" onClick={onClose}>
            ← Back to Issues
          </button>
          <button
            className="contrib-btn-contribute-large"
            onClick={() => { onClose(); onContribute(issue); }}
          >
            💰 Contribute Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributorIssueDetails;
