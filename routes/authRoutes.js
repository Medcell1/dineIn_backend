const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const imageUploadHelper = require("../constants/imageUploadHelper");
const multer = require("multer");
const validateFields = require("../utils/validation");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
require("dotenv").config();


// Signup route
router.post("/signup", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const imageUrl = await imageUploadHelper(req.file);
    req.body.image = imageUrl;

    const { name, password, phoneNumber, email, location } = req.body;

    const missingFieldMessage = validateFields({ name, password, phoneNumber, image: imageUrl, email });
    if (missingFieldMessage) {
      return res.status(400).json({ message: missingFieldMessage });
    }

    const existingNameUser = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingNameUser) {
      return res.status(409).json({ message: "Username already exists. Please choose a different name." });
    }

    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const defaultWorkingHours = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => ({ day }));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      location,
      password: hashedPassword,
      phoneNumber,
      image: imageUrl,
      workingHours: defaultWorkingHours,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const missingFieldMessage = validateFields({ email, password });
    if (missingFieldMessage) {
      return res.status(400).json({ message: missingFieldMessage });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
