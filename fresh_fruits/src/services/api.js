import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

const normalizeCategory = (value) => {
  const category = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return {
    vegetable: "vegetables",
    vegetables: "vegetables",
    fruit: "fruits",
    fruits: "fruits",
    leafy_green: "leafy_greens",
    leafy_greens: "leafy_greens",
  }[category] || category;
};

const normalizeProduct = (product) => {
  const price = Number(product.price || 0);
  const discountedPrice = Number(product.discountPrice ?? price);
  const category = product.category?.name || product.category || "";
  const discountPercent = Number(
    product.discountPercent || (
      discountedPrice < price && price > 0
        ? Math.round((1 - discountedPrice / price) * 100)
        : 0
    ),
  );

  return {
    ...product,
    id: product._id || product.id,
    category: normalizeCategory(category),
    image_url: product.imageUrl || product.image || product.image_url || product.images?.[0] || "",
    discount_percent: discountPercent,
    discounted_price: discountedPrice,
    price,
    in_stock: Number(product.stock || 0) > 0,
  };
};

export function useProducts(filter = "all") {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/products`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to load products");
        return result.products.map(normalizeProduct);
      })
      .then((items) => {
        if (active) {
          setProducts(
            items.filter((item) =>
              filter === "organic"
                ? item.organic
                : filter === "offers"
                  ? item.discount_percent > 0
                  : filter === "all"
                    ? true
                    : item.category === filter,
            ),
          );
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter]);

  return { products, loading, error };
}

export async function getProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Product not found");
  return normalizeProduct(result.product);
}

export async function createOrder(order) {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || "Failed to create order");
    error.status = response.status;
    throw error;
  }
  return result.order || result;
}

export async function authenticate(path, data) {
  const response = await fetch(`${API_URL}/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Authentication failed");
  return result;
}

export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, admin: false }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not create reset token");
  return result;
}

export async function resetPassword(token, password) {
  const response = await fetch(`${API_URL}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password, admin: false }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not reset password");
  return result;
}

export async function getUserProfile() {
  const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || "Could not load profile");
    error.status = response.status;
    throw error;
  }
  return result;
}

export async function updateUserProfile(profile) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not update profile");
  return result;
}

export async function logoutUser() {
  const response = await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not log out");
  return result;
}

export async function getCart() {
  const response = await fetch(`${API_URL}/cart`, { credentials: "include" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not load cart");
  return (result.items || []).map((item) => ({
    ...item,
    id: item.id || item.product,
    image_url: item.image_url || item.image || "",
  }));
}

export async function saveCart(items) {
  const response = await fetch(`${API_URL}/cart`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({ ...item, product: item.product || item.id })),
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not save cart");
  return result.items || [];
}

export async function clearSavedCart() {
  const response = await fetch(`${API_URL}/cart`, { method: "DELETE", credentials: "include" });
  if (!response.ok) throw new Error("Could not clear saved cart");
}
