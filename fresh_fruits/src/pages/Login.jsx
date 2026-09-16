import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authenticate } from "../services/api";
import "../styles/Auth.css";

function Login({ initialMode = "login" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (mode === "register" && !/^[A-Za-z ]{2,}$/.test(formData.name.trim())) {
      setError("Enter your name using at least 2 letters.");
      return;
    }
    if (mode === "register" && formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }
    if (mode === "register" && !formData.address.trim()) {
      setError("Enter your delivery address.");
      return;
    }
    if (mode === "register" && !formData.city.trim()) {
      setError("Enter your city.");
      return;
    }
    if (mode === "register" && !formData.state.trim()) {
      setError("Enter your state.");
      return;
    }
    if (mode === "register" && !/^\d{6}$/.test(formData.pincode)) {
      setError("Pincode must contain exactly 6 digits.");
      return;
    }
    setIsSubmitting(true);
    try {
      const credentials = { ...formData, email: formData.email.trim().toLowerCase() };
      const result = await authenticate(mode === "login" ? "login" : "register", credentials);
      localStorage.setItem("userAccount", JSON.stringify(result.user));
      window.dispatchEvent(new Event("freshdash:login"));
      const nextPath = searchParams.get("next");
      navigate(nextPath?.startsWith("/") ? nextPath : "/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <p className="auth-kicker">FreshDash</p>
        <h1>Good food starts with good choices.</h1>
        <p>Fresh produce, carefully selected and delivered to your door.</p>
        <span className="auth-produce-mark">✦</span>
      </section>
      <section className="auth-panel">
        <Link className="auth-back" to="/">← Back to store</Link>
        <div className="auth-heading">
          <p className="auth-kicker">Your account</p>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>{mode === "login" ? "Sign in to continue shopping." : "Save your details for a smoother checkout."}</p>
        </div>
        <div className="auth-switcher">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => { setMode("register"); setError(""); }}>Register</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && <label>Full name<input name="name" value={formData.name} onChange={handleChange} autoComplete="name" required /></label>}
          <label>Email address<input name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" required /></label>
          {mode === "register" && <label>Phone number<input name="phone" type="tel" inputMode="numeric" maxLength="10" value={formData.phone} onChange={handleChange} autoComplete="tel" /></label>}
          {mode === "register" && <label>Delivery address<textarea name="address" value={formData.address} onChange={handleChange} autoComplete="street-address" rows="2" required /></label>}
          {mode === "register" && <div className="auth-form-row"><label>City<input name="city" value={formData.city} onChange={handleChange} autoComplete="address-level2" required /></label><label>State<input name="state" value={formData.state} onChange={handleChange} autoComplete="address-level1" required /></label></div>}
          {mode === "register" && <label>Pincode<input name="pincode" type="tel" inputMode="numeric" maxLength="6" value={formData.pincode} onChange={handleChange} autoComplete="postal-code" required /></label>}
          <label>Password<input name="password" type="password" minLength="6" value={formData.password} onChange={handleChange} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
          {mode === "login" && <Link className="login-link" to="/forgot-password">Forgot password?</Link>}
        </form>
      </section>
    </main>
  );
}

export default Login;
