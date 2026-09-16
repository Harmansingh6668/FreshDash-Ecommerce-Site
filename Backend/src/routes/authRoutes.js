const express = require("express");
const { login, register, registerAdmin, profile, updateProfile, logout, forgotPassword, resetPassword } = require("../Controller/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.post("/login", login);
router.post("/register", register);
router.post("/register-admin", registerAdmin);
router.get("/me", protect, profile);
router.put("/me", protect, updateProfile);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
