// RequireAuth.jsx - PERMANENT FIX (uses YOUR existing queries)
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRefreshQuery } from "./authApiSlice";  // ✅ YOUR QUERY
import { useEffect, useState } from "react";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { accessToken, user } = useSelector((state) => state.auth);
  
  // ✅ USE YOUR EXISTING useRefreshQuery
  const { 
    data: refreshedData, 
    isFetching: isRefreshing,
    isError: refreshError 
  } = useRefreshQuery(undefined, { 
    skip: !!accessToken  // Only refresh if we DON'T have token
  });

  useEffect(() => {
    // ✅ Ready when: have token OR refresh finished
    if (accessToken || (!isRefreshing && !refreshError)) {
      setIsInitialized(true);
    }
  }, [accessToken, isRefreshing, refreshError]);

  // 🔄 LOADING SCREEN
  if (!isInitialized || isRefreshing) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>🔄 Loading...</div>
      </div>
    );
  }

  // ❌ NO TOKEN
  if (!accessToken && !refreshedData?.accessToken) {
    console.log('❌ RequireAuth: No token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ SET REFRESHED DATA (if available)
  const finalUser = refreshedData?.user || user;
  const userRoles = finalUser?.roles || [];

  // ❌ WRONG ROLES
  if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
    console.log(`❌ RequireAuth: No access`, { userRoles, allowedRoles });
    return <Navigate to="/" replace />;
  }

  console.log('✅ RequireAuth: Access granted', { userRoles, allowedRoles });
  return <Outlet />;
};

export default RequireAuth;