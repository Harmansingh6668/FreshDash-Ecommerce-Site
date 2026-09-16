import "../styles/Fruits.css";
import { useProducts } from "../services/api";
import { useCart } from "../context/CartContext";

function Vegetables() {
  const { addToCart } = useCart();
  const { products: vegetableProducts } = useProducts("vegetables");
  return (
    <main className="fruits-page">
      <section className="fruits-header">
        <h1>Fresh Vegetables</h1>
        <p>Fresh and healthy vegetables delivered to your doorstep.</p>
      </section>

      <section className="fruits-products">
        {vegetableProducts.map((product) => (
          <div key={product.id} className="fruit-card">
            <div className="fruit-image">
              <img src={product.image_url} alt={product.name} />
            </div>

            <h3>{product.name}</h3>
            <p>₹{product.price.toFixed(2)} / {product.unit}</p>
            <button onClick={(event) => addToCart(product, 1, event.currentTarget)}>Add to Cart</button>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Vegetables;