import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./components/AdminRoutes";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import AdminProducts from "./components/AdminProducts";
import AddProduct from "./components/Product";
import AdminCategories from "./components/AdminCategories";
import LoginPage from "./components/AdminLoginkey";
import AdminOrders from "./components/AdminOrders";
import AdminOrderDetails from "./components/Adminorderdrtails";

function App() {
  return (
    <Router>
      <Routes>
        {/* send root to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* all admin routes are protected */}
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
          <Route path="orders/:id" element={<AdminOrderDetails />} />

          {/* placeholder routes for future features */}
          <Route path="customers" element={<div className="p-6">customers (coming soon)</div>} />
          <Route path="analytics" element={<div className="p-6">analytics (coming soon)</div>} />
          <Route path="shipping" element={<div className="p-6">shipping (coming soon)</div>} />
          <Route path="payments" element={<div className="p-6">payments (coming soon)</div>} />
          <Route path="reviews" element={<div className="p-6">reviews (coming soon)</div>} />
          <Route path="settings" element={<div className="p-6">settings</div>} />
        </Route>

        {/* catch all - send to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;