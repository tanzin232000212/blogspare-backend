// server/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// ✅ Get posts by category
router.get("/category/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Find category by slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find posts with that category _id
    const posts = await Post.find({ categories: category._id })
      .populate("author", "name email")
      .populate("categories", "name slug");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
