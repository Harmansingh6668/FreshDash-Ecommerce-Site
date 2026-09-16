import "../styles/Fruits.css";
import { useProducts, filterProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { useSearchParams } from "react-router-dom";

function Leafygreen() {
  const { addToCart } = useCart();
  const { products: leafyProducts } = useProducts("leafy_greens");
  const [searchParams] = useSearchParams();
  const filteredProducts = filterProducts(leafyProducts, searchParams.get("search") || "");

  return (
    <main className="fruits-page">
      <section className="fruits-header">
        <h1>Fresh Leafy Greens</h1>
        <p>Fresh and healthy leafy greens delivered to your doorstep.</p>
      </section>

      <section className="fruits-products">

          {filteredProducts.map((product) => (
            <div className="fruit-card" key={product.id}>
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

export default Leafygreen; 