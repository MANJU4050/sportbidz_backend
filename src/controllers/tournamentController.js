const User = require('../models/User')
const Tournament = require('../models/Tournament')
const { tournamentRegistrationSchema } = require('../validators/TournamentValidator')
const { tournamentLogger } = require('../utils/logger')

const registerTournament = async (req, res) => {
    try {

        const { error } = tournamentRegistrationSchema.validate(req.body)
        if (error) {
            tournamentLogger.error(`tournament validation failed error : ${error.details[0].message}`)
            return res.status(400).json({ error: `validation error ${error.details[0].message}` })
        }

        const userId = req.user.userId

        const newTournament = new Tournament({
            createdBy: userId,
            tournamentName: req.body.tournamentName,
            tournamentStartDate: req.body.tournamentStartDate,
            numberOfTeams: req.body.numberOfTeams,
            tournamentType: req.body.tournamentType,
            playersPerTeam: req.body.playersPerTeam,
            maximumRegistrations: req.body.maximumRegistrations,
            address: req.body.address,
            mobile: req.body.mobile,
            registrationStartDate: req.body.registrationStartDate,
            registrationEndDate: req.body.registrationEndDate
        })

        await newTournament.save()
        tournamentLogger.info(`tournament registerd by user ${userId}`)
        res.status(200).json({ message: 'tournament registrion successfull' })


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: `internal server error` })
    }
}

const getTournamentByUser = async (req, res) => {
    try {
        const { page, limit, search } = req.query;

        let queryConditions = { createdBy: req.user.userId };

        if (search) {
            queryConditions.$or = [
                { tournamentName: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const tournaments = await Tournament.find(queryConditions)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v')
            .exec()

        if (tournaments?.length === 0) {
            return res.status(404).json({ error: "No tournaments found" });
        }

        res.status(200).json(tournaments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }

}

const getAllTournaments = async (req, res) => {
    try {

        console.log('some one trying to connect')
        const { page, limit, search } = req.query;

        let queryConditions

        if (search) {
            queryConditions.$or = [
                { tournamentName: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const tournaments = await Tournament.find(queryConditions)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v')
            .exec()

        if (tournaments?.length === 0) {
            return res.status(404).json({ error: "No tournaments found" });
        }

        res.status(200).json(tournaments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }

}

const getTournamentDetails = async (req,res) => {
    try {

        const { tournamentId } = req.params

        const tournament = await Tournament.findById(tournamentId).select('-createdBy -__v').exec()

        if (!tournament) {
            tournamentLogger.warn(`no tournament found`)
            return res.status(404).json({ error: 'no tournament found' })
        }

        res.status(200).json(tournament)


    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "internal server error" })
    }
}

module.exports = {
    registerTournament,
    getTournamentByUser,
    getAllTournaments,
    getTournamentDetails
}