// server/routes/posts.js
const express = require("express");
const Post = require("../models/Post");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Get all published posts with pagination + optional category filter
// Get all published posts with pagination + optional category filter
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const filter = { status: "published" };
    if (category) {
      filter.categories = { $in: [category] }; // <-- fixed
    }

    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate("author", "name")
      .populate("categories", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get trending posts (sorted by views)
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const posts = await Post.find({ status: "published" })
      .populate("author", "name")
      .populate("categories", "name slug")
      .sort({ "meta.views": -1 })
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("author", "name avatar")
      .populate("categories", "name slug")
      .populate({
        path: "comments",
        match: { approved: true },
        populate: { path: "user", select: "name avatar" },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.meta.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new post (admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user._id,
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a post (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    Object.assign(post, req.body);
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.remove();
    res.json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
