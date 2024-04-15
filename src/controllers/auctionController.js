const Auction = require('../models/Auction')
const Manager = require('../models/Manager')
const Player = require('../models/Player')
const { auctionRegisterSchema } = require('../validators/AuctionValidator')
const { auctionLogger } = require('../utils/logger')

const mongoose = require('mongoose')

const auctionRegistration = async (req, res) => {
    try {
        const userId = req.user.userId

        const { error } = auctionRegisterSchema.validate(req.body)

        if (error) {
            auctionLogger.warn(`auction validation failed by : ${userId}`)
            return res.status(401).json({ error: error.details[0].message })
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
            currentPlayerBids: [],
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
            return res.status(404).json({ error: "no auctions found for user" })
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
        const { auctionId, tournamentId } = req.params

        const totalPlayerRegistrations = await Player.countDocuments({ tournamentId: tournamentId })

        const auction = await Auction.findById(auctionId)
        const manager = auction?.managers?.filter((manager) => {
            return manager?.managerId === userId
        })

        console.log(manager, "manager")


        if (!auction) {
            return res.status(404).json({ error: "no auction found" })
        }

        let isAdmin = false
        if (userId === auction.adminId) {
            isAdmin = true
        }

        res.status(200).json({ auction: auction, totalPlayerRegistrations: totalPlayerRegistrations, isAdmin: isAdmin, manager: manager[0] })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}


const deleteAuctionById = async (req, res) => {
    try {

        const { auctionId } = req.params
        const deleteAuction = await Auction.deleteOne({ _id: auctionId })
        res.status(200).json({ message: 'successfully delete auction' })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}

const auctionByIdOpen = async (req, res) => {
    try {

        const { auctionId } = req.params

        const auction = await Auction.findById(auctionId)

        if (!auction) {
            return res.status(404).json({ error: "no auction found" })
        }

        res.status(200).json(auction)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}


module.exports = {
    auctionRegistration,
    getAuctionsByUser,
    getAuctionById,
    deleteAuctionById,
    auctionByIdOpen
}