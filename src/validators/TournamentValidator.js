const joi = require('joi')

const tournamentRegistrationSchema = joi.object({
    tournamentName: joi.string().required().min(3).max(100).messages({
        'string.empty': 'tournament name cannot be empty',
        'string.min': 'tournament name should contain minimum 3 characters',
        'string.max': 'tournament name cannot be more than 15 characters',
        'string.base': 'tournament name should be a string'
    }),
    tournamentStartDate: joi.date().required(),
    numberOfTeams: joi.number().required().max(64),
    tournamentType: joi.string().required(),
    playersPerTeam: joi.number().required().min(2),
    maximumRegistrations: joi.number().required(),
    address: joi.string().required(),
    mobile: joi.string().required().pattern(/^[0-9]{10}$/).messages({
        'string.empty': 'mobile number cannot be empty',
        'string.base': 'mobile number should be a string',
        'string.pattern.base': 'invalid mobile number'
    }),
    registrationStartDate: joi.date().required(),
    registrationEndDate: joi.date().required()

})


module.exports = {
    tournamentRegistrationSchema
}