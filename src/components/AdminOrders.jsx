import { useEffect, useState } from "react";
import adminApi from "../api/Azios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/api/orders/admin")
      .then(res => {
        setOrders(res.data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>All Orders (Admin)</h2>

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid #000", margin: 10, padding: 10 }}>
          <h4>User Info</h4>
          <p>{order.user.name}</p>
          <p>{order.user.email}</p>

          <h4>Order</h4>
          <p>Total: Rs {order.totalAmount}</p>
          <p>Status: {order.orderStatus}</p>

          {order.items.map(item => (
            <p key={item.product}>
              {item.title} × {item.quantity}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
