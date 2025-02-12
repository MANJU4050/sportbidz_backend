const express = require('express');
const route = express.Router();
const multer = require('multer');

const { tournamentImage } = require('../controllers/mediaController');
const verifyToken = require('../middlewares/jwt/verifyToken')

const upload = multer({ storage: multer.memoryStorage() });


route.post('/upload',verifyToken,upload.single('image'),tournamentImage)

module.exports = route