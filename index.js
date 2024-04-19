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
const Team = require('./models/team');
const Player = require('./models/player');
const Deal = require('./models/deal')

// Initializing express app
const app = express();
const port = 4000;

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


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
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
  
    // Fetch all authors and publishers from the database
    const player = await Player.find();
    const team = await Team.find();
    const category = await Category.find();

  
    // Fetch the user's details and populate their deals
    const userDetails = await User.findById(user._id)
      .populate('deals')
      .exec();
  
    // If the user details are not found, return a 404 error
    if (!userDetails) {
      console.error('User not found:', userDetails._id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  
    // Fetch all transactions
    const transactions = await Transaction.find();
  
    // Update the status and fine of overdue transactions
    await Promise.all(transactions.map(async (transaction) => {
      if ((transaction.returnDate < Date.now() && transaction.status == 'Reserved') || (transaction.returnDate < Date.now() && transaction.status == 'Overdue')) {
        await Transaction.findByIdAndUpdate(
          transaction._id,
          {
            $set: {
              status: 'Overdue',
              fine: 1000 * Math.floor((Date.now() - new Date(transaction.returnDate)) / (1000 * 60 * 60 * 24))
            }
          },
          { new: true },
        );
      }
    }));
  
    // Fetch the book details for each of the user's active transactions
    const allActiveTransactions = await Promise.all(
      userDetails.activeTransactions.map(async (transaction) => {
        const book = await getBookById(transaction.bookId);
        return {
          bookTitle: book.title,
          status: transaction.status,
          pickUpDate: transaction.pickUpDate,
          returnDate: transaction.returnDate,
          fine: transaction.fine,
        };
      })
    );
  
    // Fetch the book details for each of the user's previous transactions
    const allPrevTransactions = await Promise.all(
      userDetails.prevTransactions.map(async (transaction) => {
        const book = await getBookById(transaction.bookId);
        return {
          bookTitle: book.title,
          status: transaction.status,
          pickUpDate: transaction.pickUpDate,
          returnDate: transaction.returnDate,
          fine: transaction.fine,
        };
      })
    );
  
    // Fetch the user and book details for each transaction
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const user = await User.findById(transaction.userId).exec();
        const book = await Book.findById(transaction.bookId).exec();
  
        const userEmail = user ? user.email : 'User not found';
        const bookTitle = book ? book.title : 'Book not found';
  
        return {
          _id: transaction._id,
          userEmail: userEmail,
          bookTitle: bookTitle,
          status: transaction.status,
          pickUpDate: transaction.pickUpDate,
          returnDate: transaction.returnDate,
          fine: transaction.fine,
        };
      })
    );
  
    // Render the 'myAccount' page with the fetched data
    res.render('myAccount', { user: user, books: books, allActiveTransactions, allPrevTransactions, transactions: transactionsWithDetails, authors: authors, publishers: publishers });
  
  } catch (error) {
    // Log any error that occurs and return a 500 error
    console.error('Error processing transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});