// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Agenda = require('agenda');

// Importing routes
const authRoutes = require('./routes/authRoutes');

// Importing middleware
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

// Importing models
const User = require('./models/user');

// Initializing express app
const app = express();
const port = 4000;

// Setting up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Checking user for all routes
app.get('*', checkUser);

// Setting up session
app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: { 
        maxAge: 60 * 60 * 24 * 24 * 7,
        secure: false 
      },
    })
);

// Setting up routes
app.use(authRoutes);

// Database Connection
const mongoURI = 'mongodb+srv://sepm:sepm123@cluster0.uuar0ah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.log(error.message));




app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
