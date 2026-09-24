const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }
    callback(null, true);
  },
});

const uploadProductImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Product image is required" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "fresh-fruits/products",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) return reject(error);
          resolve(uploadedImage);
        },
      );
      stream.end(req.file.buffer);
    });

    res.status(201).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadProductImage };
