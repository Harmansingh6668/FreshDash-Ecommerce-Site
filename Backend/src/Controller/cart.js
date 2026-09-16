const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.auth.id }).lean();
  res.json({ success: true, items: cart?.items || [] });
};

const saveCart = async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const validItems = items
    .filter((item) => item.product && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0)
    .map((item) => ({
      product: item.product,
      name: String(item.name || "Product"),
      price: Number(item.price || 0),
      quantity: Number(item.quantity),
      image: String(item.image || item.image_url || ""),
      category: String(item.category || ""),
      unit: String(item.unit || "piece"),
    }));

  const cart = await Cart.findOneAndUpdate(
    { user: req.auth.id },
    { user: req.auth.id, items: validItems },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  res.json({ success: true, items: cart.items });
};

const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.auth.id }, { items: [] }, { upsert: true });
  res.json({ success: true, items: [] });
};

module.exports = { getCart, saveCart, clearCart };
