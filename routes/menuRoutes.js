const express = require("express");
const Menu = require("../models/menu");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const multer = require("multer");
const imageUploadHelper = require("../constants/imageUploadHelper");
const authorize = require("../middleware/authorize");

const upload = multer({ storage: multer.memoryStorage() });

// Get all menu items
router.get("/", authenticate, async (req, res) => {
  const filter = {};
  const search = req.query.search;

  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  try {
    const menuItems = await Menu.find(filter).populate("category");
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get menu item by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const menuItemId = req.params.id;

    const menuItem = await Menu.findById(menuItemId).populate(
      "category",
      "name"
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get menu items created by a particular user
router.get("/user/:userId", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const filter = { createdBy: userId };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const menuItems = await Menu.find(filter)
      .sort({ 
        createdAt: 1,  
        _id: 1         
      })
      .limit(limit)
      .skip(skipIndex)
      .populate("category", "name");

    const totalItems = await Menu.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: menuItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Create a new menu item
router.post("/", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const { name, price, measure, category } = req.body;

    if (!name || !price || !measure || !category) {
      return res
        .status(400)
        .json({
          message: "All fields (name, price, measure, category) are required",
        });
    }

    const imageUrl = await imageUploadHelper(req.file);
    req.body.image = imageUrl;

    const createdBy = req.user._id;

    const newMenuItem = new Menu({
      name,
      price,
      image: req.body.image,
      measure,
      createdBy,
      category,
    });
    await newMenuItem.save();

    res.status(201).json({
      message: "Menu item created successfully",
      data: newMenuItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update menu item by ID
router.put("/:id", upload.single("file"), authenticate, async (req, res) => {
  try {
    const menuItemId = req.params.id;
    if (req.file) {
      const imageUrl = await imageUploadHelper(req.file);
      req.body.image = imageUrl;
    }
    const { name, price, measure, category } = req.body;

    // Update menu item
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      menuItemId,
      { name, price, image: req.body.image, measure, category },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({
      message: "Menu item updated successfully",
      data: updatedMenuItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete menu item by ID
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const menuItemId = req.params.id;

    // Ensure the menu item exists
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item doesn't exist" });
    }

    // Delete the menu item
    await Menu.findByIdAndDelete(menuItemId);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update availability of a menu item by ID
router.patch("/:id/availability", authenticate, async (req, res) => {
  try {
    const menuItemId = req.params.id;
    const { available } = req.body;

    // Ensure the menu item exists
    const menuItem = await Menu.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Update the availability of the menu item
    menuItem.available = available;
    await menuItem.save();

    res.json({
      message: "Menu item availability updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
