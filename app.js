const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const adminRoutes = require('./routes/adminRoute');


app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/menu', menuRoutes);
app.use('/admin', adminRoutes);


module.exports = app;