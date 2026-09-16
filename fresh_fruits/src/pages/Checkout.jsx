import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";
import "../styles/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingOrder, setRedirectingOrder] = useState(null);

  const completeOrder = async (order) => {
    if (!order?._id) {
      throw new Error("Order confirmation was not returned. Please try again.");
    }
    setRedirectingOrder(order);
    try {
      sessionStorage.setItem("freshdash_last_order", JSON.stringify(order));
    } catch {
      // Route state still carries the order when browser storage is unavailable.
    }
    await clearCart();
    navigate("/order-success", { replace: true, state: { order } });
  };

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );
  const delivery = subtotal >= 500 ? 0 : 40;
  const total = subtotal + delivery;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Pincode must contain exactly 6 digits.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderDetails = {
        requestId: crypto.randomUUID(),
        guestEmail: formData.email,
        items: cart.map((item) => ({ product: item.id, quantity: item.quantity })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: formData.paymentMethod,
      };
      let order;
      order = await createOrder(orderDetails);
      await completeOrder(order);
    } catch (requestError) {
      if (requestError.status === 401) {
        navigate("/login?next=/checkout", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (redirectingOrder) {
    return (
      <main className="checkout-page">
        <section className="checkout-confirmation">
          <div className="confirmation-icon">✓</div>
          <p className="checkout-eyebrow">Order placed</p>
          <h1>Order confirmed</h1>
          <p>Your FreshDash order is confirmed and being prepared.</p>
          <p>Redirecting to your order details...</p>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add products before opening checkout.</p>
          <Link className="checkout-primary-link" to="/fruits">Shop fresh produce</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <p className="checkout-eyebrow">Fresh delivery</p>
          <h1>Checkout</h1>
          <p>Enter your details and we will prepare your order.</p>
        </header>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-form-column">
            <section className="checkout-section">
              <div className="section-heading">
                <span>01</span>
                <div>
                  <h2>Customer information</h2>
                  <p>How can we reach you?</p>
                </div>
              </div>
              <div className="checkout-fields">
                <label>Full name<input name="name" value={formData.name} onChange={handleChange} required /></label>
                <label>Phone number<input name="phone" type="tel" inputMode="numeric" maxLength="10" value={formData.phone} onChange={handleChange} required /></label>
                <label className="field-wide">Email address<input name="email" type="email" value={formData.email} onChange={handleChange} required /></label>
              </div>
            </section>

            <section className="checkout-section">
              <div className="section-heading">
                <span>02</span>
                <div>
                  <h2>Delivery address</h2>
                  <p>Where should we deliver?</p>
                </div>
              </div>
              <div className="checkout-fields">
                <label className="field-wide">Address<textarea name="address" value={formData.address} onChange={handleChange} rows="3" required /></label>
                <label>City<input name="city" value={formData.city} onChange={handleChange} required /></label>
                <label>State<input name="state" value={formData.state} onChange={handleChange} required /></label>
                <label>Pincode<input name="pincode" type="tel" inputMode="numeric" maxLength="6" value={formData.pincode} onChange={handleChange} required /></label>
              </div>
            </section>

            <section className="checkout-section">
              <div className="section-heading">
                <span>03</span>
                <div>
                  <h2>Payment method</h2>
                  <p>Choose how you want to pay.</p>
                </div>
              </div>
              <div className="payment-options">
                <label className="payment-option selected">
                  <input type="radio" name="paymentMethod" value="cod" checked readOnly />
                  <span><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span>
                </label>
              </div>
              <p className="payment-provider-note">Pay securely in cash when your fresh order arrives.</p>
            </section>
          </div>

          <aside className="checkout-summary">
            <div className="summary-topline"><span>Your order</span><span>{cart.length} items</span></div>
            <div className="checkout-items">
              {cart.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-image"><img src={item.image_url} alt={item.name} /></div>
                  <div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div>
                  <b>₹{(Number(item.price) * item.quantity).toFixed(2)}</b>
                </div>
              ))}
            </div>
            <div className="checkout-total-lines"><div><span>Subtotal</span><b>₹{subtotal.toFixed(2)}</b></div><div><span>Delivery</span><b>{delivery ? `₹${delivery.toFixed(2)}` : "FREE"}</b></div></div>
            <div className="checkout-grand-total"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
            {error && <p className="checkout-error" role="alert">{error}</p>}
            <button className="place-order-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Placing order..." : "Place order"}</button>
            <Link className="back-cart-link" to="/cart">Back to cart</Link>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
