import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../styles/Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault(); setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    try { const result = await resetPassword(token, password); setSuccess(result.message); setTimeout(() => navigate("/login"), 900); }
    catch (requestError) { setError(requestError.message); }
  };

  return <main className="auth-page"><section className="auth-visual"><p className="auth-kicker">FreshDash</p><h1>A fresh start for your account.</h1><p>Choose a new password and keep your account protected.</p></section><section className="auth-panel"><Link className="auth-back" to="/login">← Back to sign in</Link><div className="auth-heading"><p className="auth-kicker">Account recovery</p><h2>Set new password</h2><p>Your reset token is valid for 15 minutes.</p></div><form className="auth-form" onSubmit={handleSubmit}><label>Reset token<input value={token} onChange={(event) => setToken(event.target.value)} required /></label><label>New password<input type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><label>Confirm password<input type="password" minLength="6" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>{error && <p className="auth-error" role="alert">{error}</p>}{success && <p className="auth-success" role="status">{success}</p>}<button className="auth-submit" type="submit">Reset password</button></form></section></main>;
}

export default ResetPassword;
