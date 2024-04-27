// Import the necessary libraries
const express = require('express');
const checkUser = require('../middleware/authMiddleware');
const bookController = require('../controllers/bookControllers');
const multer = require('multer');
const jwt = require('jsonwebtoken');
