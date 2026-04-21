// LoginForm.jsx - FULL VERSION WITH EYE BUTTONS
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./authApiSlice";
import {setCredentials} from './authSlice';

const LoginForm = ({ onSwitchToSignup, onSwitchToForgot, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ EYE STATE
  const [errMsg, setErrMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleEmailLogin = async(e) => {
    e.preventDefault();
    setErrMsg("");

    const credentials={email,password};

    try {
      const result = await login(credentials).unwrap();
      const accessToken=result.accessToken || result.token;
      const user=result.user ||result.foundUser ||result.userInfo;
      dispatch(setCredentials({ accessToken,user}));

      setEmail("");
      setPassword("");
      setShowPassword(false); // ✅ RESET EYE

      // NEW - Role-based redirect
const firstRole = user.roles?.[0]; // contributor, citizen, adminCouncil
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
      console.log(err);
      const status = err?.status;
      if (!status) setErrMsg("No server response");
      else if (status === 400) setErrMsg("All fields are required");
      else if (status === 401) setErrMsg("Invalid credentials");
      else if(status==409) setErrMsg("email already exists");
      else setErrMsg("Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3500/auth/google";
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <button className="back-btn" type="button" onClick={onBack}>
          ←
        </button>
        <h2>Login</h2>
      </div>

      {errMsg && <p className="login-modal-error">{errMsg}</p>}

      <form className="login-modal-form" onSubmit={handleEmailLogin}>
        <label className="login-modal-label" htmlFor="email">
          Email
        </label>
        <input
          className="login-modal-input"
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
        />

        {/* ✅ PASSWORD WITH EYE BUTTON */}
        <div style={{ position: 'relative' }}>
          <label className="login-modal-label" htmlFor="password">
            Password
          </label>
          <input
            className="login-modal-input"
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="button"
            className="password-eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          className="login-modal-btn-primary"
          type="submit"
          disabled={!email || !password || isLoading}
        >
          {isLoading ? "Logging in…" : "Continue"}
        </button>
      </form>

      <button 
        type="button" 
        className="link-btn"
        onClick={onSwitchToForgot}
      >
        Forgot password?
      </button>

      <div className="login-modal-divider">or</div>

      <button
        className="login-modal-btn-google"
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        Continue with Google
      </button>

      <p className="switch-text">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="link-btn"
          onClick={onSwitchToSignup}
          disabled={isLoading}
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;