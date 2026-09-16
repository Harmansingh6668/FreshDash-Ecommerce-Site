require("dotenv").config();
const mongoose = require("mongoose");
const catalog = require("../../fresh_fruits/src/services/api.json");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const categoryNames = [...new Set(catalog.products.map((product) => product.category))];
  const categories = {};

  for (const categoryName of categoryNames) {
    const category = await Category.findOneAndUpdate(
      { name: categoryName },
      { name: categoryName, isActive: true },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    categories[categoryName] = category._id;
  }

  for (const item of catalog.products) {
    await Product.findOneAndUpdate(
      { name: item.name },
      {
        name: item.name,
        description: `Fresh ${item.name.toLowerCase()} selected for quality and freshness.`,
        price: item.price,
        originalPrice: item.price,
        discountPrice: item.discounted_price,
        discountPercent: item.discount_percent,
        category: categories[item.category],
        image: item.image_url,
        imageUrl: item.image_url,
        stock: item.in_stock ? 100 : 0,
        unit: item.unit,
        currency: item.currency,
        status: item.in_stock ? "published" : "draft",
        tags: item.tags,
        organic: item.organic,
        isActive: true,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  console.log(`Seeded ${catalog.products.length} products and ${categoryNames.length} categories`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
