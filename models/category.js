const mongoose = require('mongoose');

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;