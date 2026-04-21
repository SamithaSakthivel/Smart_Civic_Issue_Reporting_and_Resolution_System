import { useState, useRef, useEffect } from "react";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { logOut } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationSidebar from "./NotificationSidebar";
import "../Citizen.css";

const CitizenTopBar = ({ unreadNotifications, availableCouncils }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCouncilDropdown, setShowCouncilDropdown] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target)) {
        setHamburgerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationsClick = () => {
    setShowCouncilDropdown(false);
    setHamburgerOpen(false);
    setShowNotifications(true);
  };

  const handleLogout = async () => {
    setHamburgerOpen(false);
    if (window.confirm("Logout and delete account? This is permanent.")) {
      try {
        await logout().unwrap();
        dispatch(logOut());
        navigate("/", { replace: true });
      } catch {
        alert("Logout failed");
      }
    }
  };

  return (
    <header className="citizen-topbar">
      <div className="citizen-topbar-right">

        {/* Desktop: bell */}
        {!showNotifications && (
          <button className="citizen-notification-btn" onClick={handleNotificationsClick} title="Notifications">
            <span className="notification-bell">🔔</span>
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
        )}

        {/* Desktop: councils */}
        <div className="council-dropdown-container">
          <button className="citizen-org-btn" onClick={() => setShowCouncilDropdown(!showCouncilDropdown)} title="My Councils">
            <span className="citizen-org-icon">🏢</span>
          </button>
          {showCouncilDropdown && (
            <div className="council-dropdown">
              <h4>Select Council</h4>
              {availableCouncils?.length > 0 ? (
                availableCouncils.map((council) => (
                  <div key={council._id} className="council-item" onClick={() => setShowCouncilDropdown(false)}>
                    <span className="council-icon">🏛️</span>
                    <div>
                      <strong>{council.councilName}</strong>
                      <p>{council.administration}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No councils available</p>
              )}
            </div>
          )}
        </div>

        {/* Desktop: logout */}
        <button onClick={handleLogout} disabled={isLoading} className="citizen-logout-btn" title="Logout">
          {isLoading ? "⏳" : "🚪"}
        </button>

        {/* Hamburger (mobile/tablet) */}
        <div style={{ position: "relative" }} ref={hamburgerRef}>
          <button
            className={`hamburger-btn${hamburgerOpen ? " open" : ""}`}
            onClick={() => setHamburgerOpen((v) => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>

          {hamburgerOpen && (
            <div className="hamburger-menu-dropdown">
              <button className="hamburger-menu-item" onClick={handleNotificationsClick}>
                <span>🔔</span>
                Notifications
                {unreadNotifications > 0 && (
                  <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: "999px", fontSize: "0.75rem", padding: "0.1rem 0.5rem", fontWeight: 700 }}>
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button className="hamburger-menu-item" onClick={() => { setHamburgerOpen(false); setShowCouncilDropdown((v) => !v); }}>
                <span>🏢</span>
                My Councils
              </button>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0.25rem 0" }} />

              <button className="hamburger-menu-item danger" onClick={handleLogout} disabled={isLoading}>
                <span>{isLoading ? "⏳" : "🚪"}</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showNotifications && (
        <NotificationSidebar onClose={() => setShowNotifications(false)} unreadCount={unreadNotifications} />
      )}
    </header>
  );
};

export default CitizenTopBar;
