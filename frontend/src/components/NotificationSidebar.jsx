
import "../Citizen.css";
import { useGetMyComplaintsQuery, useMarkCitizenNotificationReadMutation } from "../features/complaintsApiSlice";
import { useState, useCallback } from "react";
import IssueDetails from "./IssueDetails";

const NotificationSidebar = ({ onClose }) => {
  const { data: complaints = [], refetch } = useGetMyComplaintsQuery();
  const [markCitizenNotificationRead] = useMarkCitizenNotificationReadMutation();
  const [selectedIssue, setSelectedIssue] = useState(null);

  const notifications = complaints
    .filter(c => c.citizenNotification === true && c.status === 'cancelled')
    .sort((a, b) => new Date(b.cancelReasonTimestamp) - new Date(a.cancelReasonTimestamp));


  const handleMarkRead = useCallback(async (complaintId) => {
    try {
      await markCitizenNotificationRead(complaintId).unwrap();
      refetch(); 
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  }, [markCitizenNotificationRead, refetch]);

  const handleCloseDetails = () => {
    if (selectedIssue) {
      handleMarkRead(selectedIssue._id); 
    }
    setSelectedIssue(null);
  };

  return (
    <div className="notification-sidebar-overlay">
      <div className="notification-sidebar">
        <div className="notification-header">
          <h3>Notifications ({notifications.length})</h3>
          <button className="notification-close" onClick={onClose}>×</button>
        </div>

        <div className="notification-list">
          {notifications.map((complaint) => (
            <div key={complaint._id} className="notification-item">
              <div className="notification-icon">❌</div>
              <div className="notification-content">
                <h4>{complaint.title}</h4>
                <p className="notification-preview">Cancelled by admin</p>
              </div>
              <button className="notification-action" onClick={() => setSelectedIssue(complaint)}>
                View Details
              </button>
            </div>
          ))}
          {notifications.length === 0 && <p className="notification-empty">No new notifications</p>}
        </div>

        {selectedIssue && (
          <div className="notification-issue-details-overlay" onClick={handleCloseDetails}>
            <div className="notification-issue-details" onClick={(e) => e.stopPropagation()}>
              <IssueDetails 
                issue={selectedIssue}
                onClose={handleCloseDetails}
                onCancel={() => {}}
                onAddPhoto={() => {}}
              />
              <button className="modal-close-btn" onClick={handleCloseDetails}>×</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationSidebar;