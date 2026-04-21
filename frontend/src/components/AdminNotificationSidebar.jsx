const AdminNotificationSidebar = ({ unreadComplaints, onClose, onViewComplaint }) => {
  if (!unreadComplaints.length) {
    return (
      <div className="admin-notification-sidebar">
        <div className="notification-header">
          <h3>Notifications</h3>
          <button onClick={onClose} className="notification-close">×</button>
        </div>
        <div className="notification-empty">
          No unread complaints 🎉
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notification-sidebar">
      <div className="notification-header">
        <h3>{unreadComplaints.length} Unread</h3>
        <button onClick={onClose} className="notification-close">×</button>
      </div>
      
      <div className="notification-list">
        {unreadComplaints.map((complaint) => (
          <div 
            key={complaint._id}
            className="notification-item"
            onClick={() => {
              onViewComplaint(complaint);
              onClose();
            }}
          >
            <div className="notification-image">
              {complaint.photoUrl && (
                <img src={`http://localhost:3500${complaint.photoUrl}`} alt="Complaint" />
              )}
            </div>
            <div className="notification-content">
              <h4>{complaint.title}</h4>
              <p>{complaint.administration} • {complaint.citizenName}</p>
              <span className="notification-time">
                {new Date(complaint.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminNotificationSidebar;