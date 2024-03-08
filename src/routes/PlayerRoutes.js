const express = require('express')
const route = express.Router()

const { registerPlayerByTournament,getPlayerByTournament } = require('../controllers/playerController')

route.post('/register', registerPlayerByTournament)
route.get('/getplayers/:tournamentId', getPlayerByTournament)


module.exports = route