// server/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);