const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const settingRoutes = require("./routes/settingRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const cartRoutes = require("./routes/cartRoutes");
const path = require("path");

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL, process.env.CORS_ORIGINS]
  .flatMap((value) => String(value || "").split(","))
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^https:\/\/[^/]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Store API is running",
  });
});

// Category routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/cart", cartRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.statusCode || error.status || 500;
  console.error("API request failed:", error.message);
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : error.message,
  });
});

module.exports = app;