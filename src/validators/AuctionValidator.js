const joi = require('joi')

const auctionRegisterSchema = joi.object({
    tournamentId: joi.string().required(),
    auctionDate: joi.date().required(),
    numberOfTeams: joi.number().required().max(64),
    playersPerTeam: joi.number().required().min(2),
    basePlayerPoints: joi.number().required(),
    maxPlayerPoints: joi.number().required(),
    totalTeamPoints: joi.number().required(),
    currentHikePoints: joi.number().required(),
    auctionStatus: joi.string(),
    currentBiddingPlayer: joi.object(),
    currentHighestBid: joi.object(),
    players: joi.array(),
    managers: joi.array(),
    unSoldPlayers: joi.array(),
    auctionDetails: joi.array()
})

module.exports = { auctionRegisterSchema }