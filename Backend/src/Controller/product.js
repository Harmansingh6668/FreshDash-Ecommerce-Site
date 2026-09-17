const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const mongoose = require("mongoose");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveCategoryId = async (value) => {
  const categoryValue = String(value || "").trim();
  if (mongoose.isValidObjectId(categoryValue)) {
    const category = await Category.findOne({ _id: categoryValue, isActive: true }).select("_id").lean();
    return category?._id || null;
  }
  const category = await Category.findOne({ name: categoryValue.toLowerCase(), isActive: true }).select("_id").lean();
  return category?._id || null;
};

const productPayload = (body) => ({
  name: body.name,
  description: body.description || "",
  price: Number(body.price),
  originalPrice: body.originalPrice === "" ? undefined : Number(body.originalPrice ?? body.price),
  discountPrice: body.discountPrice === "" ? undefined : Number(body.discountPrice),
  discountPercent: body.discountPercent || (
    body.discountPrice !== undefined && body.discountPrice !== ""
      ? Math.round((1 - Number(body.discountPrice) / Number(body.price)) * 100)
      : 0
  ),
  category: body.category,
  image: body.image || body.imageUrl || "",
  imageUrl: body.imageUrl || body.image || "",
  images: body.images || (body.imageUrl || body.image ? [body.imageUrl || body.image] : []),
  stock: body.stock ?? 0,
  unit: body.unit || "piece",
  currency: body.currency || "INR",
  status: body.status || "published",
  tags: body.tags || [],
  organic: Boolean(body.organic),
  isActive: body.status !== "draft" && body.isActive !== false,
  featured: Boolean(body.featured),
});

const validateProduct = (body) => {
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const price = Number(body.price);
  const stock = Number(body.stock);

  if (!/^[A-Za-z ]+$/.test(name)) return "Product name must contain text only";
  if (description && !/[A-Za-z]/.test(description)) return "Description must contain at least one letter";
  if (!Number.isFinite(price) || price < 0) return "Price must be a valid positive number";
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be a whole number";
  if (body.discountPrice !== undefined && body.discountPrice !== "") {
    const discountPrice = Number(body.discountPrice);
    if (!Number.isFinite(discountPrice) || discountPrice < 0 || discountPrice > price) return "Discount price must be valid and not greater than price";
  }
  return "";
};

const listProducts = async (req, res) => {
  try {
    const filter = req.query.admin === "true"
      ? {}
      : { isActive: true };
    if (req.query.category) {
      const requestedCategory = String(req.query.category).trim().toLowerCase();
      const categoryNames = {
        fruit: ["fruit", "fruits"],
        fruits: ["fruit", "fruits"],
        vegetable: ["vegetable", "vegetables"],
        vegetables: ["vegetable", "vegetables"],
        leafy_green: ["leafy_green", "leafy_greens"],
        leafy_greens: ["leafy_green", "leafy_greens"],
      }[requestedCategory] || [requestedCategory];
      const category = await Category.findOne({
        name: { $in: categoryNames.map((name) => new RegExp(`^${name}$`, "i")) },
        isActive: true,
      }).select("_id").lean();
      if (!category) return res.json({ success: true, products: [] });
      filter.category = category._id;
    }
    if (req.query.organic === "true") filter.organic = true;
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.offers === "true") filter.discountPrice = { $exists: true, $gt: 0 };
    if (req.query.search) {
      const searchWords = String(req.query.search)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(escapeRegex);

      filter.$and = searchWords.map((word) => ({
        $or: [
          { name: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
        ],
      }));
    }

    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 24, 1), 100);
    const skip = Math.max(Number.parseInt(req.query.skip, 10) || 0, 0);

    const query = Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (req.query.admin === "true") {
      query.select("name price discountPrice discountPercent category stock unit currency status isActive featured createdAt");
    } else {
      query.select("name description price originalPrice discountPrice discountPercent category image imageUrl images stock unit currency status organic featured");
    }

    const products = await query.lean();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

const listBestSellers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = { isActive: true };
    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean).map(escapeRegex);
      filter.$and = searchWords.map((word) => ({
        $or: [
          { name: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
        ],
      }));
    }

    const [products, soldItems] = await Promise.all([
      Product.find(filter).populate("category", "name").lean(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.product", soldQuantity: { $sum: "$items.quantity" } } },
      ]),
    ]);

    const soldQuantityByProduct = new Map(
      soldItems.map((item) => [String(item._id), item.soldQuantity]),
    );
    products.forEach((product) => {
      product.soldQuantity = soldQuantityByProduct.get(String(product._id)) || 0;
    });
    products.sort((first, second) =>
      second.soldQuantity - first.soldQuantity ||
      new Date(second.createdAt) - new Date(first.createdAt),
    );

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch best sellers" });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product id" });
  }
};

const createProduct = async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const payload = productPayload(req.body);
    payload.category = await resolveCategoryId(payload.category);
    if (!payload.category) return res.status(400).json({ success: false, message: "Valid category is required" });
    const product = await Product.create(payload);
    res.status(201).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        status: product.status,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const payload = productPayload(req.body);
    payload.category = await resolveCategoryId(payload.category);
    if (!payload.category) return res.status(400).json({ success: false, message: "Valid category is required" });
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { returnDocument: "after", runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product id" });
  }
};

module.exports = { listProducts, listBestSellers, getProduct, createProduct, updateProduct, deleteProduct };
