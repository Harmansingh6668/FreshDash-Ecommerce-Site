const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { listProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../Controller/product");

const router = express.Router();
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", protect, allowRoles("admin", "superadmin"), createProduct);
router.put("/:id", protect, allowRoles("admin", "superadmin"), updateProduct);
router.delete("/:id", protect, allowRoles("admin", "superadmin"), deleteProduct);

module.exports = router;
