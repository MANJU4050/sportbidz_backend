const Player = require('../models/Player')
const { playerRegistrationSchema } = require('../validators/PlayerValidator')
const { playerLogger } = require('../utils/logger')


const registerPlayerByTournament = async (req, res) => {
    try {

        const { error } = playerRegistrationSchema.validate(req.body)
        if (error) {
            playerLogger.error(`player validation failed with error : ${error.details[0].message}`)
            return res.status(401).json({ error: error.details[0].message })
        }

        const newPlayer = new Player({
            tournamentId: req.body.tournamentId,
            playerName: req.body.playerName,
            mobile: req.body.mobile,
            playerType: req.body.playerType,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            role:'player',
            state: req.body.state,
            district: req.body.district,
            pincode: req.body.pincode,
            battingStyle: req.body.battingStyle,
            bowlingStyle: req.body.bowlingStyle,
            team: req.body.team

        })

        await newPlayer.save()

        playerLogger.info(`successfully registered by player : ${req.body.mobile} for tournament : ${req.body.tournamentId}`)
        res.status(201).json({ message: 'registration successfull' })


    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}


const getPlayerByTournament = async (req, res) => {

    try {

        const { tournamentId } = req.params

        const players = await Player.find({ tournamentId: tournamentId })

        if (!players || players.length === 0) {
            playerLogger.warn(`no players registered for the tournament ${tournamentId}`)
            return res.status(404).json({ error: "no players registered" })
        }

        res.status(200).json(players)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'internal server error' })
    }
}


module.exports = {
    registerPlayerByTournament,
    getPlayerByTournament
}