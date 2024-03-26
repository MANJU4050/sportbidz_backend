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
    currentPlayerNumber:{type: Number,default:0},
    currentBiddingPlayer: {},
    currentPlayerStatus:{type: String, default:'new'},
    currentPlayerBids:[],
    currentHighestBid: {
        _id:{type: String},
        bid: { type: Number, default: 0 },
        bidder: {}
    },
    players: [],
    managers: [],
    unSoldPlayers: [],
    soldPlayers:[],
    auctionDetails:[]
}, { timestamps: true })

const Auction = mongoose.model('Auction', AuctionSchema)

module.exports = Auction