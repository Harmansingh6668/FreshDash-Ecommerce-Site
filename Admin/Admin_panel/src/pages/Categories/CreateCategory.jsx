import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../Components/common/Input";
import Textarea from "../../Components/common/Textarea";
import Button from "../../Components/common/Button";
import { createCategory } from "../../services/api";

function CreateCategory() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      setError("Category name must contain text only.");
      return;
    }

    if (trimmedDescription && !/[A-Za-z]/.test(trimmedDescription)) {
      setError("Description must contain at least one letter.");
      return;
    }

    setIsSaving(true);

    try {
      await createCategory({
        name: trimmedName,
        description: trimmedDescription,
      });
      navigate("/admin/categories");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Add Category</h2>
          <p>Create a new product category.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="category-alert" role="alert" aria-live="polite">
            <span className="category-alert-icon" aria-hidden="true">
              !
            </span>
            <span className="category-alert-message">{error}</span>
            <button
              className="category-alert-close"
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              &times;
            </button>
          </div>
        )}
        <div className="form-section">
          <div className="form-grid">
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              required
            />

          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description"
          />
        </div>

        <div className="form-actions">
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/admin/categories")}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCategory;