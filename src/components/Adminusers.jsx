// components/AdminUsers.jsx
import { useEffect, useState } from "react";
import api from "../api/Azios";
import { useAuth } from "../context/AuthContext";
import { People, Email, CalendarToday, ShoppingBag } from '@mui/icons-material';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // add admin key to headers
      const response = await api.get("/api/users/admin", {
        headers: {
          'x-admin-key': process.env.REACT_APP_ADMIN_KEY
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.log("error fetching users:", err);
      setError("could not load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const response = await api.get(`/api/orders/user/${userId}/admin`, {
        headers: {
          'x-admin-key': process.env.REACT_APP_ADMIN_KEY
        }
      });
      
      if (response.data.success) {
        setUserOrders(response.data.orders);
        setSelectedUser(userId);
      }
    } catch (err) {
      console.log("error fetching user orders:", err);
      alert("failed to load user orders");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="text-sm text-gray-600">
            total users: <span className="font-bold">{users.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* users list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        user
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <People className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {userItem.name || "no name"}
                              </p>
                              <p className="text-sm text-gray-500">
                                id: {userItem._id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Email className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{userItem.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarToday className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">
                              {formatDate(userItem.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium">
                              {userItem.orderCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => fetchUserOrders(userItem._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            view orders
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* user orders sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {selectedUser ? "user orders" : "select a user"}
              </h2>
              
              {selectedUser ? (
                userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              order #{order._id.substring(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          items: {order.items?.length || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-2">
                          total: ₹{order.totalAmount?.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">no orders for this user</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <People className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">click a user to see their orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}