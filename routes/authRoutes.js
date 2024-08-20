const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const imageUploadHelper = require("../constants/imageUploadHelper");

const router = express.Router();
require("dotenv").config();
const multer = require("multer");
const upload = multer({storage: multer.memoryStorage()});
// Signup
router.post("/signup", upload.single("file"), async (req, res) => {
  try {
    // Check if an image file is included in the request
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const imageUrl = await imageUploadHelper(req.file);
    req.body.image = imageUrl;
    const { email, password, name, phoneNumber, image } = req.body;

    if (!email || !password || !name || !phoneNumber || !image) {
      return res.status(400).json({ message: "Fields are required" });
    }

    // Set default working hours for each day of the week
    const defaultWorkingHours = [
      { day: "Monday" },
      { day: "Tuesday" },
      { day: "Wednesday" },
      { day: "Thursday" },
      { day: "Friday" },
      { day: "Saturday" },
      { day: "Sunday" }
    ];

    // Check if there's an existing User
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: "Email already exists" });
    }

    // Hash the password before saving to the Database
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      image,
      workingHours: defaultWorkingHours, // Set default working hours
    });
    await user.save();

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: user, token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



//logIn
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //Find the user with the email in the datebase

    const user = await User.findOne({ email });

    //check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    //compare the password provided with the hashed one in the Database

    const PasswordMatch = await bcrypt.compare(
      String(password),
      String(user.password)
    );
    if (!PasswordMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    // Generate an access token for the authenticated User
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: user,
    });
    console.log(`user=====>${user}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
