const express = require('express')
const route = express.Router()

const { auctionRegistration, getAuctionsByUser, getAuctionById } = require('../controllers/auctionController')
const verifyToken = require('../middlewares/jwt/verifyToken')

route.post('/register', verifyToken, auctionRegistration)
route.get('/auctions-by-user',verifyToken,getAuctionsByUser)
route.get('/auction-by-id/:auctionId',verifyToken,getAuctionById)

module.exports = route