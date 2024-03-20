const express = require('express')
const route = express.Router()

const { registerManager, getManagersByTournament } = require('../controllers/managerController')
const verifyToken = require('../middlewares/jwt/verifyToken')

route.post('/register', verifyToken, registerManager)
route.get('/managers-by-tournament/:tournamentId',verifyToken,getManagersByTournament)


module.exports = route