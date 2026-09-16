const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { upload, uploadProductImage } = require("../Controller/upload");

const router = express.Router();
router.post("/product-image", protect, allowRoles("admin", "superadmin"), upload.single("image"), uploadProductImage);

module.exports = router;
