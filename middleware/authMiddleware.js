// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on decoded token
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Access token has expired' });
    } else {
      res.status(401).json({ message: 'Invalid access token' });
    }
  }
};

module.exports = authenticate;
