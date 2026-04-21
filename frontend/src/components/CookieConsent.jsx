
import { useEffect, useState } from "react";

const COOKIE_KEY = "civic-cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ necessary: true, analytics: true })
    );
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ necessary: true, analytics: false })
    );
    setVisible(false);
    
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-text">
        <strong>Civic portal & cookies</strong>
        <span>
          We use cookies to keep your session secure and to improve the app
          experience. You can accept or decline optional cookies.
        </span>
      </div>

      <div className="cookie-actions">
        <button className="cookie-btn secondary" onClick={handleDecline}>
          Decline
        </button>
        <button className="cookie-btn primary" onClick={handleAccept}>
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;