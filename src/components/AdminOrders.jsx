// admin/src/pages/AdminOrders.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApi from "../api/Azios";
import { useAdminAuth } from "../context/admincontext";
import Spinner from "./Spi nner";// fixed import
import Toast from "./Toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    payment: "all",
    search: "",
    dateRange: "all"
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
    pendingRevenue: 0
  });

  const { isAdmin } = useAdminAuth();

  // check if user is logged in
  useEffect(() => {
    const adminKey = localStorage.getItem('admin_key');
    console.log("admin key in storage:", adminKey ? "yes" : "no");
    
    if (!adminKey) {
      setToast({
        type: "error",
        message: "please login first"
      });
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    }
  }, []);

  // load orders when admin is authenticated
  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("fetching orders from: /api/admin/orders");
      
      const res = await adminApi.get("/api/admin/orders");
      
      console.log("orders fetched:", res.data);
      
      if (res.data.success) {
        setOrders(res.data.orders || []);
        calculateStats(res.data.orders || []);
      } else {
        setError(res.data.message || "could not load orders");
      }
    } catch (err) {
      console.log("error fetching orders:", err);
      
      if (err.response?.status === 401) {
        setError("session expired. please login again.");
        setToast({
          type: "error",
          message: "redirecting to login..."
        });
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else if (err.response?.status === 404) {
        // try different endpoint if first one fails
        console.log("trying alternative endpoint: /api/orders/admin");
        try {
          const altRes = await adminApi.get("/api/orders/admin");
          if (altRes.data.success) {
            setOrders(altRes.data.orders || []);
            calculateStats(altRes.data.orders || []);
            return;
          }
        } catch (altErr) {
          console.log("alternative also failed");
          setError("orders endpoint not found. check backend.");
        }
      } else {
        setError(err.response?.data?.message || "failed to load orders");
        setToast({
          type: "error",
          message: "could not load orders. try refreshing."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // calculate order statistics
  const calculateStats = (ordersData) => {
    const newStats = {
      total: ordersData.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
      pendingRevenue: 0
    };

    ordersData.forEach(order => {
      const status = order.orderStatus?.toLowerCase() || "pending";
      const amount = order.totalAmount || 0;

      if (newStats.hasOwnProperty(status)) {
        newStats[status]++;
      }

      if (status === "delivered") {
        newStats.revenue += amount;
      } else if (status === "pending" || status === "processing") {
        newStats.pendingRevenue += amount;
      }
    });

    setStats(newStats);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminApi.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus }
      );

      if (res.data.success) {
        const updatedOrders = orders.map(order =>
          order._id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        );
        setOrders(updatedOrders);
        calculateStats(updatedOrders);
        
        setToast({
          type: "success",
          message: `status updated to ${newStatus}`
        });
      }
    } catch (err) {
      console.log("update error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "update failed"
      });
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      const res = await adminApi.put(
        `/api/admin/orders/${orderId}/payment`,
        { paymentStatus: newStatus }
      );

      if (res.data.success) {
        const updatedOrders = orders.map(order =>
          order._id === orderId 
            ? { ...order, paymentStatus: newStatus }
            : order
        );
        setOrders(updatedOrders);
        
        setToast({
          type: "success",
          message: `payment updated to ${newStatus}`
        });
      }
    } catch (err) {
      console.log("payment update error:", err);
      setToast({
        type: "error",
        message: "could not update payment"
      });
    }
  };

  // filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // status filter
    if (filters.status !== "all" && order.orderStatus?.toLowerCase() !== filters.status) {
      return false;
    }
    // payment filter
    if (filters.payment !== "all" && order.paymentStatus?.toLowerCase() !== filters.payment) {
      return false;
    }
    // search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const orderId = order._id?.toLowerCase() || "";
      const customerName = order.shippingAddress?.fullName?.toLowerCase() || "";
      if (!orderId.includes(searchTerm) && !customerName.includes(searchTerm)) {
        return false;
      }
    }
    // date filter - not implemented yet
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <p className="text-gray-600 mt-2">
          manage orders, update statuses, and track payments
        </p>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-lg font-bold text-emerald-600">₹{stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500">Pending ₹</p>
          <p className="text-lg font-bold text-orange-600">₹{stats.pendingRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* filters section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.payment}
            onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <input
            type="text"
            placeholder="search by order ID or customer..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    no orders found matching your filters
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.shippingAddress?.fullName || "N/A"}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.phone || ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.orderStatus || "pending"}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded border ${getStatusBadge(order.orderStatus)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.paymentStatus || "pending"}
                        onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded border ${
                          order.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        view →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t">
          <p className="text-sm text-gray-600">
            showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* action buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => alert("export feature coming soon")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          export CSV
        </button>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          refresh
        </button>
      </div>
    </div>
  );
}