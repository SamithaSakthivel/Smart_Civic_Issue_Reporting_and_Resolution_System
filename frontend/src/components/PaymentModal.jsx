import { useState } from 'react';
import '../Contributor.css';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentModal = ({ issue, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) : amount;

  const handlePay = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    if (!effectiveAmount || effectiveAmount < 1) {
      setError('Enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Failed to load payment gateway. Try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: effectiveAmount * 100, // paise
        currency: 'INR',
        name: 'CivicHub — Community Fund',
        description: `Contribute to: ${issue.title}`,
        prefill: { name: 'Contributor', contact: phone },
        theme: { color: '#22d3ee' },
        handler: (response) => {
          setLoading(false);
          onSuccess({
            issueId: issue._id,
            amount: effectiveAmount,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId:   response.razorpay_order_id,
          });
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="payment-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3>Contribute to Issue</h3>
            <p style={{ margin: 0 }}>{issue.title}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6e7a99', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        {/* Preset amounts */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e7a99', display: 'block', marginBottom: '0.6rem' }}>
            Select Amount
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {PRESET_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustomAmount(''); }}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: `1px solid ${amount === a && !customAmount ? 'rgba(34,211,238,0.5)' : 'rgba(148,183,255,0.15)'}`,
                  background: amount === a && !customAmount ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)',
                  color: amount === a && !customAmount ? '#22d3ee' : '#a6b3d0',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                ₹{a.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e7a99', display: 'block', marginBottom: '0.4rem' }}>
            Or Enter Custom Amount (₹)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 300"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); }}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: 'rgba(5,11,31,0.6)',
              border: '1px solid rgba(148,183,255,0.15)',
              borderRadius: '10px',
              color: '#e8efff',
              fontSize: '0.93rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e7a99', display: 'block', marginBottom: '0.4rem' }}>
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="10-digit phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: 'rgba(5,11,31,0.6)',
              border: '1px solid rgba(148,183,255,0.15)',
              borderRadius: '10px',
              color: '#e8efff',
              fontSize: '0.93rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#ff8fa3', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.6rem 0.9rem', background: 'rgba(255,84,112,0.08)', borderRadius: '8px', border: '1px solid rgba(255,84,112,0.2)' }}>
            {error}
          </p>
        )}

        <button
          className="contrib-btn-contribute-large"
          onClick={handlePay}
          disabled={loading || !effectiveAmount || !phone || phone.length < 10}
          style={{ width: '100%' }}
        >
          {loading ? '⏳ Opening Razorpay…' : `💳 Pay ₹${(effectiveAmount || 0).toLocaleString()}`}
        </button>

        <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#6e7a99' }}>
          🔒 Secured by Razorpay &nbsp;|&nbsp; Test: 4386 2894 0766 0153 | 12/26 | CVV: 123
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
