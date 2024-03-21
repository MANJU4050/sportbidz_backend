const express = require('express')
const route = express.Router()

const { auctionRegistration } = require('../controllers/auctionController')
const verifyToken = require('../middlewares/jwt/verifyToken')

route.post('/register', verifyToken, auctionRegistration)

module.exports = route