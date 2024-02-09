const jwt = require('jsonwebtoken')
const { authLogger } = require('../../utils/logger')

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        authLogger.error(`request made with no token`)
        return res.status(403).json({ error: `no token found` })
    }

    try {
        const { userId, status } = jwt.verify(token, process.env.ACCESS_TOKEN)

        if (status !== 'active') {
            authLogger.error(`request made with no token`)
            return res.status(401).json({ error: `account inactive` })
        }
        req.user = { userId, status }
        next()
    } catch (error) {
        return res.status(401).json({ error: 'invalid token' })
    }
}

module.exports = verifyToken