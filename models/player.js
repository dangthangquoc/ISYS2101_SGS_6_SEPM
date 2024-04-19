const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    playerName: {
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
    team : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team'
    },
},
    {
        timestamps: true
});


playerSchema.post('save', function (doc, next) {
    console.log('New Player was created & saved', doc);
    next();
});
playerSchema.post('updateOne', async function (doc, next) {
    console.log('Player has been updated', doc);
    next();
  });


// Define a model based on the schema
const Player = mongoose.model('player', playerSchema);

// the module exports the "Product" model so that it can be used by other parts of the application.
module.exports = Player;