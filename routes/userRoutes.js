const authenticate = require("../middleware/authMiddleware");
const Menu = require("../models/menu");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const imageUploadHelper = require("../constants/imageUploadHelper");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
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

    const user = await User.findOne({
      name: { $regex: new RegExp(`^${userName}$`, "i") },
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const menus = await Menu.find({ userId: user._id });

    res.json({
      user,
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
