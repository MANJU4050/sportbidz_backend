const mongoose = require('mongoose')

const TournamentSchema = new mongoose.Schema({
    createdBy: { type: String, required: true },
    tournamentName: { type: String, required: true },
    tournamentStartDate: { type: String, required: true },
    tournamentEndDate: { type: String },
    mobile: { type: String, required: true },
    numberOfTeams: { type: Number, required: true },
    tournamentType: { type: String },
    playersPerTeam: { type: Number, required: true },
    maximumRegistrations: { type: Number, required: true },
    address: { type: String, required: true },
    registrationStartDate: { type: String },
    registrationEndDate: { type: String }

},
    { timestamps: true })

const Tournament = mongoose.model('Tournament', TournamentSchema)

module.exports = Tournament