import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login             from './pages/Login';
import RegistrationType  from './pages/RegistrationType';
import OwnerRegistration from './pages/OwnerRegistration';
import StaffRegistration from './pages/StaffRegistration';
import Dashboard         from './pages/Dashboard';
import AddSale           from './pages/AddSale';
import SalesRecords      from './pages/SalesRecords';
import EditSale          from './pages/EditSale';
import StoreManagement   from './pages/StoreManagement';
import Profile           from './pages/Profile';
import OAuthCallback     from './pages/OAuthCallback';
import SetupStore        from './pages/SetupStore';
import SetupStaff        from './pages/SetupStaff';
import StaffDirectory    from './pages/StaffDirectory';
import PrivateRoute      from './components/PrivateRoute';
import RoleBasedRoute    from './components/RoleBasedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/"               element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<RegistrationType />} />
        <Route path="/register/owner" element={<OwnerRegistration />} />
        <Route path="/register/staff" element={<StaffRegistration />} />

        {/* OAuth popup callback */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected routes — redirect to /login if no token */}
        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add-sale"       element={<PrivateRoute><AddSale /></PrivateRoute>} />
        <Route path="/sales"          element={<PrivateRoute><SalesRecords /></PrivateRoute>} />
        <Route path="/edit-sale/:id"  element={<PrivateRoute><EditSale /></PrivateRoute>} />
        <Route path="/store"          element={<RoleBasedRoute allowedRoles={['OWNER']}><StoreManagement /></RoleBasedRoute>} />
        <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/setup-store"    element={<PrivateRoute><SetupStore /></PrivateRoute>} />
        <Route path="/setup-staff"    element={<PrivateRoute><SetupStaff /></PrivateRoute>} />
        <Route path="/staff"          element={<PrivateRoute><StaffDirectory /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
