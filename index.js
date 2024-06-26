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
const playerRoutes = require('./routes/playerRoutes');
const dealRoutes = require('./routes/dealRoutes');

// Importing middleware
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const { getUserById, getPlayerById } = require('./middleware/nameMiddleware');


// Importing models
const User = require('./models/user');
const Team = require('./models/team');
const Player = require('./models/player');
const Deal = require('./models/deal');

// Initializing express app
const app = express();
const port = 5000;

// Setting up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('frontend'));

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
app.use(playerRoutes);
app.use(dealRoutes);

// Database Connection
const mongoURI = 'mongodb+srv://sepm:sepm123@cluster0.uuar0ah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.log(error.message));

// Middleware for image upload
const userImgStorage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'frontend/images/');
  },
  filename: function(req, file, cb) {
      const token = req.cookies.jwt;
      const decodedToken = jwt.verify(token, 'your-secret-key');
      const userId = decodedToken.id;
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      const newFilename = `${formattedDate}-${userId}-${file.originalname}`;
      cb(null, newFilename);
  }
});

const userImgUpload = multer({ storage: userImgStorage });


// Route for all types of users
app.get('/', checkUser, async (req,res) => {
  try {
    // Fetch all authors, categories, and publishers from the database
    const team = await Team.find();
  
    // Fetch all books and populate their author, category, and publisher fields
    let player = await Player.find().populate('team');
  
    // Render the index page with the fetched data
    res.render('index', { player, team});
  
  } catch (err) {
    // Log any error that occurs and redirect to the home page
    console.error(err);
    res.redirect('/');
  }
});

// Information page
app.get('/information', (req, res) => {
  res.render('information');
});

app.get('/copyright', (req, res) => {
  res.render('copyright');
});

app.get('/privacyPolicy', (req, res) => {
  res.render('privacyPolicy');
});

app.get('/playerDetail', (req, res) => {
  res.render('playerDetail');
});

// My Account page
app.get('/myAccount', requireAuth, checkUser, async (req, res) => {
  try {
    // Get the user from res.locals
    let user = res.locals.user;
  
    // If the user is not defined, set it to null and proceed to the next middleware
    if (!user) {
      res.locals.user = null;
      next();
      return;
    }

    console.log('here:', user);
  
    // // If the user details are not found, return a 404 error
    // if (!userDetails) {
    //   console.error('User not found:', userDetails._id);
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    // Render the 'myAccount' page with the fetched data
    res.render('myAccount', { user: user });

  } catch (error) {
    // Log any error that occurs and return a 500 error
    console.error('Error processing transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/updateUser', requireAuth, (req, res) => {
  res.render('updateUser');
});

app.post('/updateUserImage', requireAuth, checkUser, userImgUpload.single('profileImage'), async (req, res) => {
  
  try {
    // Get the user from res.locals
    const user = res.locals.user;

    // If the user already has a profile image that is not the default image
    if (user.profileImage && user.profileImage !== 'https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg') {
      // Delete the existing profile image
      fs.unlink(path.join(__dirname, 'public', user.profileImage), err => {
        // Log any error that occurs while deleting the image
        if (err) console.error(err);
      });
    }

    // Extract the filename from the uploaded file
    let profileImage = "/images/" + (req.file ? req.file.filename : '');

    // If the user has sent '/images/userImage/', replace it with the default image URL
    if (profileImage === '/images') {
      profileImage = 'https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg';
    }

    // Update the user's profile image in the database
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id }, // find a user with the provided user ID
      { profileImage }, // update the user with the new image
      { new: true } // return the updated user
    );

    // If the user is not found, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send a response indicating that the update was successful
    res.json({ message: 'Image update successful' });
  } catch (error) {
    // Log any error that occurs and return a 500 error
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the user image' });
  }
});

// Route for updating the user's details
app.post('/updateUserDetails', requireAuth, checkUser, async (req, res) => {
  // Extract the full name, email, phone and password from the request body
  const { fullName, email, password } = req.body;
  console.log(req.body);

  try {
    // Get the user ID from res.locals
    const userId = res.locals.user._id;

    // Salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's details in the database
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId }, // find a user with the provided user ID
      { fullName, email, password: hashedPassword }, // update the user with the new details
      { new: true } // return the updated user
    );

    // If the user is not found, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send a response indicating that the update was successful
    res.json({ message: 'Details update successful' });
  } catch (error) {
    // Log any error that occurs and return a 500 error
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the user details' });
  }
});

// Team table display function
app.get('/', (req, res) => {
  Team.find({}, function(err, team) {
    res.render('index', {
      teamTable: team
    })
  })
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});