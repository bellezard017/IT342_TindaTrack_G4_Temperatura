import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login             from './pages/Login';
import RegistrationType  from './pages/RegistrationType';
import OwnerRegistration from './pages/OwnerRegistration';
import StaffRegistration from './pages/StaffRegistration';
import Dashboard         from './pages/Dashboard';
import OAuthCallback     from './pages/OAuthCallback';
import SetupStore        from './pages/SetupStore';
import SetupStaff        from './pages/SetupStaff';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/"                element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<RegistrationType />} />
        <Route path="/register/owner"  element={<OwnerRegistration />} />
        <Route path="/register/staff"  element={<StaffRegistration />} />

        {/* OAuth callback */}
        <Route path="/oauth/callback"  element={<OAuthCallback />} />

        {/* Post-OAuth setup */}
        <Route path="/setup-store"     element={<SetupStore />} />
        <Route path="/setup-staff"     element={<SetupStaff />} />

        {/* App */}
        <Route path="/dashboard"       element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;