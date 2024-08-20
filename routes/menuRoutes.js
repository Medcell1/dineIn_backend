const express = require('express');
const Menu = require('../models/menu');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware'); 
const multer = require("multer");
const imageUploadHelper = require("../constants/imageUploadHelper");

const upload = multer({storage: multer.memoryStorage()})
// Get all menu items
router.get('/', async (req, res) => {
  const filter = {};
    const search = req.query.search;

    if (search) {
      filter.$or = [
        { editor: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    try {
      const menuItems = await Menu.find(filter);
      res.json(menuItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


// Get menu item by ID
router.get('/:id',  async (req, res) => {
    try {
      const menuItemId = req.params.id;

      const menuItem = await Menu.findById(menuItemId);
  
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
  
      res.json(menuItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Get menu items created by a particular user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const search = req.query.search;

    // Construct the filter object
    const filter = { createdBy: userId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        // Add other fields as needed
      ];
    }

    // Find all menu items where the createdBy field matches the userId and apply filtering
    const menuItems = await Menu.find(filter);

    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Create a new menu item
router.post('/', authenticate, upload.single("file"), async (req, res) => {
    try {
      if(!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }
      const imageUrl = await imageUploadHelper(req.file);
      req.body.image = imageUrl;
      const { name, price, description, image, measure } = req.body;
  
      // Get the createdBy (user ID) from the authenticated user
      const createdBy = req.user._id;
  
      // Create a new menu item with createdBy information
      const newMenuItem = new Menu({ name, price, description, image, measure, createdBy });
      await newMenuItem.save();
  
      res.status(201).json({ message: 'Menu item created successfully', menuItem: newMenuItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
// Update menu item by ID
router.put('/:id', upload.single("file"), authenticate, async (req, res) => {
  try {
    
    const menuItemId = req.params.id;
    if(req.file) {
      const imageUrl = await imageUploadHelper(req.file);
      req.body.image = imageUrl;
    }
    const { name, price, description, image, measure } = req.body;

    // Update menu item
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      menuItemId,
      { name, price, description, image, measure },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully', menuItem: updatedMenuItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete menu item by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const menuItemId = req.params.id;

    // Ensure the menu item exists
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item doesn't exist" });
    }

    // Delete the menu item
    await Menu.findByIdAndDelete(menuItemId);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get menu items created by a particular user
router.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find all menu items where the userId matches
      const menuItems = await Menu.find({ createdBy: userId });
  
      res.json(menuItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
// Update availability of a menu item by ID
router.patch('/:id/availability', authenticate, async (req, res) => {
  try {
    const menuItemId = req.params.id;
    const { available } = req.body;

    // Ensure the menu item exists
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Update the availability of the menu item
    menuItem.available = available;
    await menuItem.save();

    res.json({ message: 'Menu item availability updated successfully', menuItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
