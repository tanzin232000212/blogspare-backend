// server/routes/analytics.js
const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Get analytics data
router.get('/', protect, admin, async (req, res) => {
  try {
    // Get basic counts
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    // Get posts by status
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    
    // Get posts by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const postsByMonth = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get top authors
    const topAuthors = await Post.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          totalViews: { $sum: '$meta.views' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          _id: 0,
          author: {
            _id: '$author._id',
            name: '$author.name',
            email: '$author.email'
          },
          postCount: 1,
          totalViews: 1
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    res.json({
      total: {
        posts: totalPosts,
        users: totalUsers,
        comments: totalComments,
      },
      posts: {
        published: publishedPosts,
        draft: draftPosts,
        byMonth: postsByMonth,
      },
      topAuthors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;