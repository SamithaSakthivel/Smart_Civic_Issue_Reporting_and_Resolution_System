import Navbar from "./Navbar"
import { useState, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import '../Home.css'
import LoginForm from "../features/auth/LoginForm"
import SignupForm from "../features/auth/SignupForm"
import ForgotPasswordForm from "../features/auth/ForgotPasswordForm"
import ContributorForm from "./ContributorForm"

// ── Query Form Component ─────────────────────────────────────────────────────
const QueryForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:3500/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="query-success">
        <div className="query-success-icon">🎉</div>
        <h3>Message Sent!</h3>
        <p>
          We'll reach out to you soon at your email. A confirmation has also been
          sent to your inbox — check your spam folder if you don't see it.
        </p>
        <button className="query-send-again" onClick={() => setStatus('idle')}>
          Send another query
        </button>
      </div>
    );
  }

  return (
    <form className="query-form" onSubmit={handleSubmit} noValidate>
      <div className="query-form-row">
        <div className="query-field">
          <label className="query-label" htmlFor="q-name">Your Name</label>
          <input
            id="q-name"
            className="query-input"
            type="text"
            name="name"
            placeholder="e.g. Ramesh Kumar"
            value={form.name}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
        </div>
        <div className="query-field">
          <label className="query-label" htmlFor="q-email">Your Email</label>
          <input
            id="q-email"
            className="query-input"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
        </div>
      </div>

      <div className="query-field">
        <label className="query-label" htmlFor="q-message">Your Query</label>
        <textarea
          id="q-message"
          className="query-textarea"
          name="message"
          placeholder="Describe your issue, idea, or question in detail..."
          value={form.message}
          onChange={handleChange}
          rows={5}
          required
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && (
        <div className="query-error-msg">⚠️ {errorMsg}</div>
      )}

      <button
        type="submit"
        className={`query-submit-btn${status === 'loading' ? ' loading' : ''}`}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <><span className="query-spinner" /> Sending…</>
        ) : (
          <><span>✉️</span> Send Query</>
        )}
      </button>

      <p className="query-privacy-note">
        We reply directly to your email. No spam, ever.
      </p>
    </form>
  );
};

// ── Main Home Component ──────────────────────────────────────────────────────
const Home = () => {
    const { t } = useLanguage();
    const [mode, setMode] = useState("cta");
    const [showContributor, setShowContributor] = useState(false);
    const [texts, setTexts] = useState({});

    useEffect(() => {
        const loadAllTexts = async () => {
            setTexts({
                CivicHub: await t('CivicHub'),
                Pro: await t('Pro'),
                reportSubtitle: await t('Report civic issues in seconds. Real-time tracking. Transparent resolution.'),
                instantReporting: await t('Instant Reporting'),
                liveUpdates: await t('Live Updates'),
                councilDashboard: await t('Council Dashboard'),
                becomeContributor: await t('Become a Contributor'),
                welcomeBack: await t('Welcome Back'),
                accessDashboard: await t('Access your dashboard'),
                login: await t('Login'),
                newHere: await t('New here?'),
                createAccount: await t('Create Account')
            });
        };
        loadAllTexts();
    }, [t]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setShowContributor(false);
        };
        if (showContributor) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [showContributor]);

    return (
        <>
            <div className="home-split-container">
                <Navbar />

                <div className="home-left">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            {texts.CivicHub || 'CivicHub'}
                            <span className="hero-glow">{texts.Pro || 'Pro'}</span>
                        </h1>
                        <p className="hero-subtitle">
                            {texts.reportSubtitle || 'Report civic issues in seconds. Real-time tracking. Transparent resolution.'}
                        </p>
                        <div className="hero-features">
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                {texts.instantReporting || 'Instant Reporting'}
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📱</span>
                                {texts.liveUpdates || 'Live Updates'}
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🏛️</span>
                                {texts.councilDashboard || 'Council Dashboard'}
                            </div>
                        </div>
                        <button className="contributor-trigger" onClick={() => setShowContributor(true)}>
                            🌟 {texts.becomeContributor || 'Become a Contributor'}
                        </button>
                    </div>
                </div>

                <div className="home-right">
                    <div className="cta-card">
                        {mode === "cta" && (
                            <>
                                <div className="cta-welcome">
                                    <h2>{texts.welcomeBack || 'Welcome Back'}</h2>
                                    <p>{texts.accessDashboard || 'Access your dashboard'}</p>
                                </div>
                                <button className="cta-btn primary" onClick={() => setMode("login")}>
                                    {texts.login || 'Login'}
                                </button>
                                <p className="cta-or">{texts.newHere || 'New here?'}</p>
                                <button className="cta-btn" onClick={() => setMode("signup")}>
                                    {texts.createAccount || 'Create Account'}
                                </button>
                            </>
                        )}
                        {mode === "login" && (
                            <LoginForm
                                onSwitchToSignup={() => setMode("signup")}
                                onSwitchToForgot={() => setMode("forgot")}
                                onBack={() => setMode("cta")}
                            />
                        )}
                        {mode === "signup" && (
                            <SignupForm onSwitchToLogin={() => setMode("login")} onBack={() => setMode("cta")} />
                        )}
                        {mode === "forgot" && (
                            <ForgotPasswordForm onBackToLogin={() => setMode("login")} onBack={() => setMode("cta")} />
                        )}
                    </div>
                </div>
            </div>

            {/* ── QUERIES SECTION ── */}
            <section id="queries-section" className="queries-section">
                <div className="queries-inner">
                    <div className="queries-badge">📬 Get in Touch</div>
                    <h2 className="queries-title">Have a Query?</h2>
                    <p className="queries-subtitle">
                        Fill out the form below and we'll get back to you within 24–48 hours.
                        A confirmation will be sent to your email straight away.
                    </p>
                    <div className="queries-form-card">
                        <QueryForm />
                    </div>
                    <p className="queries-footer-note">
                        We typically respond within <strong>24–48 hours</strong> on working days.
                    </p>
                </div>
            </section>

            {showContributor && (
                <div
                    className="contributor-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowContributor(false); }}
                >
                    <ContributorForm onClose={() => setShowContributor(false)} />
                </div>
            )}
        </>
    );
};

export default Home;
