const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = require("./app");
const Category = require('./models/category');

const server = express();

server.set('trust proxy', true); 

server.use(express.urlencoded({ limit: "10mb", extended: true }));
server.use(express.json({ limit: "10mb" })); 

server.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000", 
        "https://dine-in-frontend.vercel.app", 
        /\.devtunnels\.ms$/, 
      ];

      if (!origin) return callback(null, true); 
      if (
        allowedOrigins.some((allowed) =>
          typeof allowed === "string" ? allowed === origin : allowed.test(origin)
        )
      ) {
        return callback(null, true); 
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const menuRoutes = require("./routes/menuRoutes");
const adminRoutes = require("./routes/adminRoute");
const workingHoursRoutes = require("./routes/workinghoursRoute");
const categoryRoutes = require("./routes/categoryRoute");
const statRoutes = require("./routes/userStatRoutes");

const cookieParser = require("cookie-parser");

server.use(cookieParser());

server.use("/api/auth", authRoutes);
server.use("/api/users", userRoutes);
server.use("/api/menu", menuRoutes);
server.use("/api/admin", adminRoutes);
server.use("/api/working-hours", workingHoursRoutes);
server.use("/api/category", categoryRoutes);
server.use("/api/stats", statRoutes);

server.get("/", async (req, res) => {
  return res.status(200).json({ message: "Hello" });
});

async function seedCategories() {
  try {
    const categoriesToSeed = [
      { name: 'Pastry', description: null },
      { name: 'Fried Rice/Jollof Rice', description: null },
      { name: 'Ice Cream', description: null },
      { name: 'Drinks', description: null }
    ];

    for (const category of categoriesToSeed) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        await Category.create(category);
        console.log(`Category "${category.name}" inserted`);
      } else {
        console.log(`Category "${category.name}" already exists, skipping insert.`);
      }
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

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

seedCategories();
module.exports = server;
