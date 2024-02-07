const express = require("express")
const router = express.Router()

const userController = require("../controllers/userController")
const verifyToken = require('../middlewares/jwt/verifyToken')

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/checkstatus', verifyToken, userController.userStatusCheck)
router.delete('/logout', userController.logoutUser)

module.exports = router