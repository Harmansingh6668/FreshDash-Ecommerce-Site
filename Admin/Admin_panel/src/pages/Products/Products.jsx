import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/common/Button";
import Badge from "../../Components/common/Badge";
import { deleteProduct, getCategories, getProducts } from "../../services/api";

function Products() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProducts(true)
      .then((result) => setProducts(result.products))
      .finally(() => setIsLoading(false));
    getCategories(true).then((result) => setCategories(result.categories));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (!categoryFilter || product.category?._id === categoryFilter) &&
    (!statusFilter || product.status === statusFilter)
  );

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    deleteProduct(id).then(() => {
      setProducts((current) =>
        current.filter((product) => String(product._id || product.id) !== String(id)),
      );
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage all products in your store.</p>
        </div>

        <Button onClick={() => navigate("/admin/products/create")}>
          + Add Product
        </Button>
      </div>

      <div className="content-card">
        <div className="filters">
          <input
            type="text"
            className="form-input search-input"
            aria-label="Search products"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="form-input filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>

          <select className="form-input filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="6">Loading products...</td>
                </tr>
              )}
              {filteredProducts.map((product) => (
                <tr key={product._id || product.id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-image-placeholder">
                        {product.name.charAt(0)}
                      </div>

                      <strong>{product.name}</strong>
                    </div>
                  </td>

                  <td>{product.category?.name || product.category}</td>

                  <td>₹{product.price}</td>

                  <td>
                    {Number(product.stock) === 0 ? (
                      <span className="stock-out">Out of stock</span>
                    ) : (
                      Number(product.stock)
                    )}
                  </td>

                  <td>
                    <Badge
                      type={
                        product.status === "published"
                          ? "success"
                          : "warning"
                      }
                    >
                      {product.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit"
                        onClick={() =>
                          navigate(`/admin/products/edit/${product._id || product.id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="icon-button delete"
                        onClick={() => handleDelete(product._id || product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && filteredProducts.length === 0 && (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try changing your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;