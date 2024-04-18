const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const playerSchema = new mongoose.Schema({
    playeyrName: {
        type: String,
        require: [true, 'Please enter your full name']
    },
    playerImage: {
        type: String,
        default: "frontend\images\profile-1.png",
        require: true
    },
    position: {
        type: String,
        require: [true, 'Please enter player position'],
    },
    dob: {
        type: String,
        require: [true, 'Please enter player date of birth'],
    },
    transferPrice: {
        type: float,
        require: [true, 'Please enter player transfer price'],
    },
    userHistory: {
        pass,
    },
},
    {
        timestamps: true
});


playerSchema.post('save', function (doc, next) {
    console.log('New Player was created & saved', doc);
    next();
});

// User method
// userSchema.statics.login = async function(email, password) {
//     // Find user and validate
//     const user = await this.findOne({ email });

//     if (user) {
//         const validPass = await bcrypt.compare(password, user.password);
//         if (validPass) {
//             return user;
//         } 
//         throw Error ('Incorrect password');
//     }
//     throw Error('Incorrect email');
    
// };

// Define a model based on the schema
const Player = mongoose.model('PLayer', playerSchema);

// the module exports the "Product" model so that it can be used by other parts of the application.
module.exports = Player;