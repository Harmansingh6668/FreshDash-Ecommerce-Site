const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { getCart, saveCart, clearCart } = require("../Controller/cart");

const router = express.Router();
router.use(protect, allowRoles("user"));
router.get("/", getCart);
router.put("/", saveCart);
router.delete("/", clearCart);

module.exports = router;
