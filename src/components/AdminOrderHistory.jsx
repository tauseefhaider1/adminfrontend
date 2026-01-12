// // components/AdminOrders.jsx
// import { useEffect, useState } from "react";
// import adminApi from "../api/Azios";
// import { useAuth } from "../context/AuthContext";

// // ✅ helper functions
// const formatPrice = (amount) => {
//   const num = Number(amount);////
//   return Number.isFinite(num) ? num.toFixed(2) : "0.00";
// };

// const formatDate = (date) => {
//   return date ? new Date(date).toLocaleDateString() : "—";
// };

// export default function AdminOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         const response = await adminApi.get("/api/orders/admin");

//         if (response.data.success) {
//           setOrders(response.data.orders);
//         } else {
//           setError(response.data.message);
//         }
//       } catch (err) {
//         console.error("Error:", err);
//         setError("Failed to load orders.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.role === "admin") {
//       fetchOrders();
//     } else {
//       setError("Admin access required.");
//       setLoading(false);
//     }
//   }, [user]);

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       const response = await adminApi.put(`/api/orders/${orderId}/status`, {
//         status: newStatus,
//       });

//       if (response.data.success) {
//         setOrders((prev) =>
//           prev.map((order) =>
//             order._id === orderId ? { ...order, status: newStatus } : order
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       alert("Failed to update order");
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "processing":
//         return "bg-blue-100 text-blue-800";
//       case "shipped":
//         return "bg-purple-100 text-purple-800";
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       case "cancelled":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={() => window.history.back()}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">Admin Orders</h1>
//           <div className="text-sm text-gray-600">
//             Total Orders: <span className="font-bold">{orders.length}</span>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(
//                   (h) => (
//                     <th
//                       key={h}
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
//                     >
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>

//             <tbody className="bg-white divide-y divide-gray-200">
//               {orders.map((order) => (
//                 <tr key={order._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     #{order._id?.substring(0, 8)}
//                   </td>

//                   <td className="px-6 py-4">
//                     <p className="font-medium">{order.user?.name || "Unknown"}</p>
//                     <p className="text-sm text-gray-500">
//                       {order.user?.email || "No email"}
//                     </p>
//                   </td>

//                   <td className="px-6 py-4">
//                     {order.items?.length || 0} items
//                   </td>

//                   <td className="px-6 py-4 font-medium">
//                     ${formatPrice(order.totalAmount)}
//                   </td>

//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                         order.status
//                       )}`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {formatDate(order.createdAt)}
//                   </td>

//                   <td className="px-6 py-4">
//                     <select
//                       value={order.status}
//                       onChange={(e) =>
//                         updateOrderStatus(order._id, e.target.value)
//                       }
//                       className="border border-gray-300 rounded px-3 py-1 text-sm"
//                     >
//                       {["pending", "processing", "shipped", "delivered", "cancelled"].map(
//                         (s) => (
//                           <option key={s} value={s}>
//                             {s}
//                           </option>
//                         )
//                       )}
//                     </select>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {orders.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               No orders found
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// 