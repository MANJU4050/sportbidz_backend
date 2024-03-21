const Auction = require('../models/Auction')
const Manager = require('../models/Manager')
const { auctionRegisterSchema } = require('../validators/AuctionValidator')
const {auctionLogger} = require('../utils/logger')

const auctionRegistration = async (req, res) => {
    try {
        const userId = req.user.userId

        const { error } = auctionRegisterSchema.validate(req.body)

        if (error) {
            auctionLogger.warn(`auction validation failed by : ${userId}`)
            res.status(401).json({ error: error.details[0].message })
        }


        const managers = await Manager.find({ tournamentId: req.body.tournamentId })

        const newAuction = new Auction({
            tournamentId: req.body.tournamentId,
            adminId: userId,
            auctionDate: req.body.auctionDate,
            numberOfTeams: req.body.numberOfTeams,
            playersPerTeam: req.body.playersPerTeam,
            basePlayerPoints: req.body.basePlayerPoints,
            maxPlayerPoints: req.body.maxPlayerPoints,
            totalTeamPoints: req.body.totalTeamPoints,
            currentHikePoints: req.body.currentHikePoints,
            auctionStatus: 'upcoming',
            currentBiddingPlayer: {},
            currentHighestBid: {},
            players: [],
            managers: managers,
            unSoldPlayers: [],
            auctionDetails: []
        })

        await newAuction.save()
        auctionLogger.info(`auction created successfully by user : ${userId}`)
        res.status(201).json({ message: "auction registered successfully" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}


module.exports = {
    auctionRegistration,
}