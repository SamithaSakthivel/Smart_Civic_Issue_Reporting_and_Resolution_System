import { useState } from 'react';
import '../Home.css';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const ContributorForm = ({ onClose }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: 10000, // ₹100 in paise
        currency: 'INR',
        name: 'CivicHub — Community Fund',
        description: 'Social Impact Contribution — ₹100',
        prefill: { name: 'Contributor', contact: phone },
        theme: { color: '#22d3ee' },
        handler: (response) => {
          setPaymentId(response.razorpay_payment_id);
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Success state
  if (paymentId) {
    return (
      <div className="contributor-content" style={{ gridTemplateColumns: '1fr', textAlign: 'center', padding: '3rem 2.5rem' }}>
        <button className="contributor-close" onClick={onClose}>✕</button>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3ee08f', marginBottom: '0.5rem' }}>
          Payment Successful!
        </h2>
        <p style={{ color: '#a6b3d0', marginBottom: '1.5rem' }}>
          Thank you for contributing to CivicHub! Your impact matters. 💖
        </p>
        <p style={{ fontSize: '0.78rem', color: '#6e7a99', marginBottom: '2rem' }}>
          Payment ID: <span style={{ color: '#22d3ee', fontWeight: 600 }}>{paymentId}</span>
        </p>
        <button className="contributor-btn" onClick={onClose}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="contributor-content">
      <button className="contributor-close" onClick={onClose}>✕</button>

      {/* Left — quote panel */}
      <div className="contributor-quote">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌍</div>
        <h1>"Big Heart, Bigger Impact"</h1>
        <p>
          Join thousands of citizens funding real civic change. Every rupee goes
          directly toward resolving local issues in your community.
        </p>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(62,224,143,0.06)', border: '1px solid rgba(62,224,143,0.15)', borderRadius: '12px' }}>
          <p style={{ color: '#3ee08f', fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>
            ✅ 100% transparent &nbsp;|&nbsp; 🏅 Earn badges &nbsp;|&nbsp; 📊 Track impact
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="contributor-form">
        <h3 style={{ color: '#e8efff', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
          Contribute ₹100 to get started
        </h3>
        <p style={{ color: '#6e7a99', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
          Join the community and start earning contribution badges.
        </p>

        <form onSubmit={handleContribute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="contributor-phone">
            <span className="contributor-phone-icon">📱</span>
            <input
              type="tel"
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p style={{ color: '#ff8fa3', fontSize: '0.83rem', background: 'rgba(255,84,112,0.08)', border: '1px solid rgba(255,84,112,0.2)', borderRadius: '8px', padding: '0.6rem 0.9rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            className="contributor-btn"
            type="submit"
            disabled={!phone || phone.length < 10 || loading}
          >
            {loading ? '⏳ Opening Razorpay…' : '💳 Pay ₹100 Now'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6e7a99', margin: 0 }}>
            🔒 Secured by Razorpay &nbsp;|&nbsp; Test: 4386 2894 0766 0153
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContributorForm;
