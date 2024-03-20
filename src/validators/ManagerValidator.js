const joi = require('joi')

const managerRegistrationSchema = joi.object({
    tournamentId: joi.string().required(),
    managerName: joi.string().required().min(3).max(15),
    mobile: joi.string().required().pattern(/^[0-9]{10}$/),
    teamName:joi.string(),
    address: joi.string().allow("").min(3).max(50),
    dateOfBirth: joi.date().allow(""),
    icon: {
        iconName:joi.string().allow(""),
        iconMobile:joi.string().pattern(/^[0-9]{10}$/).allow(""),
        iconAddress:joi.string().allow("")
    }
   
})

module.exports = {
    managerRegistrationSchema
}