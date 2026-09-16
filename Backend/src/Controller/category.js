const Category = require("../models/Category");

const getCategories = async (req, res) => {
  try {
    const filter = req.query.admin === "true" ? {} : { isActive: true };
    const categories = await Category.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "categoryProducts",
        },
      },
      { $addFields: { productCount: { $size: "$categoryProducts" } } },
      { $project: { categoryProducts: 0 } },
      { $sort: { name: 1 } },
    ]);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid category id" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid category id" });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required and must be text",
      });
    }

    const trimmedName = name.trim();
    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: "Category name must contain text only",
      });
    }

    const trimmedDescription =
      typeof description === "string" ? description.trim() : "";

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be text",
      });
    }

    if (trimmedDescription && !/[A-Za-z]/.test(trimmedDescription)) {
      return res.status(400).json({
        success: false,
        message: "Description must contain at least one letter",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: trimmedName });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Create category
    const category = await Category.create({
      name: trimmedName,
      description: trimmedDescription,
      image,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
};