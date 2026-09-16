import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, logoutUser, updateUserProfile } from "../services/api";
import "../styles/Profile.css";

const editableFields = [
  { key: "name", label: "Full name", placeholder: "Your full name", required: true },
  { key: "phone", label: "Phone number", placeholder: "10-digit phone number", inputMode: "numeric" },
  { key: "address", label: "Address", placeholder: "Street and house number", wide: true },
  { key: "city", label: "City", placeholder: "Your city" },
  { key: "state", label: "State", placeholder: "Your state" },
  { key: "pincode", label: "Postal code", placeholder: "6-digit postal code", inputMode: "numeric" },
];

const emptyValue = (value) => value || "Not added yet";

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    let active = true;
    getUserProfile()
      .then((result) => {
        if (!active) return;
        setProfile(result.profile);
        setFormData(result.profile);
      })
      .catch(() => {
        if (active) setError("Unable to load your profile. Please try again.");
      });
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* the server may already have expired the session */ }
    localStorage.removeItem("userAccount");
    window.dispatchEvent(new Event("freshdash:logout"));
    navigate("/login", { replace: true });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!formData.name?.trim() || !/^[A-Za-z ]{2,}$/.test(formData.name.trim())) {
      setError("Please enter a valid full name.");
      return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      setError("Postal code must contain exactly 6 digits.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateUserProfile(formData);
      setProfile(result.profile);
      setFormData(result.profile);
      setIsEditing(false);
      setNotice("Profile updated successfully");
    } catch {
      setError("Unable to update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error && !profile) return <main className="profile-page"><section className="profile-state profile-error"><div className="profile-state-icon">!</div><h1>We could not find your profile</h1><p>Unable to load your profile. Please try again.</p><button type="button" onClick={() => window.location.reload()}>Try again</button><Link to="/login">Sign in again</Link></section></main>;
  if (!profile) return <main className="profile-page"><section className="profile-loading"><div className="profile-skeleton skeleton-avatar" /><div className="profile-skeleton skeleton-title" /><div className="profile-skeleton skeleton-line" /><div className="profile-skeleton skeleton-panel" /><span>Loading your profile...</span></section></main>;

  const initials = profile.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="profile-hero">
          <div className="profile-hero-glow" />
          <div className="profile-avatar">{initials}</div>
          <div className="profile-hero-copy"><span className="profile-eyebrow">Your FreshDash account</span><h1>{profile.name}</h1><a href={`mailto:${profile.email}`}>{profile.email}</a><span className="profile-status"><i /> Active account</span></div>
          <div className="profile-hero-actions"><button className="profile-primary-button" type="button" onClick={() => { setError(""); setNotice(""); setIsEditing(true); }}>Edit profile</button><button className="profile-logout-button" type="button" onClick={handleLogout}>Log out</button></div>
        </div>

        {notice && <div className="profile-notice" role="status">✓ {notice}</div>}
        {error && <div className="profile-inline-error" role="alert">{error}</div>}

        <div className="profile-content">
          <section className="profile-info-card"><div className="profile-section-heading"><span className="profile-icon">♧</span><div><h2>Personal information</h2><p>Your contact details</p></div></div><div className="profile-info-grid"><div><span>Full name</span><strong>{profile.name}</strong></div><div><span>Email address</span><strong>{profile.email}</strong></div><div><span>Phone number</span><strong>{emptyValue(profile.phone)}</strong></div><div><span>Date of birth</span><strong>Not available</strong></div></div></section>
          <section className="profile-info-card"><div className="profile-section-heading"><span className="profile-icon">⌂</span><div><h2>Delivery address</h2><p>Where we bring your order</p></div></div><div className="profile-address"><strong>{emptyValue(profile.address)}</strong><span>{[profile.city, profile.state, profile.pincode].filter(Boolean).join(", ") || "Add your delivery details"}</span><span>Country not added</span></div></section>
          <section className="profile-info-card profile-account-card"><div className="profile-section-heading"><span className="profile-icon">✦</span><div><h2>Account details</h2><p>A little more about your account</p></div></div><div className="profile-account-row"><span>Member since</span><strong>{formatDate(profile.createdAt)}</strong></div><div className="profile-account-row"><span>Account type</span><strong>FreshDash customer</strong></div></section>
        </div>
        <Link className="profile-continue" to="/fruits">← Continue shopping</Link>
      </section>

      {isEditing && <div className="profile-modal-backdrop" role="presentation"><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><div className="profile-modal-heading"><div><span className="profile-eyebrow">Keep it current</span><h2 id="edit-profile-title">Edit your profile</h2><p>Update your details for a smoother delivery experience.</p></div><button className="profile-close-button" type="button" aria-label="Close edit profile" onClick={() => { setFormData(profile); setError(""); setIsEditing(false); }}>×</button></div><form className="profile-edit-form" onSubmit={handleSave}>{editableFields.map((field) => <label className={field.wide ? "profile-field-wide" : ""} key={field.key}><span>{field.label}{field.required && " *"}</span><input name={field.key} required={field.required} inputMode={field.inputMode} placeholder={field.placeholder} value={formData[field.key] || ""} onChange={(event) => setFormData({ ...formData, [field.key]: event.target.value })} /></label>)}<label className="profile-field-wide"><span>Email address</span><input value={profile.email} disabled /></label>{error && <p className="profile-modal-error" role="alert">{error}</p>}<div className="profile-modal-actions"><button className="profile-cancel-button" type="button" onClick={() => { setFormData(profile); setError(""); setIsEditing(false); }}>Cancel</button><button className="profile-primary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button></div></form></section></div>}
    </main>
  );
}

export default Profile;
