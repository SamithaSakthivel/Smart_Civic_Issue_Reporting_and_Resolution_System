// OAuthSuccess.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setCredentials } from "./authSlice";

const OAuthSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (!token || !userParam) {
      navigate("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(userParam));
    } catch {
      navigate("/login");
      return;
    }

    // store in Redux, same as email/password login
    dispatch(setCredentials({ accessToken: token, user }));

    // role-based redirect
    if (user.roles?.includes("adminCouncil")) {
      navigate("/admin");
    } else {
      navigate("/citizen");
    }
  }, [location.search, dispatch, navigate]);

  return <p>Signing you in with Google…</p>;
};

export default OAuthSuccess;