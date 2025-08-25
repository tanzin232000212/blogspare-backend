// server/routes/search.js
const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Search posts
router.get('/', async (req, res) => {
  try {
    const { q, category, tag, author, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { status: 'published' };
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Category filter
    if (category) {
      query.categories = category;
    }
    
    // Tag filter
    if (tag) {
      query.tags = tag;
    }
    
    // Author filter
    if (author) {
      query.author = author;
    }
    
    const posts = await Post.find(query)
      .populate('author', 'name')
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;