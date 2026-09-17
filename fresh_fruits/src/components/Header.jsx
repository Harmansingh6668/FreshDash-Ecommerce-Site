import "../styles/Header.css";
import { useState,useEffect,useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Header() {

    const [showCategories, setShowCategories] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
    const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem("userAccount") || "null"));
    const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
    const cartTotal = cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0,
    );
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);


    const categoriesRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target)
      ) {
        setShowCategories(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchTerm(new URLSearchParams(location.search).get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const syncAccount = () => setAccount(JSON.parse(localStorage.getItem("userAccount") || "null"));
    window.addEventListener("freshdash:account-updated", syncAccount);
    window.addEventListener("freshdash:login", syncAccount);
    window.addEventListener("freshdash:logout", syncAccount);
    window.addEventListener("storage", syncAccount);
    return () => {
      window.removeEventListener("freshdash:account-updated", syncAccount);
      window.removeEventListener("freshdash:login", syncAccount);
      window.removeEventListener("freshdash:logout", syncAccount);
      window.removeEventListener("storage", syncAccount);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    const query = searchTerm.trim();
    if (query) params.set("search", query);
    else params.delete("search");
    navigate(`${location.pathname}${params.toString() ? `?${params}` : ""}`);
  };

  const handleSearchChange = (event) => {
    const nextSearchTerm = event.target.value;
    setSearchTerm(nextSearchTerm);
    const params = new URLSearchParams(location.search);
    if (nextSearchTerm.trim()) params.set("search", nextSearchTerm);
    else params.delete("search");
    navigate(`${location.pathname}${params.toString() ? `?${params}` : ""}`, { replace: true });
  };

  return (
    <header className="header">

      {/* Top Header */}
      <div className="header-top">

        {/* Logo */}
        <div className="logo">
          <span>🍃</span>

          <div>
            <h2>FreshDash</h2>
            <p>Good food, delivered simply</p>
          </div>
        </div>

        {/* Location */}
        <div className="location">
          <span>📍</span>

          <div>
            <small>Deliver to</small>
            <strong>{account?.city ? `${account.city}${account.state ? `, ${account.state}` : ""}` : "Set your location"}</strong>
          </div>
        </div>

      

        {/* Account */}
        <Link to={account ? "/profile" : "/login"} className="account">
          <span>👤</span>

          <div>
            <small>{account ? "Welcome back" : "Your account"}</small>
            <strong>{account ? account.name : "Sign in or join"}</strong>
          </div>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="cart">
          <span>🛒</span>

          <div>
            <small>{cartItemCount} {cartItemCount === 1 ? "item" : "items"}</small>
            <strong>₹{cartTotal.toFixed(2)}</strong>
          </div>
        </Link>

      </div>


      {/* Navbar */}
       <nav className="navbar">

        <Link to="/">Home</Link>

        <Link to="/fruits">Fruits</Link>

        <Link to="/vegetables">Vegetables</Link>

        {/* Categories Dropdown */}
        <div className="categories-dropdown"  ref={categoriesRef}>

          <button
            className="categories-button"
            onClick={() => setShowCategories(!showCategories)}
          >
            Categories ▾
          </button>

          {showCategories && (
            <div className="categories-menu">

              <Link to="/fruits">Fruits</Link>

              <Link to="/vegetables">Vegetables</Link>

              <Link to="/Leafygreen">Leafy Greens</Link>

              <Link to="/Organic">Organic</Link>

              <Link to="/offers">Offers</Link>

            </div>
          )}

        </div>

        <Link to="/offers">Offers</Link>

        <Link to="/best-sellers">Best Sellers</Link>

        <form className="search-box" onSubmit={handleSearch} role="search">
          <input
            type="text"
            placeholder="Search fruits, vegetables..."
            aria-label="Search products"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit" aria-label="Search">🔍</button>
        </form>
      </nav>

    </header>
  );
}

export default Header;