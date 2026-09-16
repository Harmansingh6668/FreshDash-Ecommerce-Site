const Product = require("../models/Product");
const Category = require("../models/Category");

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
    if (req.query.category) filter.category = req.query.category;
    if (req.query.organic === "true") filter.organic = true;
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

    const query = Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

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
    if (!String(payload.category).match(/^[0-9a-fA-F]{24}$/)) {
      const category = await Category.findOne({ name: payload.category });
      if (!category) return res.status(400).json({ success: false, message: "Valid category is required" });
      payload.category = category._id;
    }
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
    const product = await Product.findByIdAndUpdate(req.params.id, productPayload(req.body), { returnDocument: "after", runValidators: true });
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

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
