// admin/src/pages/AdminOrderDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/Azios";
import Spinner from "./Spi nner"; // fixed the import path
import Toast from "./Toast";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    // load order when component mounts or id changes
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/orders/admin/${id}`, { withCredentials: true });
      
      if (res.data.success) {
        setOrder(res.data.order);
        setNote(res.data.order.adminNote || "");
      } else {
        setError(res.data.message || "could not load order");
      }
    } catch (err) {
      console.log("error fetching order:", err);
      setError(err.response?.data?.message || "failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await api.put(
        `/api/orders/admin/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (res.data.success) {
        setOrder({ ...order, orderStatus: newStatus });
        setToast({
          type: "success",
          message: `order status updated to ${newStatus}`
        });
      }
    } catch (err) {
      console.log("status update error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "update failed"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await api.put(
        `/api/orders/admin/${id}/payment`,
        { paymentStatus: newStatus },
        { withCredentials: true }
      );

      if (res.data.success) {
        setOrder({ ...order, paymentStatus: newStatus });
        setToast({
          type: "success",
          message: `payment status updated to ${newStatus}`
        });
      }
    } catch (err) {
      console.log("payment update error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "update failed"
      });
    } finally {
      setUpdating(false);
    }
  };

  const saveAdminNote = async () => {
    try {
      setUpdating(true);
      const res = await api.put(
        `/api/orders/admin/${id}/note`,
        { note },
        { withCredentials: true }
      );

      if (res.data.success) {
        setToast({
          type: "success",
          message: "note saved successfully"
        });
        setShowNoteInput(false);
      }
    } catch (err) {
      console.log("note save error:", err);
      setToast({
        type: "error",
        message: "could not save note"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:4534";
    return `${backendUrl}/uploads/products/${imagePath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // helper to get product id safely (handles different data structures)
  const getProductId = (item) => {
    if (!item.product) return "N/A";
    if (typeof item.product === 'object') {
      return item.product._id || "N/A";
    }
    return item.product;
  };

  // helper to get product name safely
  const getProductName = (item) => {
    if (item.name) return item.name;
    if (item.product && typeof item.product === 'object') {
      return item.product.name || "Unknown Product";
    }
    return "Unknown Product";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            back to orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // calculate subtotal from items
  const subtotal = order.items?.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  ) || 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* toast notification */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* header section */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← back to orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <p className="text-gray-500 text-sm">Order ID: {order._id}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchOrderDetails}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            refresh
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            print invoice
          </button>
        </div>
      </div>

      {/* status update cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* order status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Order Status</h3>
          <select
            value={order.orderStatus || "pending"}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={updating}
            className="w-full border rounded-lg px-3 py-2 mb-3 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <p className="text-sm text-gray-500">
            last updated: {formatDate(order.updatedAt)}
          </p>
        </div>

        {/* payment status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Payment Status</h3>
          <select
            value={order.paymentStatus || "pending"}
            onChange={(e) => updatePaymentStatus(e.target.value)}
            disabled={updating}
            className="w-full border rounded-lg px-3 py-2 mb-3 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <p className="text-sm text-gray-500">
            method: {order.paymentMethod?.toUpperCase() || "COD"}
          </p>
        </div>

        {/* customer info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Customer</h3>
          <p className="font-medium">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-gray-600">{order.user?.email || "no email"}</p>
        </div>
      </div>

      {/* order items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Items in this order</h2>
        </div>
        
        <div className="divide-y">
          {order.items?.map((item, index) => {
            const itemImage = getImageUrl(item.image || item.product?.image);
            const productName = getProductName(item);
            const productId = getProductId(item);
            
            return (
              <div key={index} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={itemImage || 'https://via.placeholder.com/80'}
                  alt={productName}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{productName}</h3>
                  <p className="text-sm text-gray-600">
                    ₹{item.price} × {item.quantity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ID: {productId}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* order summary and address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* shipping address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{order.shippingAddress?.fullName}</p>
            <p className="text-gray-700">{order.shippingAddress?.address}</p>
            <p className="text-gray-700">
              {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
            </p>
            <p className="text-gray-700 mt-2">📞 {order.shippingAddress?.phone}</p>
          </div>
        </div>

        {/* order summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-medium">₹{(subtotal * 0.18).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-xl text-blue-600">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* admin notes section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Notes</h2>
        
        {!showNoteInput ? (
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700 mb-3">{note || "no notes added yet."}</p>
            <button
              onClick={() => setShowNoteInput(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + add note
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="add internal notes about this order..."
              className="w-full border rounded-lg p-3"
              rows="3"
            />
            <div className="flex space-x-3">
              <button
                onClick={saveAdminNote}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                save note
              </button>
              <button
                onClick={() => {
                  setShowNoteInput(false);
                  setNote(order.adminNote || "");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}