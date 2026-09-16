const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");

const {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
} = require("../Controller/category");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", protect, allowRoles("admin", "superadmin"), createCategory);
router.delete("/:id", protect, allowRoles("admin", "superadmin"), deleteCategory);

module.exports = router;