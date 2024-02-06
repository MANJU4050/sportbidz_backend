const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const User = require("../models/User")
const { userRegistrationSchema, userLoginSchema } = require("../validators/userValidator")
const { authLogger } = require("../utils/logger")

//user registration
const registerUser = async (req, res) => {

    try {

        authLogger.info(`user registration request by ${req.body.mobile}`)

        const { error } = userRegistrationSchema.validate(req.body)
        if (error) {
            authLogger.error(`validation failed with error : ${error.details[0].message}`)
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

//user login
const loginUser = async (req, res) => {
    try {

        const { error } = userLoginSchema.validate(req.body)
        if (error) {
            authLogger.error(`validation failed for login by user: ${req.body.mobile}`)
            return res.status(400).json({ error: error.details[0].message })
        }

        const user = await User.findOne({ mobile: req.body.mobile })
        if (!user) {
            authLogger.error(`no user accounts found for login with mobile : ${req.body.mobile}`)
            return res.status(401).json({ error: 'user not registered' })
        }

        const isAuth = await bcrypt.compare(req.body.password, user?.password)
        if (!isAuth) {
            authLogger.error(`invalid password login attempt by user : ${req.body.mobile}`)
            return res.status(401).json({ error: 'invalid credentials' })
        }

        const accessToken = await jwt.sign({ userId: user?._id }, process.env.ACCESS_TOKEN, { expiresIn: '15m' })
        const refreshToken = await jwt.sign({ userId: user?._id }, process.env.REFRESH_TOKEN, { expiresIn: '7d' })

        authLogger.info(`successfull login by user : ${req.body.mobile}`)
        res.cookie('token', accessToken, { httpOnly: true, secure: true, maxAge: 900000 })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 604800000 }).status(200).json({ message: 'login successfull' })

    } catch (error) {

        console.log(error)
        res.status(500).json({ error: `internal server error` })

    }
}


module.exports = {
    registerUser,
    loginUser
}