const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(cors());
app.use(cookieParser());
// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const adminRoutes = require('./routes/adminRoute');


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);


module.exports = app;