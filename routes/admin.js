const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')
      .lean();

    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('post', 'title')
      .lean();

    const recentActivity = [
      ...recentPosts.map(p => ({ message: `New post created: ${p.title}`, timestamp: p.createdAt })),
      ...recentComments.map(c => ({ message: `New comment by ${c.user?.name} on ${c.post?.title}`, timestamp: c.createdAt }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ totalPosts, totalUsers, totalComments, recentActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
