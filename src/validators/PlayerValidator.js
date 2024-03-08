const joi = require('joi')

const playerRegistrationSchema = joi.object({
    tournamentId: joi.string().required(),
    playerName: joi.string().required().min(3).max(15),
    mobile: joi.string().required().pattern(/^[0-9]{10}$/),
    playerType: joi.string().min(3).max(15),
    dateOfBirth: joi.date(),
    address: joi.string().min(3).max(50),
    state: joi.string().min(3).max(20),
    district: joi.string().min(3).max(25),
    pincode: joi.string().min(6).max(6),
    battingStyle: joi.string().min(3).max(30),
    bowlingStyle: joi.string().min(3).max(30),
    team: joi.string().min(3).max(20)
})

module.exports = {
    playerRegistrationSchema
}