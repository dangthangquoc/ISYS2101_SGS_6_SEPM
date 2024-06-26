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

userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) next();
    /* Salting and Hashing the Password */
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.post('save', function (doc, next) {
    console.log('New User was created & saved', doc);
    next();
});

// User method
userSchema.statics.login = async function(email, password) {
    // Find user and validate
    const user = await this.findOne({ email });

    if (user) {
        const validPass = await bcrypt.compare(password, user.password);
        if (validPass) {
            return user;
        } 
        throw Error ('Incorrect password');
    }
    throw Error('Incorrect email');
    
};

// Define a model based on the schema
const User = mongoose.model('user', userSchema);

// the module exports the "Product" model so that it can be used by other parts of the application.
module.exports = User;