import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);
    login({ email, password })
      .then(() => {
        navigate("/admin/dashboard");
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">A</div>

          <div>
            <h2>Admin</h2>
            <span>Store Panel</span>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to manage your store.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p role="alert">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="button button-primary login-button">
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
        <Link className="login-link" to="/forgot-password">Forgot password?</Link>
        <p className="login-switch">Need an account? <Link to="/register">Register admin</Link></p>
      </div>
    </div>
  );
}

export default Login;