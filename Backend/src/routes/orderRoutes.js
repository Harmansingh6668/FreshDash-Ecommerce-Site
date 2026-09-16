const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { createOrder, listOrders, updateOrderStatus } = require("../Controller/order");

const router = express.Router();
router.get("/", protect, allowRoles("admin", "superadmin"), listOrders);
router.post("/", protect, allowRoles("user"), createOrder);
router.patch("/:id/status", protect, allowRoles("admin", "superadmin"), updateOrderStatus);

module.exports = router;
