import "../styles/Fruits.css";
import { useProducts } from "../services/api";
import { useCart } from "../context/CartContext";

function Fruits() {
  const { addToCart } = useCart();
  const { products: fruitProducts } = useProducts("fruits");

  return (
    <main className="fruits-page">

      {/* Page Header */}
      <section className="fruits-header">
        <h1>Fresh Fruits</h1>
        <p>Fresh and delicious fruits delivered to your doorstep.</p>
      </section>

      {/* Products */}
      <section className="fruits-products">
        {fruitProducts.map((product) => (
          <div className="fruit-card" key={product.id}>
            <div className="fruit-image">
              <img src={product.image_url} alt={product.name} loading="lazy" />
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

export default Fruits;