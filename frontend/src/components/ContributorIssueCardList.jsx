import '../Contributor.css';
import { useState } from 'react';
import ContributorIssueCard from './ContributorIssueCard';
import ContributorIssueDetails from './ContributorIssueDetails';

const ContributorIssueCardList = ({ issues = [], onContribute }) => {
  const [selectedIssue, setSelectedIssue] = useState(null);

  const visible = issues.filter(issue =>
    issue.status !== 'resolved' &&
    issue.status !== 'completed' &&
    !(issue.status === 'cancelled' && !issue.cancelledByAdmin)
  );

  if (visible.length === 0) {
    return (
      <div className="contrib-list-empty">
        <div className="contrib-list-empty-icon">💸</div>
        <h3>No Opportunities Right Now</h3>
        <p>Check back soon — new issues are added regularly.</p>
      </div>
    );
  }

  return (
    <div className="contrib-list-container">
      <div className="contrib-list-grid">
        {visible.slice(0, 12).map(issue => (
          <ContributorIssueCard
            key={issue._id}
            issue={issue}
            onContribute={onContribute}
            onViewDetails={() => setSelectedIssue(issue)}
          />
        ))}
      </div>

      {selectedIssue && (
        <ContributorIssueDetails
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onContribute={onContribute}
        />
      )}
    </div>
  );
};

export default ContributorIssueCardList;
