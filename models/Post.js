// server/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
  },
  featuredImage: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  meta: {
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Generate slug from title before saving
postSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);