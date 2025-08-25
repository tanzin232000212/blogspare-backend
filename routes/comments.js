// server/routes/comments.js
const express = require('express');
const Comment = require('../models/Comment');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId, 
      approved: true,
      parent: null 
    })
      .populate('user', 'name avatar')
      .populate({
        path: 'replies',
        match: { approved: true },
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new comment
router.post('/', protect, async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      user: req.user._id,
    });

    const savedComment = await comment.save();
    await savedComment.populate('user', 'name avatar');
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a comment (admin only for approval, or user for their own comment)
router.put('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is admin or the comment author
    if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(comment, req.body);
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a comment
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is admin or the comment author
    if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await comment.remove();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;