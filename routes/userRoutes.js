const authenticate = require("../middleware/authMiddleware");
const Menu = require("../models/menu");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const imageUploadHelper = require("../constants/imageUploadHelper");
const moment = require('moment');
// Get all users
router.get("/", async (req, res) => {
  try {
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    // Get current day
    const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });

    const users = await User.find(filter)
      .select('-password')
      .sort({
        createdAt: -1,
        _id: 1
      })
      .limit(limit)
      .skip(skipIndex);

    const transformedUsers = users.map(user => {
      const userObject = user.toObject();

      const todayWorkingHours = Array.isArray(userObject.workingHours) 
        ? userObject.workingHours.find(
            hours => hours.day.toLowerCase() === currentDay.toLowerCase()
          )
        : null;

      delete userObject.workingHours;

      return {
        ...userObject,
        todayWorkingHours: todayWorkingHours 
          ? {
              openTime: todayWorkingHours.openTime,
              closeTime: todayWorkingHours.closeTime
            }
          : null
      };
    });

    const totalItems = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: transformedUsers,
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

router.put("/:id", upload.single("file"), authenticate, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.file) {
      const imageUrl = await imageUploadHelper(req.file);
      req.body.image = imageUrl;
    }

    const { name, email, phoneNumber, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phoneNumber,
        location,
        image: req.body.image,
      },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Get user by NAME (case-insensitive)

router.get("/name/:name", async (req, res) => {
  try {
    const userName = req.params.name;
    const searchQuery = req.query.search; 
    // Find user by name
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${userName}$`, "i") },
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentDay = moment().format("dddd");

    const currentDayWorkingHours = user.workingHours.find(
      (hours) => hours.day.toLowerCase() === currentDay.toLowerCase()
    );

    if (!currentDayWorkingHours) {
      return res
        .status(404)
        .json({ message: "No working hours found for today" });
    }

    const menuFilter = {
      createdBy: user._id,
      available: true,
    };

    if (searchQuery) {
      menuFilter.name = { $regex: new RegExp(searchQuery, "i") };
    }

    const menus = await Menu.find(menuFilter).populate("category", "id name");

    res.json({
      user,
      todayWorkingHour: {
        day: currentDay,
        openTime: currentDayWorkingHours.openTime,
        closeTime: currentDayWorkingHours.closeTime,
      },
      menus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Get user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .select("-workingHours");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//delete user
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User Deleted Successfully" });
    console.log(`User deleted Successfully`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
