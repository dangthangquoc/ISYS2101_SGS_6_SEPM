const express = require('express');
const fs = require('fs');
const User = require('../models/user');
const Player = require('../models/player');
const Deal = require('../models/deal');
const Team = require('../models/team');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');

// error handler, use to handle error message from models (author,book, category and publisher)
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { Name: '' };

    // check for type of error
    if (err.message.includes('player validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    if (err.message.includes('team validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const handleErrorsforaddplayer = (err) => {
    console.log(err.message, err.code);
    let errors = { Name: '' };

    if (err.code == 11000) {
        errors.playerName = 'This player name has been registered';
        return errors;
    }

    // check for type of error
    if (err.message.includes('player validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    if (err.message.includes('team validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

module.exports.allPlayerGet = async (req, res) => {
    const player = await Player.find().populate('team');
    const team = await Team.find();
    res.render('allPlayer', {player, team});
}

// Book detail page
module.exports.playerDetailGet = async (req, res) => {
    try {
        const team = await Team.find();
        const player = await Player.findById(req.params.id).populate('team');
        res.render('playerDetail', { player: player, team: team});
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}

module.exports.addPlayerGet = async (req, res) => {
    try {
        const team = await Team.find();
        res.render('addPlayer', { team});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports.addPlayerPost = async (req, res) => {
    try {
        const { playerName, position, dob, transferPrice, team} = req.body;
        let playerData = { playerName, position, dob, transferPrice, team };

        if (req.file) {
            playerData.playerImage = "/images/" + req.file.filename;
        }

        const player = await Player.create(playerData);
        const upda
        tedTeam = await Team.findOneAndUpdate({ _id: team }, { $push: { player: player._id } }, { new: true });
        res.status(200).json({ player, updatedTeam});
    }
    catch (err) {
        let error = handleErrorsforaddplayer(err);
        res.status(400).json({ error });
    }
}

module.exports.updatePlayerGet = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        const team = await Team.find();
        res.render('updatePlayer', { player: player, team: team });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}

module.exports.updatePlayerPost = async (req, res) => {
    const { playerName, position, dob, transferPrice, team } = req.body;
    try {
        const player = await Player.findById(req.params.id);
        if (player.playerImage) {
            fs.unlink(path.join(__dirname, 'frontend', player.playerImage), err => {
                if (err) console.error(err);
            });
        }
        const bookImage = "/images/" + (req.file ? req.file.filename : '');

        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, { playerName, position, dob, transferPrice, team }, { new: true });
        // Update the author, category, and publisher if provided
        if (team) {
            await team.updateOne({ player: { $in: [req.params.id] } }, { $pull: { player: req.params.id } });
            await team.findOneAndUpdate({ _id: team }, { $push: { player: req.params.id } });
        }

        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json({ message: 'Player update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while updating the player' });
    }
}

module.exports.updatePlayerDetailPost = async (req, res) => {
    console.log(req.body)
    const { playerName, position, dob, transferPrice, team} = req.body;
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, { playerName, position, dob, transferPrice, team}, { new: true });

        // Update the author, category, and publisher if provided
        if (team) {
            await Team.updateOne({ player: { $in: [req.params.id] } }, { $pull: { player: req.params.id } });
            await Team.findOneAndUpdate({ _id: team }, { $push: { player: req.params.id } });
        }

        if (!updatedPlayer) {
        return res.status(404).json({ message: 'Player not found' });
        }
        res.json({ message: 'Player update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while updating the player' });
    }
}

module.exports.updatePlayerImagePost = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (player.playerImage) {
        fs.unlink(path.join(__dirname, 'frontend', player.playerImage), err => {
            if (err) console.error(err);
        });
        }
        const plaerImage = "/images/" + (req.file ? req.file.filename : '');
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, { playerImage }, { new: true });

        if (!updatedPlayer) {
        return res.status(404).json({ message: 'Player not found' });
        }
        res.json({ message: 'Player image update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while updating the book image' });
    }
}


module.exports.searchGet = async (req, res) => {
    const searchQuery = req.query.query;

    try {
        const player = await Player.find({ title: new RegExp(searchQuery, 'i') }).populate('team');
        res.render('searchResult', { searchQuery: searchQuery, player: player });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while searching for player');
    }
}

module.exports.deletePlayer = async (req, res) => {
    const playerId = req.params.id;
    try {
        let player = await Player.findOne({ _id: req.params.id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        let team = team.author;

        // Remove book from Author
        await Team.updateOne({ player: { $in: [req.params.id] } }, { $pull: { player: req.params.id } });

        // Remove Image
        if (player.playerImage && player.playerImage !== 'https://i.ibb.co/K05xQk1/book7.png') {
            fs.unlink(path.join(__dirname, 'frontend', book.bookImage), err => {
                if (err) console.error(err);
            });
        }

        // Remove book
        await Player.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Player deleted successfully', deletedPlayerId: playerId });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

// Post for author, category, publisher

module.exports.teamPost = async (req, res) => {
    
    try {
        const { teamName, squadSize, marketValue, transferRecord, avgPlayerValue, avgAge, player } = req.body;
        let teamData = { teamName, squadSize, marketValue, transferRecord, avgPlayerValue, avgAge, player };
        
        if (req.file) {
            teamData.teamImage = "/images/" + req.file.filename;
        }
        const team = await Team.create(teamData);
        res.status(200).json(team);
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

// Delete for author, category, publisher

module.exports.deleteTeam = async (req, res) => {
    const teamId = req.params.id;
    try {
        let team = await Team.findOne({ _id: teamId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Remove author
        await Team.deleteOne({ _id: teamId });

        res.status(200).json({ message: 'Team deleted successfully', deletedTeamId: teamId });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.teamGet = async (req, res) => {
    try {
        res.render('team');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}