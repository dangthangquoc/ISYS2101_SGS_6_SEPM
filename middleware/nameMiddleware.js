const User = require('../models/user'); // Adjust the path as needed
const Player = require('../models/player'); // Adjust the path as needed

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

const getPlayerById = async (playerId) => {
  try {
    const player = await Player.findById(playerId);
    return player;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

module.exports = { getUserById, getPlayerById };