// Import the necessary libraries
const express = require('express');
const { checkUser } = require('../middleware/authMiddleware');
const playerController = require('../controllers/playerControllers');
const multer = require('multer');
const jwt = require('jsonwebtoken');

// Initialize the Express router
const router = express.Router();

// Define the storage location and naming convention for book images
const playerImageStorage = multer.diskStorage({
  // Set the destination for storing book images
  destination: function(req, file, cb) {
    cb(null, 'frontend/images/');
  },
  // Define the filename for the uploaded image
  filename: function(req, file, cb) {
    // Extract the JWT token from the cookies
    const token = req.cookies.jwt;
    // Verify the JWT token and extract the user ID
    const decodedToken = jwt.verify(token, 'your-secret-key');
    const userId = decodedToken.id;

    // Construct the new filename using the formatted date and time, user ID, and original file name
    const newFilename = `-${userId}-${file.originalname}`;

    // Set the new filename
    cb(null, newFilename);
  }
});

// Initialize multer with the defined storage
const playerImageUpload = multer({ storage: playerImageStorage });

// Define the routes for book details
router.get('/allPlayer', checkUser, playerController.allPlayerGet);
router.get('/playerDetail/:id', checkUser, playerController.playerDetailGet);

// Define the routes for searching books
router.get('/searchResult', checkUser, playerController.searchGet);

// Define the routes for adding books
router.get('/addPlayer', checkUser, playerController.addPlayerGet);
router.post('/addPlayer', checkUser, playerImageUpload.single('playerImage'), playerController.addPlayerPost);

// Define the routes for updating books
router.get('/updatePlayer/:id', checkUser, playerController.updatePlayerGet);
router.post('/updatePlayer/:id', checkUser, playerImageUpload.single('playerImage'), playerController.updatePlayerPost);
router.post('/updatePlayerDetail/:id', checkUser, playerController.updatePlayerDetailPost);
router.post('/updatePlayerImage/:id', checkUser, playerImageUpload.single('playerImage'), playerController.updatePlayerImagePost);

// Define the routes for deleting books
router.post('/deletePlayer/:id', checkUser, playerController.deletePlayer);

// Define the routes for managing authors, categories, and publishers
router.post('/team', checkUser, playerController.teamPost);
router.post('/deleteTeam/:id', checkUser, playerController.deleteTeam);

// get for category
router.get('/team', checkUser, playerController.teamGet);
// Export the router
module.exports = router;