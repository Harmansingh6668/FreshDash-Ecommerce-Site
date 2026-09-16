import { Link, useLocation } from "react-router-dom";
import "../styles/OrderDetails.css";

const formatDate = (value) => {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

function OrderDetails() {
  const { state } = useLocation();
  let storedOrder = null;
  try {
    storedOrder = JSON.parse(sessionStorage.getItem("freshdash_last_order") || sessionStorage.getItem("freshbasket_last_order") || "null");
  } catch {
    storedOrder = null;
  }
  const order = state?.order || storedOrder;

  if (!order) {
    return (
      <main className="order-details-page">
        <section className="order-details-empty">
          <p className="order-details-eyebrow">Your order</p>
          <h1>Order details unavailable</h1>
          <p>Place an order to see its items, payment, delivery address, and total here.</p>
          <Link className="order-details-button" to="/fruits">Shop fresh produce</Link>
        </section>
      </main>
    );
  }

  const itemSubtotal = order.items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const delivery = Math.max(Number(order.totalAmount || 0) - itemSubtotal, 0);
  const status = order.orderStatus || "pending";
  const paymentLabel = "Cash on delivery";
  const receiptNumber = order._id;
  const customerName = order.shippingAddress?.name || order.user?.name || "Customer";
  const orderSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentStep = orderSteps.indexOf(status);

  return (
    <main className="order-details-page">
      <div className="order-details-container">
        <div className="order-details-heading">
          <div>
            <p className="order-details-eyebrow">FreshDash order</p>
            <h1>Order details</h1>
            <p className="order-details-subtitle">Everything you need to know about this delivery.</p>
          </div>
          <Link className="order-back-link" to="/">Continue shopping</Link>
        </div>

        <section className="order-summary-banner">
          <div>
            <span className="order-summary-label">Order placed</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div>
            <span className="order-summary-label">Order ID</span>
            <strong className="order-id">#{String(order._id).slice(-10)}</strong>
          </div>
          <span className={`order-status order-status-${status}`}>{status}</span>
        </section>

        <div className="order-details-grid">
          <section className="order-details-card order-items-card">
            <div className="order-card-heading">
              <div><p className="order-details-eyebrow">Your basket</p><h2>Items in this order</h2></div>
              <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
            </div>
            <div className="order-detail-items">
              {order.items.map((item, index) => (
                <div className="order-detail-item" key={`${String(item.product)}-${index}`}>
                  <div className="order-detail-image">
                    {item.image ? <img src={item.image} alt={item.name} /> : <span>FB</span>}
                  </div>
                  <div className="order-detail-item-copy">
                    <strong>{item.name}</strong>
                    <span>{formatMoney(item.price)} each · Quantity {item.quantity}</span>
                  </div>
                  <b>{formatMoney(Number(item.price) * Number(item.quantity))}</b>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div><span>Items subtotal</span><b>{formatMoney(itemSubtotal)}</b></div>
              <div><span>Delivery</span><b>{delivery ? formatMoney(delivery) : "FREE"}</b></div>
              <div className="order-total"><span>Total paid</span><strong>{formatMoney(order.totalAmount)}</strong></div>
            </div>
          </section>

          <aside className="order-details-side">
            <section className="order-details-card order-info-card">
              <p className="order-details-eyebrow">Customer</p>
              <h2>{customerName}</h2>
              {order.guestEmail && <p>Email · {order.guestEmail}</p>}
              <p>Phone · {order.shippingAddress?.phone}</p>
            </section>
            <section className="order-details-card order-info-card">
              <p className="order-details-eyebrow">Delivery address</p>
              <h2>Deliver to {customerName}</h2>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
              <p className="order-contact">Delivery contact · {order.shippingAddress?.phone}</p>
            </section>
            <section className="order-details-card order-info-card order-progress-card">
              <p className="order-details-eyebrow">Order progress</p>
              <h2>{status === "cancelled" ? "Order cancelled" : `Order ${status}`}</h2>
              {status === "cancelled" ? <p>This order will not be delivered.</p> : <div className="order-progress-list">
                {orderSteps.map((step, index) => <div className={index <= currentStep ? "order-progress-step active" : "order-progress-step"} key={step}><span>{index <= currentStep ? "✓" : ""}</span><b>{step}</b></div>)}
              </div>}
            </section>
            <section className="order-details-card order-info-card">
              <p className="order-details-eyebrow">Payment</p>
              <h2>{paymentLabel}</h2>
              <p>Method · Cash on delivery</p>
              <p>Payment status · {order.paymentStatus || "pending"}</p>
              <p>Payment will be collected when your order arrives.</p>
            </section>
            <section className="order-details-card order-info-card">
              <p className="order-details-eyebrow">Receipt</p>
              <h2>{receiptNumber}</h2>
              <p>Order reference · {order._id}</p>
              {order.guestEmail && <p>Receipt email · {order.guestEmail}</p>}
            </section>
            <Link className="order-details-button" to="/fruits">Buy more fresh produce</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetails;