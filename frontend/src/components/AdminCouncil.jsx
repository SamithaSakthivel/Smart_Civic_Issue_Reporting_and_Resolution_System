import "../Admin.css";
import React, { useState, useMemo ,useCallback} from "react";
import AdminNotificationSidebar from "./AdminNotificationSidebar";
import {
  useGetAdminComplaintsQuery,
  useUpdateAdminComplaintMutation,
  useCancelComplaintByAdminMutation,
  useMarkAdminReadMutation,
} from "../features/complaintsApiSlice";
import AdminStatsPieChart from "./AdminStatsPieChart";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { logOut } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminCouncil = () => {
  const [activePage, setActivePage] = useState("complaints"); // "complaints" | "profile"
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [logout, { isLoading:logoutLoading}] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showCouncilDropdown, setShowCouncilDropdown] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('⚠️ Logout and delete account? This is permanent.')) {
      try {
        await logout().unwrap();
        dispatch(logOut());
        navigate('/', { replace: true });
      } catch (error) {
        alert('❌ Logout failed');
      }
    }
  };

  const {
    data: complaints = [],
    isLoading,
    isError,
    refetch
  } = useGetAdminComplaintsQuery(statusFilter);

  const [cancelComplaintByAdmin] = useCancelComplaintByAdminMutation();

  const handleCancelSuccess = useCallback(() => {
    refetch(); // ✅ REFRESH list
    setSelectedComplaint(null); // ✅ Close details
  }, [refetch]);
  // mark complaint as read
  const [markAdminRead] = useMarkAdminReadMutation();

  // unread complaints for notification badge
  const unreadCount = complaints.filter((c) => c.adminUnread).length;

  // optional extra filter on client
  // ✅ NEW PRIORITY SORT VERSION
const filteredComplaints = useMemo(() => {
  // ✅ COPY array first (breaks read-only)
  let result = [...complaints];
  
  // Client-side status filter first
  if (statusFilter !== "all") {
    result = result.filter((c) => c.status === statusFilter);
  }
  
  // PRIORITY SORT: pending > inprogress > resolved
  return result.sort((a, b) => {
    const priority = {
      pending: 3,
      inprogress: 2,
      resolved: 1,
      cancelled: 0
    };
    
    // Fallback if status missing
    const aPriority = priority[a.status] ?? 0;
    const bPriority = priority[b.status] ?? 0;
    
    return bPriority - aPriority;
  });
}, [complaints, statusFilter]);

  // when View is clicked
  const handleViewComplaint = async (complaint) => {
  console.log("View clicked, complaint:", complaint._id, "unread:", complaint.adminUnread);
  
  setSelectedComplaint(complaint);

  // ✅ SAFE CHECK - handles undefined adminUnread
  if (complaint.adminUnread === true) {
    console.log("Calling markAdminRead for", complaint._id);
    try {
      const result = await markAdminRead(complaint._id).unwrap();
      console.log("markAdminRead success:", result);
    } catch (err) {
      console.error("markAdminRead failed:", err);
    }
  } else {
    console.log("Complaint already read, skipping");
  }
};

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <AdminSidebar activePage={activePage} onChangePage={setActivePage} onLogout={handleLogout} />
      </aside>

      {/* Main area */}
      <main className="admin-main">
        <AdminTopBar unreadCount={unreadCount} onLogout={handleLogout} onNotificationClick={()=>setIsNotificationOpen(true)}/>
        {activePage==="complaints" &&!selectedComplaint &&(<AdminStatsPieChart complaints={complaints} />)}
        {activePage==="profile" && <AdminProfileForm/>}
        {isNotificationOpen && (
          <AdminNotificationSidebar
            unreadComplaints={complaints.filter(c => c.adminUnread)}
            onClose={() => setIsNotificationOpen(false)}
            onViewComplaint={handleViewComplaint}
          />
        )}
        
        <div className="admin-main-inner">
          {activePage === "complaints" && (
            <AdminComplaintsSection
              isLoading={isLoading}
              isError={isError}
              complaints={complaints}
              filteredComplaints={filteredComplaints}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedComplaint={selectedComplaint}
              setSelectedComplaint={setSelectedComplaint}
              onViewComplaint={handleViewComplaint}
              onCancelSuccess={handleCancelSuccess}
            />
          )}
        </div>
      </main>
    </div>
  );
};

/* ---------- Sidebar ---------- */

