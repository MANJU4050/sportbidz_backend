const express = require('express')
const route = express.Router()

const { auctionRegistration, getAuctionsByUser, getAuctionById, deleteAuctionById, auctionByIdOpen } = require('../controllers/auctionController')
const verifyToken = require('../middlewares/jwt/verifyToken')

route.post('/register', verifyToken, auctionRegistration)
route.get('/auctions-by-user', verifyToken, getAuctionsByUser)
route.get('/auction-by-id/:auctionId/:tournamentId', verifyToken, getAuctionById)
route.delete('/delete-auction/:auctionId', verifyToken, deleteAuctionById)
route.get('/auction/:auctionId', auctionByIdOpen)


module.exports = route