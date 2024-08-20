const authenticate = require('../middleware/authMiddleware'); 
const User = require("../models/user");
const express = require('express');
const router = express.Router();

// Fetch working hours for a specific user
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log working hours after finding the user
    console.log({ workingHours: user.workingHours });

    // Send the working hours of the user
    res.status(200).json({ workingHours: user.workingHours });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update working hours for a specific user
router.put("/:userId", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { workingHours } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's working hours
    user.workingHours = workingHours;
    await user.save();

    res.status(200).json({ message: "Working hours updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
