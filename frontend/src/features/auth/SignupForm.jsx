// SignupForm.jsx - FULL UPDATED VERSION (Auto-login + Role Redirect)
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation, useLoginMutation } from "./authApiSlice"; // ✅ Added login
import { setCredentials } from './authSlice';
import ReCAPTCHA from "react-google-recaptcha";

const SignupForm = ({ onSwitchToLogin, onBack }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("citizen");
  const [errMsg, setErrMsg] = useState("");
  const [councilName, setCouncilName] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login] = useLoginMutation(); // ✅ NEW: Login mutation

  const handleSignup = async e => {
    e.preventDefault();
    setErrMsg("");

    if (!captchaToken) {
      setErrMsg("Please verify that you are not a robot.");
      return;
    }

    try {
      // ✅ 1. Register new user
      await register({
        username,
        email,
        password,
        roles: [role],
        councilName: role === "adminCouncil" ? councilName : undefined,
        captchaToken,
      }).unwrap();

      // ✅ 2. Auto-login immediately
      const loginResult = await login({ email, password }).unwrap();
      const accessToken = loginResult.accessToken;
      const user = loginResult.user;
      dispatch(setCredentials({ accessToken, user }));

      // ✅ 3. Clear form
      setUsername("");
      setEmail("");
      setPassword("");
      setCouncilName("");
      setRole("citizen");
      setShowPassword(false);
      setCaptchaToken(null);

      // ✅ 4. Role-based redirect (NO onSwitchToLogin!)
      const firstRole = user.roles?.[0];
      switch (firstRole) {
        case 'contributor':
          navigate('/contributor');
          break;
        case 'adminCouncil':
          navigate('/admin');
          break;
        case 'citizen':
        default:
          navigate('/citizen');
          break;
      }
    } catch (err) {
      const status = err?.status;
      if (!status) setErrMsg("No server response");
      else if (status === 400) setErrMsg(err?.data?.message || "All fields are required");
      else if (status === 409) setErrMsg("Email already exists");
      else setErrMsg("Sign up failed");
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <button className="back-btn" type="button" onClick={onBack}>
          ←
        </button>
        <h2>Sign up</h2>
      </div>

      {errMsg && <p className="login-modal-error">{errMsg}</p>}

      <form className="login-modal-form" onSubmit={handleSignup}>
        <label className="login-modal-label" htmlFor="username">
          Name
        </label>
        <input
          className="login-modal-input"
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={isRegistering}
        />

        <label className="login-modal-label" htmlFor="email">
          Email
        </label>
        <input
          className="login-modal-input"
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isRegistering}
        />

        <div style={{ position: "relative" }}>
          <label className="login-modal-label" htmlFor="password">
            Password
          </label>
          <input
            className="login-modal-input"
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isRegistering}
          />
          <button
            type="button"
            className="password-eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isRegistering}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label className="login-modal-label" htmlFor="role">
          Sign up as
        </label>
        <select
          id="role"
          className="login-modal-input"
          value={role}
          onChange={e => setRole(e.target.value)}
          disabled={isRegistering}
        >
          <option value="citizen">Citizen</option>
          <option value="adminCouncil">adminCouncil</option>
          <option value="contributor">Contributor</option>
        </select>

        {role === "adminCouncil" && (
          <>
            <label className="login-modal-label" htmlFor="councilName">
              Administration / council name
            </label>
            <input
              id="councilName"
              className="login-modal-input"
              type="text"
              value={councilName}
              onChange={e => setCouncilName(e.target.value)}
              disabled={isRegistering}
            />
          </>
        )}

        <div style={{ margin: "12px 0" }}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
            onExpired={() => setCaptchaToken(null)}
          />
        </div>

        <button
          className="login-modal-btn-primary"
          type="submit"
          disabled={
            !username ||
            !email ||
            !password ||
            (role === "adminCouncil" && !councilName) ||
            !captchaToken ||
            isRegistering
          }
        >
          {isRegistering ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="switch-text">
        Already have an account?{" "}
        <button
          type="button"
          className="link-btn"
          onClick={onSwitchToLogin}
          disabled={isRegistering}
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupForm;