import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotAdminPassword } from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    try { const result = await forgotAdminPassword(email); setMessage(result.message); setToken(result.resetToken); }
    catch (requestError) { setError(requestError.message); }
  };

  return <div className="login-page"><div className="login-card"><div className="login-logo"><div className="logo-mark">A</div><div><h2>Admin</h2><span>Store Panel</span></div></div><div className="login-heading"><h1>Forgot password?</h1><p>Enter your admin email to reset your password.</p></div><form onSubmit={handleSubmit}>{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}<div className="form-group"><label htmlFor="email">Email</label><input id="email" type="email" className="form-input" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>{token && <div className="reset-token"><strong>{token}</strong><Link to={`/reset-password?token=${token}`}>Continue to reset</Link></div>}<button className="button button-primary login-button" type="submit">Create reset token</button></form><p className="login-switch"><Link to="/login">Back to login</Link></p></div></div>;
}

export default ForgotPassword;
