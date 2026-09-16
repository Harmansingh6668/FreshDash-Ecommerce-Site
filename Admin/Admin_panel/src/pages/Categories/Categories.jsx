import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/common/Button";
import Badge from "../../Components/common/Badge";
import { deleteCategory, getCategories } from "../../services/api";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories(true).then((result) => setCategories(result.categories));
  }, []);

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    deleteCategory(id).then(() => {
      setCategories((current) =>
        current.filter(
          (category) => String(category._id || category.id) !== String(id),
        ),
      );
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Manage your product categories.</p>
        </div>

        <Button onClick={() => navigate("/admin/categories/create")}>
          + Add Category
        </Button>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category._id || category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>

                  <td>{category.productCount || 0}</td>

                  <td>
                    <Badge type={category.isActive ? "success" : "warning"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button className="icon-button edit">Edit</button>

                      <button
                        className="icon-button delete"
                        onClick={() => handleDelete(category._id || category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Categories;