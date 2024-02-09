const express = require("express")
const route = express.Router()

const tournamentController = require('../controllers/tournamentController')
const verifyToken = require('../middlewares/jwt/verifyToken')

route.post('/register',verifyToken,tournamentController.registerTournament)
route.get('/getbyuser',verifyToken,tournamentController.getTournamentByUser)
route.get('/getall',verifyToken,tournamentController.getAllTournaments)


module.exports = route