import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login              from './pages/Login';
import RegistrationType   from './pages/RegistrationType';
import OwnerRegistration  from './pages/OwnerRegistration';
import StaffRegistration  from './pages/StaffRegistration';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Navigate to="/login" replace />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<RegistrationType />} />
        <Route path="/register/owner" element={<OwnerRegistration />} />
        <Route path="/register/staff" element={<StaffRegistration />} />
        {/* <Route path="/dashboard"   element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;