const AdminSidebar = ({ activePage, onChangePage, onLogout }) => {
  const adminName = "Ward Council Admin";
  
  return (
    <div className="admin-sidebar-inner">
      <div className="admin-profile-card">
        <div className="admin-avatar-wrapper">
          <div className="admin-avatar-placeholder">
            {adminName[0].toUpperCase()}
          </div>
        </div>
        <div className="admin-profile-info">
          <h2>{adminName}</h2>
          <p className="admin-role">Electricity & Roads</p>
        </div>
      </div>

      <nav className="admin-nav">
        <button
          className={activePage === "complaints" ? "admin-nav-item admin-nav-item-active" : "admin-nav-item"}
          onClick={() => onChangePage("complaints")}
        >
          Complaints dashboard
        </button>
        <button
          className={activePage === "profile" ? "admin-nav-item admin-nav-item-active" : "admin-nav-item"}
          onClick={() => onChangePage("profile")}
        >
          Profile / settings
        </button>
        <button className="admin-nav-item admin-nav-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </nav>
    </div>
  );
};
/* ---------- Top bar ---------- */

const AdminTopBar = ({ unreadCount, onNotificationClick,onLogout }) => { // ✅ ADD PROP
  return (
    <header className="admin-topbar">
      <h1 className="admin-topbar-title">Complaints dashboard</h1>
      <div className="admin-topbar-right">
        <button 
          type="button" 
          className="admin-notification-btn"
          onClick={onNotificationClick} // ✅ CLICK HANDLER!
        >
          <span className="admin-notification-icon">🔔</span>
          {unreadCount > 0 && (
            <span className="admin-notification-badge">{unreadCount}</span>
          )}
        </button>
        <button className="admin-logout-btn" onClick={onLogout} title="Logout">
          🚪
        </button>
      </div>
    </header>
  );
};

  

/* ---------- Complaints section ---------- */

const AdminComplaintsSection = ({
  isLoading,
  isError,
  complaints,
  filteredComplaints,
  statusFilter,
  setStatusFilter,
  selectedComplaint,
  setSelectedComplaint,
  onViewComplaint,
  onCancelSuccess
}) => {
  if (isLoading) return <p>Loading complaints…</p>;
  if (isError) return <p>Failed to load complaints.</p>;

    // If a complaint is selected, show ONLY the details view
  if (selectedComplaint) {
    return (
      <div className="admin-complaint-shell admin-complaint-shell-split">
        {/* LEFT: details */}
        <AdminComplaintDetails
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onCancelSuccess={onCancelSuccess}
        />
      </div>
    );
  }
  

  if (!complaints.length) {
    return (
      <div className="admin-empty-state">
        <h2>No reports yet</h2>
        <p>
          Citizen complaints for your council will appear here as soon as they
          are submitted.
        </p>
      </div>
    );
  }

  // Otherwise show the normal list/table
  return (
    <div className="admin-complaints">
      <div className="admin-complaints-header">
        <h2>Citizen complaints</h2>

        <div className="admin-filters">
          <label>
            Status:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </div>

      <div className="admin-complaints-body">
        <table className="admin-complaints-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Citizen</th>
              <th>Department</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Read</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.citizenName || "Anonymous"}</td>
                <td>
  {/* 🚀 NEW: Show both citizen + AI */}
  <div>
    <strong>{c.administration}</strong>
    {c.aiSuggestion && (
      <div className="ai-mini-badge">
        🤖 {c.aiSuggestion.department}
      </div>
    )}
  </div>
</td>
                <td>
                  <span className={`badge badge-${c.status}`}>
                    {c.status}
                  </span>
                </td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>
                  {/* ✅ SAFE CHECK for adminUnread */}
                  <span className={c.adminUnread ? "tag-unread" : "tag-read"}>
                    {c.adminUnread ? "Unread" : "Read"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => onViewComplaint(c)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- Complaint details panel ---------- */
const AdminComplaintDetails = ({ complaint, onClose, onCancelSuccess }) => {
  const [status, setStatus] = useState(complaint.status);
  const [targetDate, setTargetDate] = useState(complaint.targetDate || "");
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [updateAdminComplaint] = useUpdateAdminComplaintMutation();
  const [cancelComplaintByAdmin] = useCancelComplaintByAdminMutation();

  if (!complaint) return null;

  console.log("🎯 ADMIN COMPLAINT DATA:", complaint);
  console.log("📍 ADMIN LAT:", complaint.lat, "LNG:", complaint.lng, "ADDRESS:", complaint.locationAddress);

  // 🔥 FIXED: Add getPhotoUrl HERE INSIDE AdminComplaintDetails!
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    return photoUrl.startsWith('http') || photoUrl.startsWith('/uploads/') 
      ? `http://localhost:3500${photoUrl}` 
      : `http://localhost:3500/uploads/${photoUrl}`;
  };

  // Always make photos an array (handles single string or array)
  let photos = [];
  if (Array.isArray(complaint.photoUrl)) {
    photos = complaint.photoUrl;
  } else if (typeof complaint.photoUrl === "string" && complaint.photoUrl.trim() !== "") {
    photos = [complaint.photoUrl];
  }

  const handleSaveStatus = async () => {
    try {
      await updateAdminComplaint({
        id: complaint._id,
        status,
        targetDate,
      }).unwrap();
      onClose();
      onCancelSuccess?.();
    } catch(err) {
      console.error('Save failed:', err);
    }
  };

  const handleSubmitCancel = async (e) => {
    e.preventDefault();
    try {
      await cancelComplaintByAdmin({
        id: complaint._id,
        reason: cancelReason,
      }).unwrap();
      setIsCanceling(false);
      onClose();
      onCancelSuccess?.();
    } catch (err) {
      console.error('❌ FAILED:', err);
    }
  };

  return (
    <section className="admin-complaint-details-full">
      <div className="issue-details">
        <div className="issue-details-header">
          <h2 className="issue-details-title">{complaint.title}</h2>
          <div className="issue-details-meta">
            {complaint.category} • {complaint.isEmergency ? "Emergency" : "Normal"} •{" "}
            {complaint.status}
            {complaint.lat && complaint.lng && (
              <span className="location-badge">📍 {complaint.lat.toFixed(4)}, {complaint.lng.toFixed(4)}</span>
            )}
          </div>
        </div>

        {/* LOCATION MAP - UNCHANGED */}
        {complaint.lat && complaint.lng && (
          <div className="admin-location-section">
            {/* ... your existing map code stays exactly same ... */}
          </div>
        )}

        {/* 🔥 FIXED PHOTO SECTION */}
        {photos.length > 0 && (
          <div className="issue-details-photos">
            {photos.map((url, idx) => (
              <img
                key={idx}
                src={getPhotoUrl(url)}  // ✅ NOW USES HELPER!
                alt={complaint.title}
                className="issue-photo"
                onError={(e) => e.target.style.display = 'none'}  // Hide broken images
              />
            ))}
          </div>
        )}

        {/* REST OF YOUR CODE - UNCHANGED */}
        <div className="issue-details-text">
          <p className="issue-details-description">{complaint.description}</p>
          <p><strong>Topic:</strong> {complaint.topic || complaint.category}</p>

          {complaint.aiSuggestion && (
            <div className="ai-prediction-badge">
              🤖 AI Predicted: 
              <span>Cat: {complaint.aiSuggestion.category}</span> | 
              <span>Dept: {complaint.aiSuggestion.department}</span> | 
              <span className={complaint.aiSuggestion.isEmergency ? "emergency-ai" : ""}>
                {complaint.aiSuggestion.isEmergency ? "EMERGENCY ⚠️" : "Normal"}
              </span>
            </div>
          )}
          <p><strong>Department:</strong> {complaint.administration}</p>
          <p><strong>Submitted by:</strong> {complaint.citizenName || "Anonymous"}</p>
          <p><strong>Submitted on:</strong> {new Date(complaint.createdAt).toLocaleString()}</p>
        </div>

        <div className="issue-details-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Back to all complaints
          </button>
          
          <div className="admin-status-controls">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="inprogress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="date-input"
              placeholder="Expected fix date"
            />
            
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleSaveStatus}
            >
              Save changes
            </button>
            
            <button 
              type="button" 
              className="btn-danger" 
              onClick={() => setIsCanceling(true)}
            >
              Cancel complaint
            </button>
          </div>
        </div>
      </div>

      {isCanceling && (
        <aside className="admin-cancel-panel">
          <h4>Why are you cancelling?</h4>
          <form className="admin-cancel-form" onSubmit={handleSubmitCancel}>
            <textarea
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explain the reason to the citizen…"
            />
            <div className="admin-cancel-actions">
              <button type="submit" className="btn-danger">
                Submit cancellation
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCanceling(false)}
              >
                Back
              </button>
            </div>
          </form>
        </aside>
      )}
    </section>
  );
};

/* ---------- Profile placeholder ---------- */

const AdminProfileForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    councilName: '',
    administration: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-form-container">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <button 
          className="btn-primary" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Council Name</label>
            <input
              type="text"
              value={formData.councilName}
              onChange={(e) => setFormData({...formData, councilName: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Administration</label>
            <input
              type="text"
              value={formData.administration}
              onChange={(e) => setFormData({...formData, administration: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      ) : (
        <div className="profile-display">
          <div className="profile-field">
            <label>Council Name</label>
            <span>Ward Council</span>
          </div>
          <div className="profile-field">
            <label>Administration</label>
            <span>Electricity & Roads</span>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <span>admin@council.com</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouncil;