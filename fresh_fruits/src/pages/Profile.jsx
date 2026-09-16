import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, logoutUser, updateUserProfile } from "../services/api";
import "../styles/Auth.css";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    getUserProfile().then((result) => { setProfile(result.profile); setFormData(result.profile); }).catch((requestError) => setError(requestError.message));
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* the server may already have expired the session */ }
    localStorage.removeItem("userAccount");
    window.dispatchEvent(new Event("freshdash:logout"));
    navigate("/");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try { const result = await updateUserProfile(formData); setProfile(result.profile); setIsEditing(false); } catch (requestError) { setError(requestError.message); }
  };

  if (error) return <main className="profile-page"><section className="profile-card"><p className="auth-error">{error}</p><Link to="/login">Sign in again</Link></section></main>;
  if (!profile) return <main className="profile-page"><section className="profile-card"><p>Loading profile...</p></section></main>;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <p className="auth-kicker">Your account</p>
        <h1>{profile.name}</h1>
        {isEditing ? <form className="profile-details" onSubmit={handleSave}>{["name", "phone", "address", "city", "state", "pincode"].map((field) => <label key={field}><span>{field}</span><input name={field} value={formData[field] || ""} onChange={(event) => setFormData({ ...formData, [field]: event.target.value })} /></label>)}<button className="profile-edit-save" type="submit">Save changes</button></form> : <div className="profile-details"><div><span>Name</span><strong>{profile.name}</strong></div><div><span>Email</span><strong>{profile.email}</strong></div><div><span>Phone</span><strong>{profile.phone || "Not added"}</strong></div><div><span>Address</span><strong>{profile.address || "Not added"}</strong></div><div><span>City</span><strong>{profile.city || "Not added"}</strong></div><div><span>State</span><strong>{profile.state || "Not added"}</strong></div><div><span>Pincode</span><strong>{profile.pincode || "Not added"}</strong></div></div>}
        <div className="profile-actions"><Link to="/">Continue shopping</Link><button type="button" onClick={() => setIsEditing((current) => !current)}>{isEditing ? "Cancel" : "Edit"}</button><button type="button" onClick={handleLogout}>Log out</button></div>
      </section>
    </main>
  );
}

export default Profile;
