
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/ProductDetails.css";
import { getProduct } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch((requestError) => setLoadError(requestError.message));
  }, [id]);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  if (loadError || !product) {
    return (
      <main className="product-not-found">
        <h2>Product not found</h2>
        <p>{loadError || "The product you are looking for does not exist."}</p>
      </main>
    );
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

 const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* LEFT SIDE */}
        <div className="product-image-section">

          <div className="product-image">
            <img src={product.image_url} alt={product.name} />
          </div>

          <div className="product-image-label">
            Fresh & Quality Checked
          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="product-info">

          <p className="product-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <div className="product-rating">
            <span>★★★★★</span>
            <strong>{product.in_stock ? "In stock" : "Out of stock"}</strong>
            <small>Customer Rating</small>
          </div>


          <div className="product-price">

            <strong>₹{product.discounted_price}</strong>

            <del>₹{product.price}</del>

            <span>
              {product.discount_percent}
              % OFF
            </span>

          </div>

          <p className="product-unit">
            Price for {product.unit}
          </p>


          <p className="product-description">
            Fresh {product.name.toLowerCase()} selected for quality and freshness.
          </p>


          {/* FEATURES */}

          <div className="product-features">

            <div>
              <span>✓</span>
              <p>
                <strong>Fresh Quality</strong>
                <small>Carefully selected</small>
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Farm Fresh</strong>
                <small>Freshly sourced</small>
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Fast Delivery</strong>
                <small>Delivered fresh</small>
              </p>
            </div>

          </div>


          {/* QUANTITY */}

          <div className="quantity-section">

            <p>Quantity</p>

            <div className="quantity-counter">

              <button onClick={decreaseQuantity}>
                −
              </button>

              <span>{quantity}</span>

              <button onClick={increaseQuantity}>
                +
              </button>

            </div>

          </div>


          {/* TOTAL */}

          <div className="product-total">

            <span>Total</span>

            <strong>₹{totalPrice}</strong>

          </div>


          {/* ADD TO CART */}
           <button
  className="add-to-cart-button"
  onClick={(event) => addToCart(product, quantity, event.currentTarget)}
                 >
  🛒 Add to Cart
</button>


          <p className="delivery-info">
            🚚 Fresh delivery available
          </p>

        </div>

      </div>

    </main>
  );
}

export default ProductDetails;

