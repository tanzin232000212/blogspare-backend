// server/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Comment', commentSchema);