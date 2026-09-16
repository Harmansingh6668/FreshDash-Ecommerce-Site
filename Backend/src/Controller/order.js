const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new Error("Order items are required");

  const productIds = items.map((item) => item.product || item.id);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const orderItems = items.map((item) => {
    const product = productMap.get(String(item.product || item.id));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) {
      throw new Error("One or more products are unavailable");
    }
    return { product: product._id, name: product.name, price: product.discountPrice ?? product.price, quantity, image: product.imageUrl || product.image };
  });

  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  return { orderItems, totalAmount: subtotal + (subtotal >= 500 ? 0 : 40) };
};

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
    throw new Error("Complete delivery address is required");
  }
  if (!/^\d{10}$/.test(shippingAddress.phone)) throw new Error("Phone number must contain exactly 10 digits");
  if (!/^\d{6}$/.test(shippingAddress.pincode)) throw new Error("Pincode must contain exactly 6 digits");
};

const buildOrderData = (req, body, orderItems, totalAmount) => ({
  user: req.auth.id,
  guestEmail: body.guestEmail,
  items: orderItems,
  totalAmount,
  shippingAddress: body.shippingAddress,
  paymentMethod: body.paymentMethod,
});

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, guestEmail } = req.body;
    validateShippingAddress(shippingAddress);
    if (paymentMethod !== "cod") return res.status(400).json({ success: false, message: "Online payments must be verified before creating an order" });
    const { orderItems, totalAmount } = await getOrderItems(items);
    const order = await Order.create({
      ...buildOrderData(req, { guestEmail, shippingAddress, paymentMethod }, orderItems, totalAmount),
      orderStatus: "confirmed",
    });
    await Cart.findOneAndUpdate({ user: req.auth.id }, { items: [] }, { upsert: true });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const listOrders = async (req, res) => {
  try {
    const filter = req.query.user ? { user: req.query.user } : {};
    const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { returnDocument: "after", runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, listOrders, updateOrderStatus };
