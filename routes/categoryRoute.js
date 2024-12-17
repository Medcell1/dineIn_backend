const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({
      name,
      description
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;