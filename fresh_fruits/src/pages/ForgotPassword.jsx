import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import "../styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    try { const result = await forgotPassword(email); setMessage(result.message); setToken(result.resetToken); }
    catch (requestError) { setError(requestError.message); }
  };

  return <main className="auth-page"><section className="auth-visual"><p className="auth-kicker">FreshDash</p><h1>Let us get you back in.</h1><p>Reset your password securely and continue shopping.</p></section><section className="auth-panel"><Link className="auth-back" to="/login">← Back to sign in</Link><div className="auth-heading"><p className="auth-kicker">Account recovery</p><h2>Forgot password?</h2><p>Enter your account email to create a reset token.</p></div><form className="auth-form" onSubmit={handleSubmit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}{token && <div className="reset-token"><span>Development reset token</span><strong>{token}</strong><Link to={`/reset-password?token=${token}`}>Continue to reset password</Link></div>}<button className="auth-submit" type="submit">Create reset token</button></form></section></main>;
}

export default ForgotPassword;
