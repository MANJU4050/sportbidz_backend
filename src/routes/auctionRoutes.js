const express = require('express')
const route = express.Router()

const { auctionRegistration, getAuctionsByUser } = require('../controllers/auctionController')
const verifyToken = require('../middlewares/jwt/verifyToken')

route.post('/register', verifyToken, auctionRegistration)
route.get('/auctions-by-user',verifyToken,getAuctionsByUser)

module.exports = route