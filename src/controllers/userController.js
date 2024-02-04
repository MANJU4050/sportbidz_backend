const bcrypt = require("bcrypt")

const User = require("../models/User")
const { userRegistrationSchema } = require("../validators/userValidator")
const { authLogger } = require("../utils/logger")

//user registration
const registerUser = async (req, res) => {

    try {

        console.clear()

        authLogger.info(`user registration request by ${req.body.mobile}`)

        const { error } = userRegistrationSchema.validate(req.body)
        if (error) {
            authLogger.error(`validation failed with error : ${error.details[0].message}`)
            console.log(error)
            return res.status(400).json({ error: error.details[0].message });
        }

        const existingUser = await User.findOne({ mobile: req.body.mobile });
        if (existingUser) {
            authLogger.error(`user already registered with ${req.body.mobile}`)
            return res.status(400).json({ error: `user is already registered with ${req.body.mobile}` });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, Number(process.env.SALTROUNDS))

        const newUser = new User({
            name: req.body.name,
            mobile: req.body.mobile,
            username: req.body.mobile,
            email: req.body.email,
            password: hashedPassword,
            address: req.body.address,
            referedBy: req.body.referedBy,
            role: 'member',
            status: "active"
        })

        await newUser.save()

        authLogger.info(`successfully registerd by user : ${req.body.mobile}`)
        res.status(201).json({ message: "user registration successfull" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: `internal server error` })
    }

}


module.exports = {
    registerUser
}