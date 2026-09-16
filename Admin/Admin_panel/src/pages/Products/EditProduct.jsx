import { useParams } from "react-router-dom";
import ProductForm from "./ProductForm";

function EditProduct() {
  const { id } = useParams();

  const product = {
    id,
    name: "Premium T-Shirt",
    description: "Premium quality cotton t-shirt.",
    category: "Clothing",
    price: 999,
    discountPrice: 899,
    stock: 35,
    status: "published",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Edit Product</h2>
          <p>Update the product information.</p>
        </div>
      </div>

      <ProductForm initialData={product} isEdit />
    </div>
  );
}

export default EditProduct;