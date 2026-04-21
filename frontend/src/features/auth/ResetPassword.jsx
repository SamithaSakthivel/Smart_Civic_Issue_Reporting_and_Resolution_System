// src/features/auth/ResetPassword.jsx - COMPLETE VERSION
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../../Home.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3500/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2500);
      } else {
        setMessage(data.message || "Reset failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="nav-bar">
        <div className="nav-left">Citizen Dashboard</div>
        <div className="nav-right">
          <button className="nav-link" onClick={() => navigate("/")}>
            Home
          </button>
        </div>
      </nav>

      {/* FULLSCREEN RESET PAGE */}
      <div className="reset-password-container">
        <main className="main">
          {/* LEFT SIDE - Hero */}
          <section className="about">
            <h1>Reset Password</h1>
            <p>Securely reset your account password</p>
            <p>Token expires in 1 hour</p>
          </section>

          {/* RIGHT SIDE - RESET FORM */}
          <div className="cta-card">
            <div className="auth-form reset-password-form">
              
              {/* HEADER */}
              <div className="auth-header">
                <button 
                  className="back-btn" 
                  type="button" 
                  onClick={() => navigate("/")}
                  title="Back to Home"
                >
                  ←
                </button>
                <div>
                  <h2>Reset Password</h2>
                  <p className="forgot-subtitle">
                    Enter your new password below
                  </p>
                </div>
              </div>

              {/* MESSAGES */}
              {message && (
                <div className={`forgot-message ${message.includes("successful") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              {/* FORM */}
              <form className="login-modal-form" onSubmit={handleSubmit}>
                
                {/* PASSWORD INPUT + EYE */}
                <div style={{ position: 'relative' }}>
                  <label className="login-modal-label" htmlFor="password">
                    New Password (min 6 chars)
                  </label>
                  <input
                    className="login-modal-input"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* CONFIRM PASSWORD INPUT + EYE */}
                <div style={{ position: 'relative' }}>
                  <label className="login-modal-label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    className="login-modal-input"
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  className="login-modal-btn-primary"
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
                >
                  {loading ? (
                    <>
                      <span className="mr-2">🔄</span>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🔐</span>
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              {/* FOOTER */}
              <div className="login-modal-divider">or</div>
              
              <p className="switch-text">
                Back to{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => navigate("/")}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ResetPassword;