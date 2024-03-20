const Manager = require('../models/Manager')
const Tournament = require('../models/Tournament')
const { managerRegistrationSchema } = require('../validators/ManagerValidator')
const {managerLogger} = require('../utils/logger')


const registerManager = async (req, res) => {
    try {

        const { error } = managerRegistrationSchema.validate(req.body)
        if (error) {
            managerLogger.error(`manager validation failed with error : ${error.details[0].message}`)
            res.status(401).json({ error: error.details[0].message })
        }

        const userId = req.user.userId

        const newManager = new Manager({
            managerId: userId,
            tournamentId: req.body.tournamentId,
            managerName: req.body.managerName,
            mobile: req.body.mobile,
            teamName: req.body.teamName,
            role: 'manager',
            dateOfBirth: req.body.dateOfBirth,
            icon: {
                iconName: req.body.iconName,
                iconMobile: req.body.iconMobile,
                iconAddress: req.body.iconAddress
            }
        })

        await newManager.save()

        managerLogger.info(`manager registered for tournament : ${req.body.tournamentId}`)
        res.status(201).json({ message: "manager registration successfull" })



    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "internal server error" })
    }
}

const getManagersByTournament = async (req, res) => {
    try {

        const { tournamentId } = req.params
        const userId = req.user.userId

        const tournament = await Tournament.findById(tournamentId)

        if (tournament?.createdBy !== userId) {
            managerLogger.error(`unauthorized access request for tournament managers by ${userId}`)
            return res.status(401).json({ error: "not authorized" })
        }

        const managers = await Manager.find({ tournamentId: tournamentId }).select('-__v').exec()

        if (!managers || managers.length === 0) {
            managerLogger.warn(`no managers found for tournament : ${tournamentId}`)
            return res.status(404).json({ error: "no managers found" })

        }

        managerLogger.info(`fetched managers for tournament : ${tournamentId}`)
        res.status(200).json(managers)

    } catch (error) {

    }
}
module.exports = {
    registerManager,
    getManagersByTournament
}