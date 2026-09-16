
import "../styles/Offers.css";
import { useProducts } from "../services/api";
import { useCart } from "../context/CartContext";

function Offers() {
  const { products: offers, loading, error } = useProducts("offers");
  const { addToCart } = useCart();
  /*
  const offers = [
    {
      name: "Fresh Apples",
      category: "Fruits",
      price: "₹120",
      oldPrice: "₹150",
      discount: "20% OFF",
      emoji: "🍎",
    },
    {
      name: "Fresh Bananas",
      category: "Fruits",
      price: "₹40",
      oldPrice: "₹50",
      discount: "20% OFF",
      emoji: "🍌",
    },
    {
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: "₹35",
      oldPrice: "₹45",
      discount: "22% OFF",
      emoji: "🍅",
    },
    {
      name: "Fresh Carrots",
      category: "Vegetables",
      price: "₹45",
      oldPrice: "₹60",
      discount: "25% OFF",
      emoji: "🥕",
    },
    {
      name: "Fresh Spinach",
      category: "Leafy Greens",
      price: "₹25",
      oldPrice: "₹35",
      discount: "28% OFF",
      emoji: "🥬",
    },
    {
      name: "Organic Broccoli",
      category: "Organic",
      price: "₹80",
      oldPrice: "₹100",
      discount: "20% OFF",
      emoji: "🥦",
    },
  ]; */

  return (
    <main className="offers-page">

      {/* Hero Section */}
      <section className="offers-hero">
        <div>
          <p>FRESH DEALS FOR YOU</p>

          <h1>Special Offers</h1>

          <span>
            Save more on fresh fruits, vegetables and organic products.
          </span>

          <button>Shop Now</button>
        </div>

        <div className="offers-hero-icon">
          🛒
        </div>
      </section>


      {/* Offers Section */}
      <section className="offers-section">

        <div className="offers-heading">
          <p>DON'T MISS OUT</p>

          <h2>Today's Best Deals</h2>

          <span>
            Fresh products at special prices for a limited time.
          </span>
        </div>


        {/* Product Grid */}
        <div className="offers-grid">

          {loading && <p className="offers-message">Loading current offers...</p>}
          {error && <p className="offers-message">{error}</p>}
          {!loading && !error && !offers.length && (
            <p className="offers-message">No active offers right now. Check back soon.</p>
          )}
          {offers.map((product) => (
            <div className="offer-card" key={product.id}>

              <div className="discount-badge">
                {product.discount_percent}% OFF
              </div>

              <div className="offer-image">
                <img src={product.image_url} alt={product.name} />
              </div>

              <div className="offer-info">

                  <small>{product.category}</small>

                <h3>{product.name}</h3>

                <div className="offer-price">
                    <strong>₹{product.discounted_price}</strong>

                  <del>₹{product.price}</del>
                </div>

                <button onClick={(event) => addToCart({ ...product, price: product.discounted_price }, 1, event.currentTarget)}>Add to Cart</button>

              </div>

            </div>
          ))}

        </div>

      </section>


      {/* Bottom Offer Banner */}
      <section className="offer-banner">

        <div>
          <p>LIMITED TIME OFFER</p>

          <h2>Freshness Delivered at Better Prices</h2>

          <span>
            Enjoy great discounts on your favorite fresh products.
          </span>
        </div>

        <button>Explore Offers</button>

      </section>

    </main>
  );
}

export default Offers;

