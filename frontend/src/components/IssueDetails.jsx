const IssueDetails = ({ issue, onClose, onCancel, onAddPhoto }) => {
  if (!issue) return null;

  // 🔥 DEBUG LOCATION DATA
  console.log("🎯 CITIZEN ISSUE DATA:", issue);
  console.log("📍 LAT:", issue.lat, "LNG:", issue.lng, "ADDRESS:", issue.locationAddress);

  // 🔥 FIXED: getPhotoUrl INSIDE component - WORKS with ALL photo formats!
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http')) return photoUrl; // already full URL
    if (photoUrl.startsWith('/uploads/')) return `http://localhost:3500${photoUrl}`;
    return `http://localhost:3500/uploads/${photoUrl}`;
  };

  let photos = [];
  if (Array.isArray(issue.photoUrl)) {
    photos = issue.photoUrl;
  } else if (typeof issue.photoUrl === "string" && issue.photoUrl.trim() !== "") {
    photos = [issue.photoUrl];
  }

  return (
    <div className="issue-details-shell issue-details-shell-split">
      <div className="issue-details">
        <div className="issue-details-header">
          <h2 className="issue-details-title">{issue.title}</h2>
          <p className="issue-details-meta">
            {issue.category} • {issue.isEmergency ? "Emergency" : "Normal"} •{" "}
            {issue.status}
          </p>
        </div>

        {issue.lat && issue.lng && (
          <div className="issue-location-section" style={{margin: '1.5rem 0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h4 style={{margin: 0}}>📍 Exact Location</h4>
              <button 
                style={{
                  background: '#3b82f6', color: 'white', border: 'none',
                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: '500'
                }}
                onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${issue.lat}&mlon=${issue.lng}#map=18/${issue.lat}/${issue.lng}`)}
              >
                🗺️ Full Map
              </button>
            </div>
            
            <div style={{position: 'relative'}}>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${issue.lng-0.003}%2C${issue.lat-0.003}%2C${issue.lng+0.003}%2C${issue.lat+0.003}&layer=mapnik&marker=${issue.lat}%2C${issue.lng}`}
                width="100%"
                height="250"
                frameBorder="0"
                style={{borderRadius: '12px', border: '2px solid #3b82f6'}}
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
                title="Issue location"
              />
              <div style={{
                position: 'absolute', top: 8, left: 8, background: 'rgba(59,130,246,0.9)',
                color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px',
                fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10
              }}>
                📍 REPORTED HERE
              </div>
            </div>
            
            <div style={{marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', color: '#1e293b'}}>
                    {issue.locationAddress?.length > 50 ? issue.locationAddress.substring(0, 50) + '...' : issue.locationAddress || 'GPS coordinates only'}
                  </p>
                  <p style={{margin: 0, fontSize: '0.85rem', fontFamily: 'monospace', color: '#475569'}}>
                    📍 {issue.lat.toFixed(6)}, {issue.lng.toFixed(6)}
                  </p>
                </div>
                <button 
                  style={{
                    background: '#6b7280', color: 'white', border: 'none',
                    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(`${issue.lat}, ${issue.lng}`);
                    alert('📋 GPS coordinates copied!');
                  }}
                >
                  📋 Copy GPS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 FIXED PHOTO SECTION - Uses getPhotoUrl! */}
        {photos.length > 0 && (
          <div className="issue-details-photos">
            {photos.map((url, idx) => (
              <img
                key={idx}
                src={getPhotoUrl(url)}  // ✅ NOW USES HELPER!
                alt={issue.title}
                className="issue-photo"
                onError={(e) => e.target.style.display = 'none'}  // Hide broken images
              />
            ))}
          </div>
        )}

        <div className="issue-details-text">
          <p className="issue-details-description">{issue.description}</p>
          <p><strong>Topic:</strong> {issue.topic}</p>
          <p><strong>Department:</strong> {issue.administration}</p>
          <p><strong>Submitted on:</strong>{" "}
            {new Date(issue.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="issue-details-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Back to all complaints
          </button>

          <input
            type="file"
            accept="image/*"
            id="issue-photo-input"
            style={{ display: "none" }}
            onChange={(e) => onAddPhoto(e, issue)}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              document.getElementById("issue-photo-input").click()
            }
          >
            + Add photo
          </button>

          {issue.status === "pending" && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => onCancel(issue)}
            >
              Cancel complaint
            </button>
          )}
        </div>
      </div>

      {issue.status === 'cancelled' && issue.cancelReason && (
        <aside className="issue-cancel-panel">
          <div className="cancel-card-header">
            <div className="cancel-icon">❌</div>
            <div>
              <h4>Complaint Cancelled</h4>
              <p className="cancel-by">
                By {issue.cancelByAdmin || 'Admin Council'} on{' '}
                {new Date(issue.cancelReasonTimestamp).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="cancel-reason-card">
            <h5>Reason for Cancellation:</h5>
            <p className="cancel-reason-text">{issue.cancelReason}</p>
          </div>
          
          <div className="cancel-status-badge">
            Status: <span className="badge-cancelled">CANCELLED</span>
          </div>
        </aside>
      )}
    </div>
  );
};

export default IssueDetails;