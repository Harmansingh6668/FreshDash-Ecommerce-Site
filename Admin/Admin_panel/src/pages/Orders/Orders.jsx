import { useEffect, useState } from "react";
import Badge from "../../Components/common/Badge";
import { getOrders } from "../../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then((result) => setOrders(result.orders));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>View and manage customer orders.</p>
        </div>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>{order._id}</strong>
                  </td>

                  <td>{order.user?.name || order.guestEmail || "Guest"}</td>

                  <td>₹{order.totalAmount}</td>

                  <td>
                    <Badge
                      type={
                        order.orderStatus === "delivered"
                          ? "success"
                          : order.orderStatus === "pending"
                          ? "warning"
                          : "info"
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </td>

                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;