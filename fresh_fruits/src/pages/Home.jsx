
import "../styles/Home.css";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../services/api";
import { useCart } from "../context/CartContext";

function Home() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search")?.trim().toLowerCase() || "";
  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm),
  );
  const featuredProducts = (searchTerm ? visibleProducts : products).slice(0, 20);

  return (
    <main className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Fresh Fruits & Vegetables</h1>

          <p>
            Fresh, healthy and quality fruits and vegetables
            delivered straight to your doorstep.
          </p>

          <Link className="hero-button" to="/fruits">Shop Now</Link>
        </div>

        <div className="hero-image">
         <img src="/homeimg1.jpg" alt="" />
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Shop By Category</h2>

        <div className="category-list">
          <Link to="/fruits" className="category-card fruitimg1"><span className="text1">Fruits</span></Link>
          <Link to="/vegetables" className="category-card vegetableimg1"><span>Vegetables</span></Link>
          <Link to="/Leafygreen" className="category-card leafygreen"><span>Leafy Greens</span></Link>
          <Link to="/Organic" className="category-card organicimg"><span>Organic</span></Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <h2>{searchTerm ? `Search results for "${searchTerm}"` : "Fresh Picks For You"}</h2>

        <div className="product-list">
        {featuredProducts.map((product) => (
          <div className="product-card" key={product.id}>
          <Link to={`/products/${product.id}`}> <div className="product-image"><img src={product.image_url} alt={product.name} /></div></Link>
            <h3>{product.name}</h3>
            <p>₹{product.price.toFixed(2)} / {product.unit}</p>
            <button onClick={(event) => addToCart(product, 1, event.currentTarget)}>Add to Cart</button>
          </div>
))}
        {!featuredProducts.length && (
          <p className="empty-products">No products matched your search.</p>
        )}
          
        </div>
      </section>

    </main>
  );
}

export default Home;