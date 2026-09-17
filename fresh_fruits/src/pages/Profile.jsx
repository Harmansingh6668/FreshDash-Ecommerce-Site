import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, logoutUser, updateUserProfile } from "../services/api";
import "../styles/Profile.css";

const fields = ["name", "phone", "address", "city", "state", "pincode"];
const emptyValue = "Not added yet";

const formFromProfile = (profile) => fields.reduce((values, field) => ({ ...values, [field]: profile?.[field] || "" }), {});
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date)) : emptyValue;
const syncAccount = (user) => {
  if (!user) return;
  localStorage.setItem("userAccount", JSON.stringify(user));
  window.dispatchEvent(new Event("freshdash:account-updated"));
};

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(formFromProfile());

  useEffect(() => {
    let active = true;
    getUserProfile().then((result) => {
      if (!active) return;
      setProfile(result.profile);
      setFormData(formFromProfile(result.profile));
      syncAccount(result.user);
    }).catch(() => { if (active) setError("Unable to load your profile. Please try again."); });
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* the server may already have expired the session */ }
    localStorage.removeItem("userAccount");
    window.dispatchEvent(new Event("freshdash:logout"));
    navigate("/login", { replace: true });
  };

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  const cancelEdit = () => { setFormData(formFromProfile(profile)); setError(""); setIsEditing(false); };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!/^[A-Za-z ]{2,}$/.test(formData.name.trim())) return setError("Enter your name using at least 2 letters.");
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) return setError("Phone number must contain exactly 10 digits.");
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) return setError("Pincode must contain exactly 6 digits.");
    setIsSaving(true);
    try {
      const result = await updateUserProfile(formData);
      setProfile(result.profile);
      setFormData(formFromProfile(result.profile));
      syncAccount(result.user);
      setIsEditing(false);
      setNotice("Profile updated successfully");
    } catch {
      setError("Unable to update your profile. Please try again.");
    } finally { setIsSaving(false); }
  };

  if (error && !profile) return <main className="profile-page"><section className="profile-state"><b>!</b><h1>We couldn&apos;t load that</h1><p>Unable to load your profile. Please try again.</p><Link className="profile-primary" to="/login">Sign in again</Link></section></main>;
  if (!profile) return <main className="profile-page"><section className="profile-state"><span className="profile-spinner" /><h1>Loading your profile...</h1><p>Getting your latest account details.</p></section></main>;

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <header className="profile-hero"><div className="profile-avatar">{initials(profile.name)}</div><div className="profile-identity"><small>Your FreshDash account</small><h1>{profile.name}</h1><a href={`mailto:${profile.email}`}>{profile.email}</a><span>● Active member</span></div><div className="profile-actions"><button type="button" onClick={() => { setError(""); setNotice(""); setIsEditing(true); }}>✎ Edit profile</button><button type="button" onClick={handleLogout}>↗ Log out</button></div></header>
        {notice && <div className="profile-notice success" role="status">✓ {notice}</div>}
        {error && profile && <div className="profile-notice error" role="alert">{error}</div>}
        {isEditing ? <form className="profile-panel" onSubmit={handleSave}><div className="profile-heading"><div><small>Keep it current</small><h2>Edit your details</h2></div><button type="button" onClick={cancelEdit} aria-label="Cancel editing">×</button></div><div className="profile-form">
          <label>Full name<input name="name" value={formData.name} onChange={handleChange} required /></label><label>Email address<input value={profile.email} readOnly /></label><label>Phone number<input name="phone" value={formData.phone} onChange={handleChange} inputMode="numeric" maxLength="10" /></label><label className="wide">Address<textarea name="address" value={formData.address} onChange={handleChange} rows="3" /></label><label>City<input name="city" value={formData.city} onChange={handleChange} /></label><label>State<input name="state" value={formData.state} onChange={handleChange} /></label><label>Postal code<input name="pincode" value={formData.pincode} onChange={handleChange} inputMode="numeric" maxLength="6" /></label>
        </div><div className="profile-form-actions"><button type="button" onClick={cancelEdit}>Cancel</button><button className="profile-primary" type="submit" disabled={isSaving}>{isSaving ? "Saving changes..." : "Save changes"}</button></div></form> : <div className="profile-grid">
          <section className="profile-panel"><div className="profile-heading"><div><small>The essentials</small><h2>Personal information</h2></div><em>01</em></div><div className="profile-list"><div><b>◉</b><span>Full name<strong>{profile.name}</strong></span></div><div><b>@</b><span>Email address<strong>{profile.email}</strong></span></div><div><b>⌕</b><span>Phone number<strong>{profile.phone || emptyValue}</strong></span></div></div></section>
          <section className="profile-panel"><div className="profile-heading"><div><small>Where we deliver</small><h2>Address information</h2></div><em>02</em></div><div className="profile-list"><div><b>⌂</b><span>Delivery address<strong>{profile.address || emptyValue}</strong></span></div><div className="profile-columns"><span>City<strong>{profile.city || emptyValue}</strong></span><span>State<strong>{profile.state || emptyValue}</strong></span><span>Postal code<strong>{profile.pincode || emptyValue}</strong></span></div></div></section>
          <section className="profile-panel wide-panel"><div className="profile-heading"><div><small>A little history</small><h2>Account information</h2></div><em>03</em></div><div className="profile-list"><div><b>✦</b><span>Member since<strong>{formatDate(profile.createdAt)}</strong></span></div></div><p className="profile-muted">Your details are protected and used only to make your FreshDash experience smoother.</p></section>
        </div>}
        <Link className="profile-continue" to="/">← Continue shopping</Link>
      </section>
    </main>
  );
}

export default Profile;
