import React, { useState, useEffect } from "react";
import PaymentModal from "./PaymentModal";
const INITIAL_FORM = {
  topic: "", title: "", description: "", category: "", isEmergency: false,
  administration: "", photo: null, councilId: "", councilName: "",
  visibility: "adminOnly", aiSuggestion: null, locationAddress: "",
  lat: null, lng: null
};

const IssueForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [councils, setCouncils] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loadingCouncils, setLoadingCouncils] = useState(false);
  const [councilError, setCouncilError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [verifyingPhoto, setVerifyingPhoto] = useState(false);

  useEffect(() => {
    const loadCouncils = async () => {
      try {
        setLoadingCouncils(true);
        const res = await fetch("http://localhost:3500/councils", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load councils");
        const data = await res.json();
        setCouncils(data);
      } catch (err) {
        console.error("Load councils failed:", err);
        setCouncilError("Could not load councils.");
      } finally {
        setLoadingCouncils(false);
      }
    };
    loadCouncils();
  }, []);

  const autoCategorize = async (description) => {
    if (description.length < 10) return;
    try {
      setAiLoading(true);
      const res = await fetch("http://localhost:3500/api/auto-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });
      if (res.ok) {
        const aiResult = await res.json();
        setFormData(prev => ({ ...prev, aiSuggestion: aiResult }));
        setShowAiSuggestion(true);
      }
    } catch (err) {
      console.error("AI categorize failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const checkDuplicatesBeforeSubmit = async () => {
    if (!formData.councilId || !formData.description) return false;
    try {
      setCheckingDuplicates(true);
      const res = await fetch('http://localhost:3500/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: formData.description,
          councilId: formData.councilId,
          category: formData.category || formData.aiSuggestion?.category
        })
      });
      const result = await res.json();
      console.log('🔍 DUPLICATE CHECK:', result);
      setDuplicateFound(result);
      return result.hasDuplicates || false;
    } catch (err) {
      console.error('❌ Duplicate check failed:', err);
      return false;
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const verifyPhoto = async (file) => {
    try {
      setVerifyingPhoto(true);
      setPhotoError("");
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch("http://localhost:3500/api/verify-photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data && !data.isRealIssue) {
        setPhotoError(`⚠️ AI Rejected Photo: ${data.reason}`);
        setFormData(prev => ({ ...prev, photo: null }));
      }
    } catch(err) {
      console.error(err);
      setPhotoError("Failed to verify photo with AI.");
    } finally {
      setVerifyingPhoto(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0] || null;
      if (file) {
         setFormData(prev => ({ ...prev, [name]: file }));
         verifyPhoto(file);
      } else {
         setFormData(prev => ({ ...prev, [name]: null }));
         setPhotoError("");
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === "description") {
         if (typingTimeout) clearTimeout(typingTimeout);
         setTypingTimeout(setTimeout(() => {
             autoCategorize(value);
         }, 1500));
      }
    }
  };

  const handleCouncilChange = (e) => {
    const selectedId = e.target.value;
    const selected = councils.find(c => c._id === selectedId);
    setFormData(prev => ({
      ...prev,
      councilId: selected?._id || "",
      councilName: selected?.councilName || ""
    }));
  };

  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prev => ({ ...prev, lat, lng, locationAddress: address }));
    setShowMapModal(false);
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          handleLocationSelect(latitude, longitude, address);
        } catch {
          handleLocationSelect(latitude, longitude, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      },
      () => { alert('Enable location access'); setLoadingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useAiSuggestion = () => {
    if (formData.aiSuggestion) {
      setFormData(prev => ({
        ...prev,
        category: formData.aiSuggestion.category,
        administration: formData.aiSuggestion.department,
        isEmergency: formData.aiSuggestion.isEmergency
      }));
      setShowAiSuggestion(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('🔥 SUBMIT STARTED');
  const result = await checkDuplicatesBeforeSubmit();
  console.log('🎯 HAS DUPLICATES?', result.hasDuplicates);
  
  if (result.hasDuplicates) {
    console.log('🚀 SHOWING MODAL NOW');
    setShowDuplicateModal(true);
    return;
  }
  
  console.log('✅ NO DUPLICATES - SUBMITTING');
  onSubmit(formData);
};

  return (
    <>
      <form className="issue-form" onSubmit={handleSubmit}>
        <div className="issue-form-header">
          <h2>📝 Report Issue</h2>
          <button type="button" className="issue-form-cancel" onClick={onCancel}>✕</button>
        </div>

        <label>Topic<input name="topic" value={formData.topic} onChange={handleChange} required /></label>
        <label>Title<input name="title" value={formData.title} onChange={handleChange} required /></label>
        
        <label>Description <span className="ai-hint">🤖 AI auto-categorizes</span>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
          {aiLoading && <span className="ai-loading">🤖 Analyzing...</span>}
        </label>

        {showAiSuggestion && formData.aiSuggestion && (
          <div className="ai-suggestion glass-card">
            <h4>🤖 AI Suggestion</h4>
            <div><strong>Category:</strong> {formData.aiSuggestion.category}</div>
            <div><strong>Department:</strong> {formData.aiSuggestion.department}</div>
            <div><strong>Emergency:</strong> {formData.aiSuggestion.isEmergency ? "YES ⚠️" : "No"}</div>
            <button type="button" className="use-ai-btn" onClick={useAiSuggestion}>✅ Use AI</button>
          </div>
        )}

        <label>Category
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="roads">Roads</option><option value="sanitation">Sanitation</option>
            <option value="streetlights">Streetlights</option><option value="water">Water</option>
            <option value="safety">Safety</option><option value="other">Other</option>
          </select>
        </label>

        <label>Photo<input type="file" name="photo" accept="image/*" onChange={handleChange} />
          <span className="issue-form-help">Max 5MB (optional)</span>
          {verifyingPhoto && <span style={{color: '#3b82f6', fontSize: '0.9rem'}}>🤖 AI Verifying photo...</span>}
          {photoError && <span style={{color: 'red', fontSize: '0.9rem', display: 'block', marginTop: '0.5rem'}}>{photoError}</span>}
        </label>

        <label className="issue-form-row">
          <span>Emergency</span>
          <input type="checkbox" name="isEmergency" checked={formData.isEmergency} onChange={handleChange} />
        </label>

        <label>Department
          <select name="administration" value={formData.administration} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="municipal">Municipal</option><option value="electricity">Electricity</option>
            <option value="waterboard">Water Board</option><option value="police">Police</option>
          </select>
        </label>

        <label>Local Council
          {loadingCouncils ? <span>Loading...</span> : councilError ? <span>{councilError}</span> : null}
          <select name="councilId" value={formData.councilId} onChange={handleCouncilChange} required disabled={loadingCouncils}>
            <option value="">Select council</option>
            {councils.map(c => <option key={c._id} value={c._id}>{c.councilName}</option>)}
          </select>
        </label>

        {/* ✅ MAP LOCATION */}
        <label>📍 Location
          {!formData.locationAddress ? (
            <>
              <button type="button" className="choose-location-btn" style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white',
                border: 'none', padding: '1rem', borderRadius: '12px', width: '100%', marginTop: '0.5rem'
              }} onClick={() => setShowMapModal(true)}>🗺️ Pick on Map</button>
              <button type="button" style={{
                background: '#10b981', color: 'white', border: 'none', padding: '0.75rem',
                borderRadius: '8px', width: '100%', marginTop: '0.5rem'
              }} onClick={getCurrentLocation} disabled={loadingLocation}>
                {loadingLocation ? '📡 Getting GPS...' : '📱 Use Current Location'}
              </button>
            </>
          ) : (
            <div style={{
              display: 'flex', gap: '0.75rem', padding: '0.75rem', background: '#f0fdf4',
              border: '2px solid #10b981', borderRadius: '10px', cursor: 'pointer'
            }} onClick={() => setShowMapModal(true)}>
              <div style={{
                backgroundImage: `url(https://staticmap.openstreetmap.de/${formData.lat},${formData.lng}/80x60.png?markers=${formData.lat},${formData.lng},red)`,
                backgroundSize: 'cover', width: '60px', height: '45px', borderRadius: '6px'
              }} />
              <div>
                <p style={{ color: '#059669', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                  {formData.locationAddress.length > 35 ? formData.locationAddress.substring(0, 35) + '...' : formData.locationAddress}
                </p>
                <p style={{ color: '#047857', fontSize: '0.8rem', margin: 0 }}>
                  📍 {formData.lat?.toFixed(5)}, {formData.lng?.toFixed(5)}
                </p>
              </div>
              <span style={{ fontSize: '1.2rem' }}>↻</span>
            </div>
          )}
        </label>

        <label>Visibility
          <select name="visibility" value={formData.visibility} onChange={handleChange}>
            <option value="adminOnly">Admin Only</option>
            <option value="public">Public</option>
            <option value="contributors">Contributors</option>
          </select>
        </label>

        <button 
          className="issue-form-submit" 
          type="submit" 
          disabled={checkingDuplicates || aiLoading}
        >
             {checkingDuplicates ? '🔍 Checking duplicates...' : '📤 Submit'}
        </button>
      </form>

{showDuplicateModal && true && duplicateFound?.hasDuplicates && (
  <div 
    className="duplicate-modal-overlay"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 999999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}
    onClick={() => setShowDuplicateModal(false)}
  >
    <div 
      style={{
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}
        onClick={() => setShowDuplicateModal(false)}
      >
        ×
      </button>
      
      <h3 style={{ 
        marginBottom: '1.5rem', 
        color: '#059669',
        textAlign: 'center',
        fontSize: '1.4rem'
      }}>
        🔄 Similar Issue Already Exists!
      </h3>
      
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        borderLeft: '4px solid #10b981'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {duplicateFound.duplicates[0].title}
        </div>
        <div style={{ color: '#666', marginBottom: '0.25rem' }}>
          📍 {duplicateFound.duplicates[0].councilName}
        </div>
        <div style={{ 
          color: '#059669', 
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          {(duplicateFound.duplicates[0].similarity * 100).toFixed(0)}% similar
        </div>
        <div style={{ 
          fontSize: '0.9rem', 
          color: '#666',
          marginTop: '0.75rem',
          fontStyle: 'italic'
        }}>
          {duplicateFound.duplicates[0].description?.substring(0, 80)}...
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '1.2rem',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => {
            setShowDuplicateModal(false);
            setShowPaymentModal(true);
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'none'}
        >
          💳 Contribute Now (₹100)
        </button>
        <button 
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onClick={() => {
            setShowDuplicateModal(false);
            const submitData = { ...formData, aiSuggestion: formData.aiSuggestion };
            onSubmit(submitData);
          }}
        >
          ➕ Create New Issue Anyway
        </button>
        <button 
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
          onClick={() => setShowDuplicateModal(false)}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* ✅ MAP MODAL */}
      {showMapModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowMapModal(false)}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', width: 850, maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}>
            <button style={{
              position: 'absolute', top: '1rem', right: '1rem', background: '#ef4444', color: 'white',
              border: 'none', width: 45, height: 45, borderRadius: '50%', fontSize: '1.5rem'
            }} onClick={() => setShowMapModal(false)}>×</button>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>📍 Pick Location</h3>
            <div style={{ height: '450px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=77.0%2C12.0%2C78.0%2C13.5&layer=mapnik&marker=12.97%2C77.59"
                width="100%" height="450" style={{ border: 0 }} allowFullScreen="" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <input id="map-lat" placeholder="Latitude" style={{ padding: '0.75rem', width: '130px', margin: '0 0.5rem' }} />
              <input id="map-lng" placeholder="Longitude" style={{ padding: '0.75rem', width: '130px', margin: '0 0.5rem' }} />
              <button style={{
                background: '#8b5cf6', color: 'white', border: 'none', padding: '0.75rem 1rem',
                borderRadius: '8px', cursor: 'pointer'
              }} onClick={() => {
                const lat = parseFloat(document.getElementById('map-lat').value);
                const lng = parseFloat(document.getElementById('map-lng').value);
                if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                    .then(res => res.json())
                    .then(data => handleLocationSelect(lat, lng, data.display_name || `${lat},${lng}`))
                    .catch(() => handleLocationSelect(lat, lng, `${lat},${lng}`));
                }
              }}>✅ SET LOCATION</button>
            </div>
          </div>
        </div>
      )}
      {showPaymentModal && duplicateFound?.duplicates?.[0] && (
        <PaymentModal
          issue={duplicateFound.duplicates[0]}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={async (paymentData) => {
            setShowPaymentModal(false);
            try {
              const res = await fetch('http://localhost:3500/contributor/contribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(paymentData)
              });
              if(res.ok) {
                 alert("Thank you! Contribution successful.");
                 onCancel();
              } else {
                 alert("Contribution failed on backend.");
              }
            } catch(e) {
               console.error(e);
               alert("Payment error.");
            }
          }}
        />
      )}
    </>
  );
};

export default IssueForm;