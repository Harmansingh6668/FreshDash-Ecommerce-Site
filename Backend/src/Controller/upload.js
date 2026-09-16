const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }
    callback(null, true);
  },
});

const uploadProductImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Product image is required" });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.status(201).json({
    success: true,
    imageUrl: `${baseUrl}/uploads/${req.file.filename}`,
  });
};

module.exports = { upload, uploadProductImage };
