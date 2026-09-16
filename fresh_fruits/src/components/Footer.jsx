
import "../styles/Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-section">
          <h2>🍃 FreshDash</h2>
          <p>
            Fresh produce, thoughtfully sourced and delivered to your doorstep.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/fruits">Fruits</Link></li>
            <li><Link to="/vegetables">Vegetables</Link></li>
            <li><Link to="/offers">Offers</Link></li>
            <li><Link to="/cart">Your cart</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li><a href="tel:9855694800">Call support</a></li>
            <li><Link to="/profile">Your account</Link></li>
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
            <li><Link to="/order-success">Order status</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>📍 Tarn Taran, Punjab</p>
          <p>📞 <a href="tel:9855694800">+91 98556 94800</a></p>
          <p>✉️ support@freshdash.in</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 FreshDash. Freshness, made easy.</p>
      </div>

    </footer>
  );
}

export default Footer;