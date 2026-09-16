const Setting = require("../models/Setting");

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne().sort({ createdAt: 1 });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { storeName, email, phone, description } = req.body;
    if (!String(storeName || "").trim()) {
      return res.status(400).json({ success: false, message: "Store name is required" });
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
    }
    if (description && !/[A-Za-z]/.test(description)) {
      return res.status(400).json({ success: false, message: "Description must contain at least one letter" });
    }
    const settings = await Setting.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
