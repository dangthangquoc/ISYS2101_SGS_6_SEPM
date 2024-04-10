const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: [true, 'Please enter your full name']
    },
    profileImage: {
        type: String,
        default: "profile-1.png",
        require: true
    },
    email: {
        type: String,
        require: [true, 'Please enter your email'],
        max: 50,
        unique: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        require: [true, 'Please enter your password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    userHistory: {
        type: mongoose.Types.ObjectId,
        ref: "UserHistory"
    },
},
    {
        timestamps: true
});