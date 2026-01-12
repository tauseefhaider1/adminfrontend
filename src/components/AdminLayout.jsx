// components/AdminLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Dashboard,
  ShoppingCart,
  Inventory,
  People,
  Analytics,
  Settings,
  Logout,
  Menu as MenuIcon,
  ChevronLeft,
  Store,
  LocalShipping,
  Payment,
  Category,
  Reviews,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Dashboard />, path: "/admin" },
    { id: "products", label: "Products", icon: <Inventory />, path: "/admin/products" },
    { id: "orders", label: "Orders", icon: <ShoppingCart />, path: "/admin/orders" },
    // { id: "customers", label: "Customers", icon: <People />, path: "/admin/customers" },
    { id: "categories", label: "Categories", icon: <Category />, path: "/admin/categories" },
    // { id: "analytics", label: "Analytics", icon: <Analytics />, path: "/admin/analytics" },
    // { id: "shipping", label: "Shipping", icon: <LocalShipping />, path: "/admin/shipping" },
    // { id: "payments", label: "Payments", icon: <Payment />, path: "/admin/payments" },
    // { id: "reviews", label: "Reviews", icon: <Reviews />, path: "/admin/reviews" },
  ];

  const stats = [
    { label: "Total Orders", value: "1,254", change: "+12%" },
    { label: "Revenue", value: "$45,230", change: "+8%" },
    { label: "Customers", value: "3,456", change: "+5%" },
    { label: "Products", value: "234", change: "+3%" },
  ];

  // ✅ Proper active detection (nested routes safe)
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isDashboard = location.pathname === "/admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= TOP NAV ================= */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
            </button>

            <div className="ml-4 flex items-center">
              <Store className="text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Notifications />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center">
              <AccountCircle className="text-gray-500" />
              <div className="ml-2 hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@store.com</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r transition-all duration-300`}
        >
          <nav className="px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="px-2 py-4 border-t">
            <Link
              to="/admin/settings"
              className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-1"
            >
              <Logout />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-6">
          {isDashboard && (
            <>
              <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border p-6 shadow-sm">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <span className="text-xs text-green-600">{stat.change}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 🔥 RENDER ADMIN PAGES HERE */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
