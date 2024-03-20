const mongoose = require('mongoose')

const playerSchema = mongoose.Schema({
    tournamentId: { type: String, required: true },
    playerName: { type: String, required: true },
    mobile: { type: String, required: true },
    playerType: { type: String, required: true },
    role:{type: String,required:true},
    dateOfBirth: { type: Date, },
    address: { type: String },
    state: { type: String },
    district: { type: String },
    pincode: { type: String },
    battingStyle: { type: String },
    bowlingStyle: { type: String },
    team: { type: String }

})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player