
import "../styles/Fruits.css";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../services/api";
import { useCart } from "../context/CartContext";

function Organic() {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const searchTerm = searchParams.get("search") || "";
  const { products: organicProducts } = useProducts("organic", searchTerm);

  return (
    <main className="fruits-page">
      <section className="fruits-header">
        <h1>Fresh Organic Products</h1>
        <p>Fresh and naturally grown products delivered to your doorstep.</p>
      </section>

      <section className="fruits-products">
          {!organicProducts.length && <p>No organic products matched your search.</p>}

          {organicProducts.map((product) => (
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

export default Organic;

