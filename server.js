const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = require("./app");

const server = express();

server.use(express.urlencoded({ limit: "10mb", extended: true }));
server.use(express.json({ limit: "10mb" })); 

// Allow requests from http://localhost:3000 (your frontend origin)
server.use(
  cors({
    origin: "http://localhost:3000", 
  })

);

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const menuRoutes = require("./routes/menuRoutes");
const adminRoutes = require("./routes/adminRoute");
const workingHoursRoutes = require("./routes/workinghoursRoute")
const cookieParser = require("cookie-parser");

server.use(cookieParser());

server.use("/auth", authRoutes);
server.use("/users", userRoutes);
server.use("/menu", menuRoutes);
server.use("/admin", adminRoutes);
server.use("/working-hours", workingHoursRoutes);
server.get("/", async (req, res) => {
  return res.status(200).json({ message: "Hello" });
});

mongoose
  .connect(
    "mongodb+srv://adeolasoremi5:med@med.hjx0nvu.mongodb.net/node-API?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected To MongoDB");
    server.listen(3001, () => { 
      console.log("Node API is running on Port 3001");
    });
  })
  .catch((e) => {
    console.log(`Mongo Error ===> ${e}`);
  });

module.exports = server;
