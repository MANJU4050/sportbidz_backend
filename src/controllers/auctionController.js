const Auction = require('../models/Auction')
const Manager = require('../models/Manager')
const { auctionRegisterSchema } = require('../validators/AuctionValidator')
const { auctionLogger } = require('../utils/logger')

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


const getAuctionsByUser = async (req, res) => {
    try {

        const userId = req.user.userId

        const auctions = await Auction.find({ $or: [{ adminId: userId }, { managers: { $elemMatch: { managerId: userId } } }] })
        if (auctions.length === 0) {
            auctionLogger.warn(`empty auction request by user: ${userId}`)
            res.status(404).json({ error: "no auctions found for user" })
            return
        }

        auctionLogger.info(`auctions fetched by user : ${userId}`)
        res.status(200).json(auctions)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}

const getAuctionById = async (req, res) => {
    try {
        const userId = req.user.userId
        const { auctionId } = req.params

        const auction = await Auction.findById(auctionId);

        if (!auction) {
            res.status(404).json({ error: "no auction found" })
        }

        let isAdmin = false
        if (userId === auction.adminId) {
            isAdmin = true
        }

        res.status(200).json({ auction: auction, isAdmin: isAdmin })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}


module.exports = {
    auctionRegistration,
    getAuctionsByUser,
    getAuctionById
}