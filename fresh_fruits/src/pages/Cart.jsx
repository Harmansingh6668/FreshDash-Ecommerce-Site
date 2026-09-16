import { useCart } from "../context/CartContext";
import "../styles/Cart.css";
import { Link } from "react-router-dom";

function Cart() {

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  // console.log(cart)

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const delivery = subtotal >= 500 ? 0 : 40;
  const total = subtotal + delivery;

  return (
    <main className="cart-page">
      <div className="cart-container">

        {/* Header */}
        <div className="cart-heading">
          <div>
            <p>Your Shopping Cart</p>
            <h1>My Cart 🛒</h1>
          </div>

          <span>
            {itemCount} Items
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>

            <h2>Your cart is empty</h2>

            <p>
              Add some fresh fruits and vegetables
              to your cart.
            </p>

            <a href="/fruits">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="cart-layout">

            {/* LEFT SIDE */}
            <div className="cart-table-box">

              <div className="cart-table-header">
                <h2>Cart Items</h2>
                <span>
                  {cart.length} Products
                </span>
              </div>

              <div className="cart-table">

                {/* TABLE HEADER */}
                <div className="cart-row cart-row-header">
                  <div>Product</div>
                  <div>Price</div>
                  <div>Quantity</div>
                  <div>Total</div>
                  <div></div>
                </div>

                {/* PRODUCTS */}
                {cart.map((item, index) => (

                  <div
                    className="cart-row"
                    key={`${item.id}-${index}`}
                  >

                    {/* PRODUCT */}
                    <div className="cart-product">

                      <div className="cart-product-image">
                        <img src={item.image_url} alt={item.name} />
                      </div>

                      <div>
                        <h3>{item.name}</h3>

                        <p>
                          {item.category}
                        </p>

                        <small>
                          {item.unit}
                        </small>
                      </div>

                    </div>

                    {/* PRICE */}
                    <div className="cart-price">
                      ₹{Number(item.price).toFixed(2)}
                    </div>

                    {/* QUANTITY */}
                    <div className="cart-quantity">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    {/* TOTAL */}
                    <div className="cart-item-total">
                      ₹
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </div>

                    {/* REMOVE */}
                    <button
                      className="remove-cart-item"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      ×
                    </button>

                  </div>

                ))}

              </div>

              <div className="continue-shopping">
                <a href="/fruits">
                  ← Continue Shopping
                </a>
              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="cart-summary">

              <h2>Order Summary</h2>

              <div className="summary-line">
                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>
              </div>

              <div className="summary-line">
                <span>
                  Delivery
                </span>

                <strong>
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery.toFixed(2)}`}
                </strong>
              </div>

              {subtotal < 500 && (
                <p className="delivery-message">
                  Add ₹
                  {(500 - subtotal).toFixed(2)}
                  {" "}more for FREE delivery 🚚
                </p>
              )}

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>
              </div>

              <Link className="checkout-button" to="/checkout">
                Proceed to Checkout →
              </Link>

              <div className="secure-payment">
                🔒 Secure & Safe Checkout
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

export default Cart;