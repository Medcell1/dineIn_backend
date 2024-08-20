// routes/admin.js

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

router.get("/admin-dashboard", authenticate, authorize(["admin"]), (req, res) => {
    console.log(`WELCOME!`)
  // Your admin dashboard logic here
});

module.exports = router;
