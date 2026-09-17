import { useSearchParams } from "react-router-dom";
import "../styles/BestSellers.css";
import { useBestSellers } from "../services/api";
import { useCart } from "../context/CartContext";

function BestSellers() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const { products, loading, error } = useBestSellers(searchTerm);
  const { addToCart } = useCart();

  return (
    <main className="best-sellers-page">
      <section className="best-sellers-hero">
        <div className="best-sellers-hero-copy">
          <p className="best-sellers-eyebrow">Loved by FreshDash shoppers</p>
          <h1>Best sellers, picked by the basket.</h1>
          <p>
            The produce customers come back for most, ranked by real orders and ready for your next delivery.
          </p>
        </div>
        <div className="best-sellers-hero-mark" aria-hidden="true">
          <span>01</span>
          <strong>TOP<br />PICKS</strong>
        </div>
      </section>

      <section className="best-sellers-section">
        <div className="best-sellers-heading">
          <div>
            <p className="best-sellers-eyebrow">Trending now</p>
            <h2>{searchTerm ? `Best sellers for "${searchTerm}"` : "What everyone is buying"}</h2>
          </div>
          {!loading && !error && <span>{products.length} products</span>}
        </div>

        {loading && <p className="best-sellers-message">Loading the customer favorites...</p>}
        {error && <p className="best-sellers-message" role="alert">{error}</p>}
        {!loading && !error && !products.length && (
          <p className="best-sellers-message">No best sellers matched your search.</p>
        )}

        <div className="best-sellers-grid">
          {!loading && !error && products.map((product, index) => (
            <article className="best-seller-card" key={product.id}>
              <div className="best-seller-rank">#{String(index + 1).padStart(2, "0")}</div>
              <div className="best-seller-image">
                <img src={product.image_url} alt={product.name} loading="lazy" />
              </div>
              <div className="best-seller-info">
                <span className="best-seller-category">{product.category || "Fresh produce"}</span>
                <h3>{product.name}</h3>
                <p className="best-seller-sold">
                  <span aria-hidden="true">↗</span>
                  {product.soldQuantity ? `${product.soldQuantity} sold` : "New favorite"}
                </p>
                <div className="best-seller-buy-row">
                  <strong>₹{product.price.toFixed(2)}</strong>
                  <span>/ {product.unit}</span>
                  <button onClick={(event) => addToCart(product, 1, event.currentTarget)} aria-label={`Add ${product.name} to cart`}>
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default BestSellers;
