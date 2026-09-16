import { useEffect, useState } from "react";
import Input from "../../Components/common/Input";
import Textarea from "../../Components/common/Textarea";
import Button from "../../Components/common/Button";
import { getSettings, updateSettings } from "../../services/api";

function Settings() {
  const [formData, setFormData] = useState({
    storeName: "My Store",
    email: "admin@example.com",
    phone: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSettings().then((result) => {
      if (result.settings) setFormData(result.settings);
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    if (formData.description && !/[A-Za-z]/.test(formData.description)) {
      setError("Description must contain at least one letter.");
      return;
    }

    updateSettings(formData)
      .then(() => setMessage("Settings saved."))
      .catch((requestError) => setError(requestError.message));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your store information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="form-section">
          <div className="form-section-header">
            <h3>Store Information</h3>
            <p>Basic information about your store.</p>
          </div>

          <div className="form-grid">
            <Input
              label="Store Name"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Store name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="store@example.com"
            />

            <Input
              label="Phone"
              name="phone"
              type="tel"
              maxLength={10}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <Textarea
            label="Store Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your store..."
          />

          <div className="form-actions">
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;