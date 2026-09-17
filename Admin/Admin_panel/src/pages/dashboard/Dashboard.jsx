import { useEffect, useState } from "react";
import StatCard from "../../Components/dashboard/StatCard";
import Badge from "../../Components/common/Badge";
import { getCategories, getOrders, getProducts } from "../../services/api";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    Promise.all([getProducts(true), getCategories(true), getOrders()]).then(
      ([productResult, categoryResult, orderResult]) => {
        setProducts(productResult.products);
        setCategoryCount(categoryResult.categories.length);
        setOrderCount(orderResult.orders.length);
        setRevenue(
          orderResult.orders.reduce(
            (total, order) => total + Number(order.totalAmount || 0),
            0,
          ),
        );
      },
    );
  }, []);

  const recentProducts = products.slice(0, 4);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={products.length}
          icon="□"
          description="From database"
        />

        <StatCard
          title="Categories"
          value={categoryCount}
          icon="◇"
          description="From database"
        />

        <StatCard
          title="Orders"
          value={orderCount}
          icon="≡"
          description="From database"
        />

        <StatCard
          title="Revenue"
          value={`₹${revenue.toFixed(2)}`}
          icon="₹"
          description="Order total"
        />
      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <h3>Recent Products</h3>
            <p>Recently added products in your store.</p>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>{product.category?.name || "No category"}</td>

                  <td>₹{product.price}</td>

                  <td>
                    {Number(product.stock) === 0 ? (
                      <span className="stock-out">Out of stock</span>
                    ) : (
                      Number(product.stock)
                    )}
                  </td>

                  <td>
                    <Badge
                      type={
                        product.status === "published" ? "success" : "warning"
                      }
                    >
                      {product.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;