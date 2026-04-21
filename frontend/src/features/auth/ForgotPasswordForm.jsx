// ForgotPasswordForm.jsx - PERFECT FOR Home.jsx
import { useState } from "react";

const ForgotPasswordForm = ({ onBackToLogin, onBack }) => {  // ✅ Both props
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3500/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) setEmail('');
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-form forgot-password-form">
      <div className="auth-header">
        <button className="back-btn" type="button" onClick={onBack}>  {/* Back to CTA */}
          ←
        </button>
        <h2>Forgot Password?</h2>
      </div>

      <p className="forgot-subtitle">
        Enter your email and we'll send you a reset link
      </p>

      <form className="login-modal-form" onSubmit={handleSubmit}>
        <label className="login-modal-label" htmlFor="forgot-email">
          Email Address
        </label>
        <input
          className="login-modal-input"
          id="forgot-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <button
          className="login-modal-btn-primary"
          type="submit"
          disabled={!email || loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && <p className="forgot-message">{message}</p>}

      <p className="switch-text">
        Remember password? 
        <button className="link-btn" onClick={onBackToLogin}>  {/* Back to Login */}
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;