const joi = require("joi")

const userRegistrationSchema = joi.object({
    name: joi.string().required().min(3).max(15).messages({
        'string.empty': 'name cannot be empty',
        'string.min': 'name should contain minimum 3 characters',
        'string.max': 'name cannot be more than 15 characters',
        'string.base': 'name should be a string'
    }),
    mobile: joi.string().required().pattern(/^[0-9]{10}$/).messages({
        'string.empty': 'mobile number cannot be empty',
        'string.base': 'mobile number should be a string',
        'string.pattern.base': 'invalid mobile number'
    }),
    password: joi.string().min(6).max(15).required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*#@&!]).{6,}$')).messages({
        'string.empty': 'password cannot be empty',
        'string.base': 'password should be a string',
        'string.pattern.base': "invalid password format"
    }),
    username: joi.string().alphanum(),
    email: joi.string().email().allow(""),

})


module.exports = {
    userRegistrationSchema
}