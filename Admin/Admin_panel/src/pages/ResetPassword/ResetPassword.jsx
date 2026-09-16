import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetAdminPassword } from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault(); setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    try { const result = await resetAdminPassword(token, password); setMessage(result.message); setTimeout(() => navigate("/login"), 900); }
    catch (requestError) { setError(requestError.message); }
  };

  return <div className="login-page"><div className="login-card"><div className="login-logo"><div className="logo-mark">A</div><div><h2>Admin</h2><span>Store Panel</span></div></div><div className="login-heading"><h1>Reset password</h1><p>Choose a new admin password.</p></div><form onSubmit={handleSubmit}>{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}<div className="form-group"><label htmlFor="token">Reset token</label><input id="token" className="form-input" value={token} onChange={(event) => setToken(event.target.value)} required /></div><div className="form-group"><label htmlFor="password">New password</label><input id="password" type="password" minLength="6" className="form-input" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div className="form-group"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" minLength="6" className="form-input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div><button className="button button-primary login-button" type="submit">Reset password</button></form><p className="login-switch"><Link to="/login">Back to login</Link></p></div></div>;
}

export default ResetPassword;
