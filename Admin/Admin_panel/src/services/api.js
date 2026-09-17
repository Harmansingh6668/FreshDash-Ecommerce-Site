const API_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Request failed");
  return result;
}

export const getCategories = (admin = false) => request(`/categories${admin ? "?admin=true" : ""}`);
export const createCategory = (category) => request("/categories", { method: "POST", body: JSON.stringify(category) });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: "DELETE" });
export const getProducts = async (admin = false) => {
  const result = await request(`/products${admin ? "?admin=true" : ""}`);
  return {
    ...result,
    products: result.products.map((product) => ({
      ...product,
      stock: Number(product.stock ?? 0),
    })),
  };
};
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (product) => request("/products", { method: "POST", body: JSON.stringify(product) });
export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("http://localhost:5000/api/uploads/product-image", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Image upload failed");
  return result.imageUrl;
}
export const updateProduct = (id, product) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(product) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: "DELETE" });
export const getOrders = () => request("/orders");
export const getSettings = () => request("/settings");
export const updateSettings = (settings) => request("/settings", { method: "PUT", body: JSON.stringify(settings) });
export const login = (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify({ ...credentials, admin: true }) });
export const registerAdmin = (account) => request("/auth/register-admin", { method: "POST", body: JSON.stringify(account) });
export const getAdminProfile = () => request("/auth/me");
export const updateAdminProfile = (profile) => request("/auth/me", { method: "PUT", body: JSON.stringify(profile) });
export const logoutAdmin = () => request("/auth/logout", { method: "POST" });
export const forgotAdminPassword = (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email, admin: true }) });
export const resetAdminPassword = (token, password) => request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password, admin: true }) });
