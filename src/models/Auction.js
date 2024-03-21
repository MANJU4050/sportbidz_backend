const mongoose = require('mongoose')

const AuctionSchema = mongoose.Schema({
    tournamentId: String,
    adminId: String,
    auctionDate: Date,
    numberOfTeams: Number,
    playersPerTeam: Number,
    basePlayerPoints: Number,
    maxPlayerPoints: Number,
    totalTeamPoints: Number,
    currentHikePoints: Number,
    auctionStatus:String,
    currentBiddingPlayer: {},
    currentHighestBid: {
        bid: { type: Number, default: 0 },
        bidder: {}
    },
    players: [],
    managers: [],
    unSoldPlayers: [],
    auctionDetails:[]
}, { timestamps: true })

const Auction = mongoose.model('Auction', AuctionSchema)

module.exports = Auction