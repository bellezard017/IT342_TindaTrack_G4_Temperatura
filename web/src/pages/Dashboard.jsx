import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { saleApi } from '../api/saleApi';
import SidebarLayout from '../components/SidebarLayout';
import '../styles/dashboard.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip-card">
        <p>{label}</p>
        <p>₱{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ todaySales: 0, transactions: 0, itemsSold: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await saleApi.getDashboard();
        setStats({
          todaySales: data.totalDailySales ?? 0,
          transactions: data.transactionCount ?? 0,
          itemsSold: data.itemsSold ?? 0,
        });
        setRecentSales(data.recentSales || []);
        setTopItems(data.topItems || []);
        setChartData(data.chartData || []);
      } catch {
        setStats({ todaySales: 0, transactions: 0, itemsSold: 0 });
        setRecentSales([]);
        setTopItems([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <SidebarLayout
      pageTitle="Today's Review"
      subtitle={today}
      actionLabel="Record New Sale"
      actionOnClick={() => navigate('/add-sale')}
    >
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Today's Sales</span>
            <div className="stat-icon">₱</div>
          </div>
          <div className="stat-value">₱{stats.todaySales.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Transactions</span>
            <div className="stat-icon">🛒</div>
          </div>
          <div className="stat-value">{stats.transactions}</div>
          <div className="stat-sub">Today's transaction count</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Items Sold</span>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-value">{stats.itemsSold}</div>
          <div className="stat-sub">Total items today</div>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Revenue (Last 7 Days)</h3>
        <div className="chart-wrapper">
          {loading ? (
            <div className="empty-state">Loading revenue chart…</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EEE4" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#E07A5F" strokeWidth={3} dot={{ r: 4, fill: '#E07A5F' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No sales data available yet.</div>
          )}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="table-card">
          <h3 className="table-card-title">Recent Sales</h3>
          {recentSales.length > 0 ? (
            recentSales.map((sale) => (
              <div className="recent-sale-item" key={sale.id}>
                <div>
                  <h4>{sale.name}</h4>
                  <span>{sale.date}</span>
                </div>
                <div>
                  <span className="recent-sale-amount">₱{sale.total.toFixed(2)}</span>
                  <span className="recent-sale-qty">Qty: {sale.quantity}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No recent sales have been recorded.</div>
          )}
        </div>

        <div className="table-card">
          <h3 className="table-card-title">Top Selling Items</h3>
          {topItems.length > 0 ? (
            topItems.map((item) => (
              <div className="top-item" key={item.rank}>
                <div className="top-rank">{item.rank}</div>
                <div className="top-item-info">
                  <h4>{item.name}</h4>
                  <span>{item.sold} units sold</span>
                </div>
                <div className="top-item-amount">₱{item.amount.toFixed(2)}</div>
              </div>
            ))
          ) : (
            <div className="empty-state">No top selling items yet.</div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
