import { createContext, useContext, useEffect, useRef, useState } from "react";
import { clearSavedCart, getCart, saveCart } from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const hydrated = useRef(false);
  const authenticated = useRef(false);
  const toastTimer = useRef(null);
  const cartWrite = useRef(Promise.resolve());
  const cartVersion = useRef(0);

  useEffect(() => {
    const loadCart = async (clearGuestCart = false) => {
      const requestVersion = cartVersion.current;

      const localCart = JSON.parse(
        localStorage.getItem("guestCart") || "[]"
      );

      if (clearGuestCart) {
        localStorage.removeItem("guestCart");
      }

      try {
        const items = await getCart();

        // Ignore old request if cart version has changed
        if (requestVersion !== cartVersion.current) return;

        authenticated.current = true;
        setCart(items);
      } catch (error) {
        if (requestVersion !== cartVersion.current) return;

        authenticated.current = false;

        setCart(clearGuestCart ? [] : localCart);
      } finally {
        hydrated.current = true;
      }
    };

    const handleLogin = () => {
      cartVersion.current += 1;
      authenticated.current = false;
      hydrated.current = false;

      setCart([]);

      loadCart(true);
    };

    const handleLogout = () => {
      cartVersion.current += 1;
      authenticated.current = false;

      localStorage.removeItem("guestCart");

      setCart([]);
    };

    loadCart();

    window.addEventListener("freshdash:login", handleLogin);
    window.addEventListener("freshdash:logout", handleLogout);

    return () => {
      window.removeEventListener("freshdash:login", handleLogin);
      window.removeEventListener("freshdash:logout", handleLogout);
    };
  }, []);

  // Save cart
  const persistCart = (updater) => {
    setCart((currentCart) => {
      const items =
        typeof updater === "function"
          ? updater(currentCart)
          : updater;

      // Save guest cart locally
      localStorage.setItem("guestCart", JSON.stringify(items));

      // Save logged-in cart to server
      if (hydrated.current && authenticated.current) {
        cartWrite.current = cartWrite.current
          .catch(() => {})
          .then(() => saveCart(items));
      }

      return items;
    });
  };

  // Add product to cart
  const addToCart = (product, quantity, buttonElement) => {
    persistCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity,
        },
      ];
    });

    const buttonBounds = buttonElement?.getBoundingClientRect();

    setToast({
      message: "Product added to cart!",
      left: buttonBounds
        ? buttonBounds.left + buttonBounds.width / 2
        : window.innerWidth / 2,
      top: buttonBounds
        ? buttonBounds.top - 10
        : window.innerHeight - 90,
    });

    clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    persistCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    persistCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  };

  // Remove product
  const removeFromCart = (id) => {
    persistCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // Clear cart
  const clearCart = async () => {
    cartVersion.current += 1;

    setCart([]);

    localStorage.removeItem("guestCart");

    if (authenticated.current) {
      await cartWrite.current.catch(() => {});
      await clearSavedCart().catch(() => {});
    }
  };

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
    };
  }, []);
  const contextValue = {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}

      {toast && (
        <div
          className="cart-toast"
          style={{
            left: toast.left,
            top: toast.top,
          }}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}