import { Link, useLocation } from "react-router-dom";
import "../styles/Checkout.css";

function OrderSuccess() {
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
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="checkout-eyebrow">Order status</p>
          <h1>No recent order found</h1>
          <p>Complete checkout to see your order confirmation here.</p>
          <Link className="checkout-primary-link" to="/fruits">Shop fresh produce</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-confirmation">
        <div className="confirmation-icon">✓</div>
        <p className="checkout-eyebrow">Order confirmed</p>
        <h1>Thank you for your order</h1>
        <p>Your order has been sent to our team for processing.</p>
        <strong>Order ID: {order._id}</strong>
        <div className="confirmation-items">
          {order.items.map((item) => <div key={String(item.product)}><span>{item.name} × {item.quantity}</span><b>₹{(Number(item.price) * item.quantity).toFixed(2)}</b></div>)}
        </div>
        <p>Total ₹{Number(order.totalAmount).toFixed(2)} · {order.paymentStatus === "paid" ? "Paid securely" : "Cash on delivery"}</p>
        <p>{order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}</p>
        <p className="success-return-note">Your order details are ready whenever you need them.</p>
        <Link className="checkout-primary-link" to="/order-details" state={{ order }}>View full order details</Link>
        <Link className="checkout-primary-link" to="/">Continue shopping</Link>
      </section>
    </main>
  );
}

export default OrderSuccess;