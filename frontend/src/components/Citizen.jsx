import "../Citizen.css";
import { useState, useEffect, useCallback } from "react";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "../features/auth/citizenProfileApiSlice";
import { useUploadPhotoMutation } from "../features/uploadApiSlice";
import IssueDetails from "./IssueDetails";
import {useCancelComplaintMutation,useGetMyComplaintsQuery,
  useCreateComplaintMutation,useUpdateComplaintPhotoMutation } from '../features/complaintsApiSlice';
import IssueForm from "./IssueForm";
import EmptyState from "./EmptyState";
import IssueCardList from "./IssueCardList";
import CitizenTopBar from "./CitizenTopBar";
import { useLanguage } from "../contexts/LanguageContext";

const Citizen = () => {
  const { t, language } = useLanguage();
  const [citizenTexts, setCitizenTexts] = useState({});
  
  const loadCitizenTexts = useCallback(async () => {
    if (!t) return;
    const texts = {
      Fullname: await t("Fullname") || "Fullname",
      Username: await t("Username") || "Username",
      Ward: await t("Ward") || "Ward",
      "Contact no": await t("Contact no") || "Contact no",
      "Report new issue": await t("Report new issue") || "Report new issue",
      "Edit profile": await t("Edit profile") || "Edit profile",
      "Cancel editing": await t("Cancel editing") || "Cancel editing",
      "Edit your details": await t("Edit your details") || "Edit your details",
      "Full name": await t("Full name") || "Full name",
      "Ward / Zone": await t("Ward / Zone") || "Ward / Zone",
      "Phone number": await t("Phone number") || "Phone number",
      Address: await t("Address") || "Address",
      "Avatar image URL": await t("Avatar image URL") || "Avatar image URL",
      "Save changes": await t("Save changes") || "Save changes",
      "Loading your complaints...": await t("Loading your complaints...") || "Loading your complaints...",
      "Failed to load your complaints.": await t("Failed to load your complaints.") || "Failed to load your complaints.",
      "Loading profile…": await t("Loading profile…") || "Loading profile…",
      "No Profile Data": await t("No Profile Data") || "No Profile Data"
    };
    setCitizenTexts(texts);
  }, [t, language]);

  useEffect(() => {
    loadCitizenTexts();
  }, [loadCitizenTexts]);
  const {
    data: complaints = [],
    isLoading: complaintsLoading,
    isError: complaintsError,
    refetch: refetchComplaints,
  } = useGetMyComplaintsQuery();
  const [updateComplaintPhoto]=useUpdateComplaintPhotoMutation();
  const [uploadPhoto] = useUploadPhotoMutation();
  const [createComplaint, { isLoading: isCreating }] =useCreateComplaintMutation();
  const [isReporting, setIsReporting] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [cancelComplaint]=useCancelComplaintMutation();
  const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [showStatusDropdown, setShowStatusDropdown] = useState(false);

// Updated filter logic:
const filteredComplaints = complaints.filter(issue => {
  const matchesSearch = 
    !searchQuery ||
    issue.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesStatus = !statusFilter || issue.status === statusFilter;
  
  return matchesSearch && matchesStatus;
});
// 3. Replace IssueCardList line with the search UI above
  const unreadNotifications = complaints.filter(c => c.citizenNotification === true).length;
  const availableCouncils = Array.from(
    new Map(
      complaints.map(c => [c.councilId, {
        _id: c.councilId,
        councilName: c.councilName,
        administration: c.administration
      }])
    ).values()
  );

  const handleCancel = async (issue) => {
    await cancelComplaint(issue._id).unwrap();
    await refetchComplaints();
    setSelectedIssue(null);
  };
  
  const handleAddPhoto = async (e, issue) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadRes = await uploadPhoto(file).unwrap();
      const updated = await updateComplaintPhoto({
        id: issue._id,
        photoUrl: uploadRes.url,
      }).unwrap();
      // Use the response from the server directly — it has the fresh photoUrl array
      setSelectedIssue(updated);
      // Also refresh the list in the background so the card list stays in sync
      refetchComplaints();
    } catch (err) {
      console.error("Adding photo failed", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleCreateIssue = async (formData) => {
    let photoUrl = "";
    if (formData.photo) {
      const uploadRes = await uploadPhoto(formData.photo).unwrap();
      photoUrl = uploadRes.url;
    }
    const payload = {
      topic: formData.topic,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      isEmergency: formData.isEmergency,
      administration: formData.administration,
      photoUrl,
      councilId: formData.councilId,
      councilName: formData.councilName,
      lat: formData.lat,
      lng: formData.lng,
      locationAddress: formData.locationAddress,
    };
    await createComplaint(payload).unwrap();
    await refetchComplaints();
    setIsReporting(false);
  };

  const {
    data,
    isLoading: profileLoading,
    isError,
    error,
  } = useGetMyProfileQuery();

  const [updateProfile, { isLoading: isSaving }] =useUpdateMyProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    ward: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (data?.profile) {
      const { profile, user } = data;
      setFormState({
        fullName: profile.fullName || user.username || "",
        ward: profile.ward || "",
        phone: profile.phone || "",
        address: profile.address || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile(formState).unwrap();
    setIsEditing(false);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadPhoto(file).unwrap();
      const newAvatarUrl = res.url;
      setFormState((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      await updateProfile({ ...formState, avatarUrl: newAvatarUrl }).unwrap();
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      e.target.value = "";
    }
  };

  if (profileLoading) return <p>{citizenTexts["Loading profile…"] || "Loading profile…"}</p>;
  if (isError) {
    return (
      <p>
        Failed to load profile ({error?.status}):{" "}
        {JSON.stringify(error?.data || {})}
      </p>
    );
  }
  if (!data) return <p>{citizenTexts["No Profile Data"] || "No Profile Data"}</p>;

  const { user, profile } = data;

  return (
    <div className="citizen-layout">
      <aside className="citizen-sidebar">
        <div className="citizen-profile-card">
          <div className="citizen-profile-card-top">
            <div className="avatar-wrapper">
              {formState.avatarUrl ? (
                <img
                  src={`http://localhost:3500${formState.avatarUrl}`}
                  alt="Profile avatar"
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id="avatar-file-input"
                style={{display:"none"}}
                onChange={handleAvatarFileChange}
              />
              <button
                type="button"
                className="avatar-add-btn"
                onClick={() => document.getElementById("avatar-file-input").click()}
              >
                +
              </button>
            </div>

            <div className="citizen-info">
              <div className="citizen-info-row">
                <span className="citizen-info-label">{citizenTexts.Fullname || "Full Name"}</span>
                <span className="citizen-info-value">{profile.fullName || user.username}</span>
              </div>
              <div className="citizen-info-row">
                <span className="citizen-info-label">{citizenTexts.Username || "Username"}</span>
                <span className="citizen-info-value citizen-username">@{user.username}</span>
              </div>
              {profile.ward && (
                <div className="citizen-info-row">
                  <span className="citizen-info-label">{citizenTexts.Ward || "Ward"}</span>
                  <span className="citizen-info-value">{profile.ward}</span>
                </div>
              )}
              {profile.phone && (
                <div className="citizen-info-row">
                  <span className="citizen-info-label">{citizenTexts["Contact no"] || "Contact"}</span>
                  <span className="citizen-info-value">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="citizen-profile-card-bottom">
            <button
              className="btn-report-issue"
              onClick={() => setIsReporting(true)}
            >
              {citizenTexts["Report new issue"]}
            </button>

            <button
              className="btn-edit-profile"
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? citizenTexts["Cancel editing"] : citizenTexts["Edit profile"]}
            </button>
          </div>
        </div>
      </aside>

      <main className="citizen-main">
        <div className="citizen-main-inner">
          <CitizenTopBar unreadNotifications={unreadNotifications} availableCouncils={availableCouncils} />

          {isEditing ? (
            <form className="profile-form" onSubmit={handleSave}>
              <h3>{citizenTexts["Edit your details"]}</h3>

              <label>
                {citizenTexts["Full name"]}
                <input
                  name="fullName"
                  value={formState.fullName}
                  onChange={handleChange}
                />
              </label>

              <label>
                {citizenTexts["Ward / Zone"]}
                <input
                  name="ward"
                  value={formState.ward}
                  onChange={handleChange}
                />
              </label>

              <label>
                {citizenTexts["Phone number"]}
                <input
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                />
              </label>

              <label>
                {citizenTexts.Address}
                <textarea
                  name="address"
                  value={formState.address}
                  onChange={handleChange}
                />
              </label>

              <label>
                {citizenTexts["Avatar image URL"]}
                <input
                  name="avatarUrl"
                  value={`http://localhost:3500${formState.avatarUrl}`}
                  onChange={handleChange}
                />
              </label>

              <button className="btn-save" type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : citizenTexts["Save changes"]}
              </button>
            </form>
          ) : isReporting ? (
            <IssueForm
              onSubmit={handleCreateIssue}
              onCancel={() => setIsReporting(false)}
              isSubmitting={isCreating}
            />
          ) : selectedIssue ? (
            <IssueDetails 
              issue={selectedIssue} 
              onClose={() => setSelectedIssue(null)} 
              onCancel={handleCancel}
              onAddPhoto={handleAddPhoto}
            />
          ) : complaintsLoading ? (
            <p>{citizenTexts["Loading your complaints..."]}</p>
          ) : complaintsError ? (
            <p>{citizenTexts["Failed to load your complaints."]}</p>
          ) : complaints.length === 0 ? (
            <EmptyState onReport={() => setIsReporting(true)} />
          ) : (
            <div className="complaints-section">
  {/* 🔥 SEARCH + STATUS DROPDOWN */}
  <div style={{ marginBottom: '1.5rem', padding: '1rem 0' }}>
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      alignItems: 'center', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      {/* 🔥 SEARCH BAR */}
      <div style={{ flex: 1 }}>
        <div style={{
          background: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <svg style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '0.75rem' }} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="🔍 Search by topic, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '1rem',
              color: '#1f2937',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      {/* 🔥 STATUS DROPDOWN */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          style={{
            background: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            color: '#374151',
            fontWeight: '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            whiteSpace: 'nowrap'
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4l6-6m0 0l-6 6m6-6H9" />
          </svg>
          {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All Status'}
          <svg style={{ 
            width: '16px', 
            height: '16px', 
            transition: 'transform 0.2s',
            transform: showStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 🔥 DROPDOWN MENU */}
        {showStatusDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            minWidth: '180px',
            zIndex: 1000,
            marginTop: '0.5rem'
          }}>
            <button
              onClick={() => {
                setStatusFilter('');
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: statusFilter === '' ? '#f3f4f6' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              All Status
            </button>
            <button
              onClick={() => {
                setStatusFilter('pending');
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: statusFilter === 'pending' ? '#f3f4f6' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
              Pending
            </button>
            <button
              onClick={() => {
                setStatusFilter('inprogress');
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: statusFilter === 'inprogress' ? '#f3f4f6' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              In Progress
            </button>
            <button
              onClick={() => {
                setStatusFilter('resolved');
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: statusFilter === 'resolved' ? '#f3f4f6' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              Resolved
            </button>
            <button
              onClick={() => {
                setStatusFilter('cancelled');
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: statusFilter === 'cancelled' ? '#f3f4f6' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              Cancelled
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* 🔥 ISSUE LIST */}
  <IssueCardList 
    issues={filteredComplaints} 
    onViewDetails={setSelectedIssue} 
  />
</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Citizen;