import '../Contributor.css';

const ContributorIssueCard = ({ issue, onContribute, onViewDetails }) => {
  const goal = issue.fundingGoal || 5000;
  const funded = issue.fundedAmount || 0;
  const progress = Math.min((funded / goal) * 100, 100);

  return (
    <div className="contrib-card-main">
      <div className="contrib-card-priority">
        {issue.isEmergency && (
          <span className="contrib-priority-badge">🚨 URGENT</span>
        )}
        {issue.category && (
          <span className="contrib-category-badge">{issue.category}</span>
        )}
      </div>

      <h3 className="contrib-card-title">{issue.title}</h3>

      <p className="contrib-card-text">
        {issue.description?.substring(0, 110) || 'No description provided.'}
        {issue.description?.length > 110 ? '…' : ''}
      </p>

      <div className="contrib-progress-wrapper">
        <div className="contrib-progress-bar">
          <div className="contrib-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="contrib-progress-labels">
          <span>₹{funded.toLocaleString()} raised</span>
          <span>Goal: ₹{goal.toLocaleString()}</span>
        </div>
      </div>

      <div className="contrib-card-meta">
        {issue.councilName && (
          <span className="contrib-meta-tag contrib-meta-council">🏛 {issue.councilName}</span>
        )}
        <span className="contrib-meta-tag contrib-meta-date">
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
        <span className="contrib-meta-tag contrib-meta-status">{issue.status}</span>
        {issue.contributorCount > 0 && (
          <span className="contrib-meta-tag" style={{ background: 'rgba(245,196,81,0.08)', color: '#f5c451', border: '1px solid rgba(245,196,81,0.2)', borderRadius: '20px', padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}>
            👥 {issue.contributorCount}
          </span>
        )}
      </div>

      <div className="contrib-card-buttons">
        <button className="contrib-btn-details" onClick={onViewDetails}>
          View Details
        </button>
        <button className="contrib-btn-contribute" onClick={() => onContribute(issue)}>
          💰 Contribute
        </button>
      </div>
    </div>
  );
};

export default ContributorIssueCard;
