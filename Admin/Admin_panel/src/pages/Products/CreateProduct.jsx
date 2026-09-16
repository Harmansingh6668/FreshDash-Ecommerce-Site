import ProductForm from "./ProductForm";

function CreateProduct() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Add Product</h2>
          <p>Create a new product for your store.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}

export default CreateProduct;