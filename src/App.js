import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./components/AdminRoutes"; // Make sure this name is correct
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import AdminProducts from "./components/AdminProducts";
import AddProduct from "./components/Product";
import AdminCategories from "./components/AdminCategories";
import LoginPage from "./components/AdminLoginkey"; // Fixed import name
import AdminOrders from "./components/AdminOrders";
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Use your AdminLoginkey component */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="categories" element={<AdminCategories />} />
<Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<div className="p-6">Customers Management</div>} />
          <Route path="analytics" element={<div className="p-6">Analytics</div>} />
          <Route path="shipping" element={<div className="p-6">Shipping Management</div>} />
          <Route path="payments" element={<div className="p-6">Payments Management</div>} />
          <Route path="reviews" element={<div className="p-6">Reviews Management</div>} />
          <Route path="settings" element={<div className="p-6">Settings</div>} />
        </Route>

        {/* 404 - Redirect to login (NOT admin) to prevent loops */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;