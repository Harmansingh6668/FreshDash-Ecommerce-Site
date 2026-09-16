import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, logoutAdmin, updateAdminProfile } from "../../services/api";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    getAdminProfile().then((result) => { setProfile(result.profile); setFormData(result.profile); }).catch((requestError) => setError(requestError.message));
  }, []);

  const handleLogout = async () => {
    try { await logoutAdmin(); } catch { /* clear the local session even if the request fails */ }
    navigate("/login");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try { const result = await updateAdminProfile(formData); setProfile(result.profile); setIsEditing(false); } catch (requestError) { setError(requestError.message); }
  };

  if (error) return <div><p role="alert">{error}</p></div>;
  if (!profile) return <div><p>Loading profile...</p></div>;

  return (
    <div>
      <div className="page-header"><div><h2>Admin Profile</h2><p>Manage your administrator account.</p></div></div>
      <div className="content-card admin-profile-page">
        <div className="profile-avatar profile-avatar-large">{profile.name.charAt(0).toUpperCase()}</div>
        <h2>{profile.name}</h2>
        {isEditing ? <form className="admin-profile-fields" onSubmit={handleSave}>{["name", "phone", "address", "city", "state", "pincode"].map((field) => <label key={field}>{field}<input name={field} value={formData[field] || ""} onChange={(event) => setFormData({ ...formData, [field]: event.target.value })} /></label>)}<button className="button button-primary" type="submit">Save changes</button></form> : <div className="admin-profile-fields"><p>Email: {profile.email}</p><p>Phone: {profile.phone || "Not added"}</p><p>Address: {profile.address || "Not added"}</p><p>City: {profile.city || "Not added"}</p><p>State: {profile.state || "Not added"}</p><p>Pincode: {profile.pincode || "Not added"}</p><span>{profile.role}</span></div>}
        <div className="admin-profile-actions"><button className="button button-secondary" type="button" onClick={() => setIsEditing((current) => !current)}>{isEditing ? "Cancel" : "Edit"}</button><button className="button button-secondary" type="button" onClick={handleLogout}>Log out</button></div>
      </div>
    </div>
  );
}

export default Profile;
