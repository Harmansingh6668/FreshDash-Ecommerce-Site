import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAdmin } from "../../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^[A-Za-z ]{2,}$/.test(formData.name.trim())) return setError("Name must contain at least 2 letters.");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    setIsSubmitting(true);
    try {
      await registerAdmin({ name: formData.name, email: formData.email, password: formData.password });
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo"><div className="logo-mark">A</div><div><h2>Admin</h2><span>Store Panel</span></div></div>
        <div className="login-heading"><h1>Create account</h1><p>Register an administrator for your store.</p></div>
        <form onSubmit={handleSubmit}>
          {error && <p role="alert">{error}</p>}
          <div className="form-group"><label htmlFor="name">Full name</label><input id="name" name="name" className="form-input" value={formData.name} onChange={handleChange} required /></div>
          <div className="form-group"><label htmlFor="email">Email</label><input id="email" name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} required /></div>
          <div className="form-group"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength="6" className="form-input" value={formData.password} onChange={handleChange} required /></div>
          <div className="form-group"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" minLength="6" className="form-input" value={formData.confirmPassword} onChange={handleChange} required /></div>
          <button type="submit" className="button button-primary login-button" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create admin account"}</button>
        </form>
        <p className="login-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Register;
