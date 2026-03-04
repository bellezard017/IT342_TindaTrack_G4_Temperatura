import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      
      if (response.data.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/staff/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL - BRANDING */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-white flex-col justify-center px-12 relative overflow-hidden">
        {/* DECORATIVE BUBBLES */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

        <div className="mb-12 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">📦</span>
            </div>
            <h1 className="text-7xl font-bold leading-tight">TindaTrack</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-12 leading-tight opacity-95">Manage Your Sari-Sari Store With Ease</h2>

          {/* FEATURES */}
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Sales Analytics</h3>
                <p className="text-sm opacity-90">Track daily sales and view detailed analytics with interactive charts</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Team Management</h3>
                <p className="text-sm opacity-90">Add staff members and manage permissions with role-based access</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Secure & Reliable</h3>
                <p className="text-sm opacity-90">Your data is safe with secure authentication and cloud backup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to your TindaTrack account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary font-semibold py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button className="w-full border border-gray-300 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4">
              <circle cx="12" cy="12" r="11" fill="none" stroke="#4285F4" strokeWidth="1.5"/>
              <text x="8" y="15" fontSize="10" fill="#4285F4" fontWeight="bold">G</text>
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;   