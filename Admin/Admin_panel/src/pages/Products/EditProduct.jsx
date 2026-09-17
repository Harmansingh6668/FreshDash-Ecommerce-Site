import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductForm from "./ProductForm";
import { getProduct } from "../../services/api";

function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then((result) => setProduct(result.product))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Edit Product</h2>
          <p>Update the product information.</p>
        </div>
      </div>

      {error && <p role="alert">{error}</p>}
      {product && <ProductForm initialData={product} isEdit />}
    </div>
  );
}

export default EditProduct;