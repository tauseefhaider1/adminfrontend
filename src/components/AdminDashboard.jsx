// components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
  PersonAdd,
  Receipt,
  Refresh
} from '@mui/icons-material';
import adminApi from '../api/Azios';

// helper functions to handle numbers safely
// sometimes the api returns weird values
const safeMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : "0";
};

const safeFixed = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

// show relative time like "5 min ago"
const formatTime = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now - date;

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0
  });

  // load everything when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // fetch all data at once
      const [activitiesRes, productsRes, usersRes, statsRes] = await Promise.all([
        adminApi.get('/api/admin/orders/recent'),
        adminApi.get('/api/admin/products/top'),
        adminApi.get('/api/admin/users/recent'),
        adminApi.get('/api/admin/stats')
      ]);

      // check if we got valid data
      if (activitiesRes.data?.success) {
        setRecentActivities(activitiesRes.data.orders || []);
      }
      if (productsRes.data?.success) {
        setTopProducts(productsRes.data.products || []);
      }
      if (usersRes.data?.success) {
        setRecentUsers(usersRes.data.users || []);
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data);
      }

    } catch (error) {
      console.log('error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h2>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Refresh className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingCart className="h-10 w-10 text-blue-600" />} 
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${safeMoney(stats.totalRevenue)}`} 
          icon={<AttachMoney className="h-10 w-10 text-green-600" />} 
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<People className="h-10 w-10 text-purple-600" />} 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={<Receipt className="h-10 w-10 text-yellow-600" />} 
        />
      </div>

      {/* recent orders section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>

          <div className="bg-white border rounded-xl overflow-hidden">
            {recentActivities.length > 0 ? (
              recentActivities.map(order => (
                <div key={order._id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                  <p className="font-medium">
                    Order #{order._id?.substring(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} items • ${safeFixed(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(order.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No recent orders</div>
            )}
          </div>
        </div>

        {/* right column - can add more stuff here later */}
        <div>
          {/* space for future widgets */}
        </div>
      </div>
    </div>
  );
};

// small reusable card component for stats
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white border rounded-xl p-6 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
    {icon}
  </div>
);

export default AdminDashboard;