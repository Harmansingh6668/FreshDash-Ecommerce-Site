const express = require("express");
const { protect, allowRoles } = require("../middleware/auth");
const { getSettings, updateSettings } = require("../Controller/setting");

const router = express.Router();
router.get("/", getSettings);
router.put("/", protect, allowRoles("admin", "superadmin"), updateSettings);

module.exports = router;
