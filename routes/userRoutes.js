const authenticate = require('../middleware/authMiddleware');
const User = require('../models/user');
const express = require('express');
const router = express.Router();



// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User Not Found`);

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//delete user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;


    //Ensure the user exists    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }
    //delete the user!
    await User.findByIdAndDelete(userId);
    res.status({ message: "User Created Successfully" });
    console.log(`User deleted Successfully`)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//edit user data

module.exports = router;