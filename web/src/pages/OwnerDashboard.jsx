import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function OwnerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    {
      label: "Today's Sales",
      value: "₱2,450.00",
      icon: "💰",
      color: "bg-blue-50",
    },
    {
      label: "Transactions",
      value: "24",
      icon: "📊",
      color: "bg-green-50",
    },
    {
      label: "Items Sold",
      value: "156",
      icon: "📦",
      color: "bg-orange-50",
    },
    {
      label: "Staff Members",
      value: "5",
      icon: "👥",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              📦
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TindaTrack</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Store Owner</h2>
          <p className="text-gray-600">Here's your store performance today</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-lg p-6 border border-gray-200`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Juan Dela Cruz</p>
                  <p className="text-sm text-gray-600">10:30 AM</p>
                </div>
                <p className="font-bold text-green-600">+₱340</p>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Maria Santos</p>
                  <p className="text-sm text-gray-600">10:15 AM</p>
                </div>
                <p className="font-bold text-green-600">+₱245</p>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-900">Pedro Garcia</p>
                  <p className="text-sm text-gray-600">9:45 AM</p>
                </div>
                <p className="font-bold text-green-600">+₱165</p>
              </div>
            </div>
          </div>

          {/* MANAGE STAFF */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Staff Members</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Anna Lee</p>
                  <p className="text-sm text-gray-600">Cashier</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Robert Cruz</p>
                  <p className="text-sm text-gray-600">Stock Manager</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-900">Lisa Wong</p>
                  <p className="text-sm text-gray-600">Assistant</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Inactive</span>
              </div>
            </div>
            <button className="w-full mt-4 btn-primary py-2 rounded-lg">
              Add New Staff Member
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OwnerDashboard;