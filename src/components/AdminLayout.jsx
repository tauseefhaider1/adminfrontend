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

  // main navigation items - keeping only the ones we need for now
  // can add more later when features are ready
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Dashboard />, path: "/admin" },
    { id: "products", label: "Products", icon: <Inventory />, path: "/admin/products" },
    { id: "orders", label: "Orders", icon: <ShoppingCart />, path: "/admin/orders" },
    // customers page coming soon
    // { id: "customers", label: "Customers", icon: <People />, path: "/admin/customers" },
    { id: "categories", label: "Categories", icon: <Category />, path: "/admin/categories" },
    // these are for future releases
    // { id: "analytics", label: "Analytics", icon: <Analytics />, path: "/admin/analytics" },
    // { id: "shipping", label: "Shipping", icon: <LocalShipping />, path: "/admin/shipping" },
    // { id: "payments", label: "Payments", icon: <Payment />, path: "/admin/payments" },
    // { id: "reviews", label: "Reviews", icon: <Reviews />, path: "/admin/reviews" },
  ];

  // some quick stats for the dashboard
  const stats = [
    { label: "Total Orders", value: "1,254", change: "+12%" },
    { label: "Revenue", value: "$45,230", change: "+8%" },
    { label: "Customers", value: "3,456", change: "+5%" },
    { label: "Products", value: "234", change: "+3%" },
  ];

  // check if a menu item is active - handles nested routes too
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    // clear user session and redirect to login
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isDashboard = location.pathname === "/admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* top navigation bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
            </button>

            <div className="ml-4 flex items-center">
              <Store className="text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* notifications bell with indicator */}
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Notifications />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* user profile info */}
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
        {/* sidebar - collapsible */}
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
                <span className="text-gray-600">{item.icon}</span>
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* bottom section of sidebar */}
          <div className="px-2 py-4 border-t">
            <Link
              to="/admin/settings"
              className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-colors"
            >
              <Logout />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>

        {/* main content area */}
        <main className="flex-1 p-6 overflow-auto">
          {isDashboard && (
            <>
              <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

              {/* quick stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* child routes render here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;