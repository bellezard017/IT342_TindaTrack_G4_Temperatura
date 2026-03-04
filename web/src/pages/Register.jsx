import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";

function Register() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterOwner = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await register(name, email, password, "owner");
      localStorage.setItem("token", response.data.token);
      navigate("/owner/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await register(name, email, password, "staff");
      localStorage.setItem("token", response.data.token);
      navigate("/staff/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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

      {/* RIGHT PANEL - REGISTRATION FORM */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          {!type ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600 mb-8">Choose how you want to join TindaTrack</p>
              <div className="space-y-4">
                <button
                  onClick={() => setType("owner")}
                  className="w-full btn-primary py-3 font-semibold rounded-lg"
                >
                  Create a Store
                </button>
                <button
                  onClick={() => setType("staff")}
                  className="w-full border-2 border-primary text-primary py-3 font-semibold rounded-lg hover:bg-primary/5 transition"
                >
                  Join a Store
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setType("")}
                  className="text-primary font-semibold text-sm hover:underline"
                >
                  ← Back to Options
                </button>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {type === "owner" ? "Create Your Store" : "Join a Store"}
              </h2>
              <p className="text-gray-600 mb-6">
                {type === "owner"
                  ? "Set up your sari-sari store management"
                  : "Enter your details to join as staff"}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form
                onSubmit={type === "owner" ? handleRegisterOwner : handleRegisterStaff}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {type === "owner" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="My Sari-Sari Store"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {type === "staff" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Code</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter store code"
                      value={storeCode}
                      onChange={(e) => setStoreCode(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary font-semibold py-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
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
                <span>
                  {type === "owner" ? "Create Store with Google" : "Join with Google"}
                </span>
              </button>
            </>
          )}

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;