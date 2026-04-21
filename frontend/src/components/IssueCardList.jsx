import React from "react";

const IssueCardList = ({ issues, onViewDetails, onCloseNotification }) => {
  if (!issues.length) return null;

  // 🔥 PHOTO URL FIXER - Handles ALL photoUrl formats!
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl || !photoUrl.length) return null;
    const url = photoUrl[0];
    if (!url) return null;
    return url.startsWith('http') || url.startsWith('/uploads/') 
      ? `http://localhost:3500${url}` 
      : `http://localhost:3500/uploads/${url}`;
  };

  return (
    <section className="issue-list">
      {issues.map((issue) => (
        <article key={issue._id} className="issue-card">
          {/* 🔥 FIXED PHOTO RENDERING */}
          {issue.photoUrl && issue.photoUrl.length > 0 && getPhotoUrl(issue.photoUrl) && (
            <div className="issue-card-image-wrapper">
              <img
                src={getPhotoUrl(issue.photoUrl)}
                alt={issue.title}
                className="issue-card-image"
                onError={(e) => {
                  e.target.style.display = 'none'; 
                }}
              />
            </div>
          )}
          <div className="issue-card-body">
            <h3>{issue.title}</h3>
            <p className="issue-card-meta">
              {issue.category} • {issue.isEmergency ? "Emergency" : "Normal priority"}
            </p>
            <p className="issue-card-description">{issue.description}</p>
            <div className="issue-card-actions">
              <button 
                className="issue-card-view" 
                type="button" 
                onClick={() => {
                  onViewDetails && onViewDetails(issue); 
                  onCloseNotification?.();
                }}
              >
                View details
              </button>
              <span className={`issue-card-status issue-status-${issue.status}`}>
                {issue.status}
              </span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default IssueCardList;