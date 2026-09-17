import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../Components/common/Input";
import Select from "../../Components/common/Select";
import Textarea from "../../Components/common/Textarea";
import Button from "../../Components/common/Button";
import { createProduct, getCategories, updateProduct, uploadProductImage } from "../../services/api";

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const imageElement = new Image();
    const objectUrl = URL.createObjectURL(file);

    imageElement.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(imageElement.width, imageElement.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(imageElement.width * scale);
      canvas.height = Math.round(imageElement.height * scale);
      canvas.getContext("2d").drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Could not process product image"));
            return;
          }
          resolve(new File([blob], "product-image.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.8,
      );
    };

    imageElement.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read product image"));
    };
    imageElement.src = objectUrl;
  });

function ProductForm({ initialData = null, isEdit = false }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category?._id || initialData?.category || "",
    price: initialData?.price || "",
    discountPrice: initialData?.discountPrice || "",
    stock: initialData?.stock ?? "",
    status: initialData?.status || "published",
  });

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || initialData?.image || "");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCategories().then((result) =>
      setCategories(
        result.categories.map((category) => ({
          value: category._id,
          label: category.name,
        })),
      ),
    );
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);
      setImageUrl("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = formData.name.trim();
    const description = formData.description.trim();
    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!/^[A-Za-z ]+$/.test(name)) {
      setError("Product name must contain text only.");
      return;
    }
    if (description && !/[A-Za-z]/.test(description)) {
      setError("Description must contain at least one letter.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid number.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number.");
      return;
    }

    setIsSaving(true);

    try {
      const savedImageUrl = image
        ? await uploadProductImage(await compressImage(image))
        : imageUrl;
      const productData = { ...formData, name, description, price, stock, imageUrl: savedImageUrl };
      if (isEdit) await updateProduct(initialData._id || initialData.id, productData);
      else await createProduct(productData);
      navigate("/admin/products");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <div className="form-section">
        <div className="form-section-header">
          <h3>Basic Information</h3>
          <p>Enter the basic details of the product.</p>
        </div>

        <div className="form-grid">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />

        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
        />
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>Product Details</h3>
          <p>Additional information about this product.</p>
        </div>

        <div className="form-grid">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories}
            required
          />

        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>Pricing</h3>
          <p>Set the product pricing.</p>
        </div>

        <div className="form-grid">
          <Input
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            required
          />

          <Input
            label="Discount Price"
            name="discountPrice"
            type="number"
            value={formData.discountPrice}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>Inventory</h3>
          <p>Manage product stock.</p>
        </div>

        <div className="form-grid">
          <Input
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>Product Image</h3>
          <p>Upload the main product image.</p>
        </div>

        <div className="image-upload">
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <label htmlFor="product-image">
            <div className="upload-icon">↑</div>
            <strong>Click to upload image</strong>
            <span>PNG, JPG or WEBP</span>
          </label>

          {image && (
            <div className="selected-file">
              Selected: {image.name}
            </div>
          )}
          {imageUrl && !image && <img className="product-image-preview" src={imageUrl} alt="Product preview" />}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>Status</h3>
          <p>Choose whether this product is published.</p>
        </div>

        <div className="status-options">
          <label>
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === "draft"}
              onChange={handleChange}
            />
            <span>
              <strong>Draft</strong>
              <small>Product will not be visible to customers.</small>
            </span>
          </label>

          <label>
            <input
              type="radio"
              name="status"
              value="published"
              checked={formData.status === "published"}
              onChange={handleChange}
            />
            <span>
              <strong>Published</strong>
              <small>Product will be visible to customers.</small>
            </span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <Button
          variant="secondary"
          type="button"
          onClick={() => navigate("/admin/products")}
        >
          Cancel
        </Button>

        <Button type="submit">
          {isSaving ? "Uploading image..." : isEdit ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;