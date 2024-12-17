const express = require('express');
const router = express.Router();
const Menu = require('../models/menu');
const UserStats = require('../models/userStat');
const authenticate = require('../middleware/authMiddleware');
const User = require('../models/user');

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalMenuCount = await Menu.countDocuments({ createdBy: userId });

    const recentMenus = await Menu.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name');

    const userDetails = await User.findById(userId).select({
      name: 1,
      email: 1,
      phoneNumber: 1,
      location: 1,
      image: 1,
      workingHours: 1
    });

    await UserStats.findOneAndUpdate(
      { user: userId },
      {
        totalMenuItems: totalMenuCount,
        recentMenuItems: recentMenus.map(menu => menu._id),
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      user: {
        name: userDetails.name,
        email: userDetails.email,
      },
      data: {
        totalMenuItems: totalMenuCount,
        recentMenus: recentMenus.map(menu => ({
          id: menu._id,
          name: menu.name,
          price: menu.price,
          category: menu.category.name,
          image: menu.image,
          available: menu.available
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      message: 'Error retrieving user statistics', 
      error: error.message 
    });
  }
});

module.exports = router;