import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LoginForm from './features/auth/LoginForm';
import OAuthSuccess from './features/auth/OAuthSuccess';
import Citizen from './components/Citizen';
import AdminCouncil from './components/AdminCouncil';
import Contributor from './components/Contributor';  // ✅ NEW IMPORT
import CookieConsent from './components/CookieConsent';
import RequireAuth from './features/auth/RequireAuth';
import ResetPassword from './features/auth/ResetPassword';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='/oauth-success' element={<OAuthSuccess />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        
        {/* ✅ Protected Routes - Role-based */}
        <Route element={<RequireAuth allowedRoles={['citizen']} />}>
          <Route path='/citizen' element={<Citizen />} />
        </Route>
        <Route element={<RequireAuth allowedRoles={['adminCouncil']} />}>
          <Route path='/admin' element={<AdminCouncil />} />
        </Route>
        <Route element={<RequireAuth allowedRoles={['contributor']} />}>
          <Route path='/contributor' element={<Contributor />} />
        </Route>
      </Routes>
      <CookieConsent />
    </>
  );
}

export default App;