const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        require: [true, 'Please enter your full name']
    },
    teamImage: {
        type: String,
        default: "frontend\images\profile-1.png",
        require: true
    },
    squadSize: {
        type: int,
        require: [true, 'Please enter team squad size'],
    },
    marketValue: {
        type: String,
        require: [true, 'Please enter team market value'],
    },
    avgAge: {
        type: float,
        require: [true, 'Please enter team average'],
    },
    userHistory: {
        pass,
    },
    player : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    },
},
    {
        timestamps: true
});



// Define a model based on the schema
const Team = mongoose.model('team', teamSchema);

// the module exports the "Product" model so that it can be used by other parts of the application.
module.exports = Team;