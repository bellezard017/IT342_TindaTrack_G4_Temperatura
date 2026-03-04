import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function StaffDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tasks = [
    { id: 1, title: "Restock Shelves", time: "10:00 AM", status: "pending" },
    { id: 2, title: "Process Inventory", time: "11:30 AM", status: "in-progress" },
    { id: 3, title: "Customer Service", time: "All Day", status: "in-progress" },
  ];

  const transactions = [
    { customer: "Customer A", amount: "₱240", time: "10:45 AM" },
    { customer: "Customer B", amount: "₱185", time: "10:20 AM" },
    { customer: "Customer C", amount: "₱320", time: "9:55 AM" },
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Staff Member</h2>
          <p className="text-gray-600">Here are your tasks and sales for today</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-600 text-sm mb-1">Tasks Completed</p>
            <p className="text-3xl font-bold text-gray-900">8</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-gray-600 text-sm mb-1">Sales Today</p>
            <p className="text-3xl font-bold text-gray-900">₱1,240</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-4xl mb-2">⏰</div>
            <p className="text-gray-600 text-sm mb-1">Hours Worked</p>
            <p className="text-3xl font-bold text-gray-900">8.5h</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MY TASKS */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Tasks</h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      className="w-5 h-5 text-primary rounded"
                      readOnly
                    />
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {task.status === "completed"
                      ? "Done"
                      : task.status === "in-progress"
                      ? "In Progress"
                      : "To Do"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT SALES */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Sales Today</h3>
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tx.customer}</p>
                    <p className="text-sm text-gray-600">{tx.time}</p>
                  </div>
                  <p className="font-bold text-green-600">{tx.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffDashboard;