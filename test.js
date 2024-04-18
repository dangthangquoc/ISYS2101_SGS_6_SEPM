const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// Replace with your actual MongoDB connection string
const mongoURI = 'mongodb+srv://sepm:sepm123@cluster0.uuar0ah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Define your data schema
const playerSchema = new mongoose.Schema({
    playeyrName: {
        type: String,
        require: [true, 'Please enter your full name']
    },
    playerImage: {
        type: String,
        default: "images/profile-1.png",
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
},
    {
        timestamps: true
});

const Player = mongoose.model('Player', playerSchema);

// Parse incoming data
app.use(bodyParser.urlencoded({ extended: false }));

// Route to render the form
app.get('/', (req, res) => {
  res.render('form');
});

// Route to handle data submission (POST request)
app.post('/insert', async (req, res) => {
  const { name, age } = req.body;
  try {
    const newUser = new User({ name, age });
    await newUser.save();
    res.send('Data inserted successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting data');
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
