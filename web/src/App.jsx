import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerDashboard from "./pages/OwnerDashboard";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
    </Routes>
  );
}

export default App;