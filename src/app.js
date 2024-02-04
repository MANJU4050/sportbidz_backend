const express = require("express")
const { createServer } = require("http")
const cors = require("cors")
require("dotenv").config()
const mongoose = require("mongoose")

const { dbLogger, requestLogger, serverLogger } = require("./utils/logger")

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

//connect to mongoDB atlas
mongoose.connect(process.env.MONGODB_URL)
    .then(() => { dbLogger.info('connected to mongoDB') })
    .catch((error) => { dbLogger.error("mongoDB connection failed : ") })

app.get('/', async (req, res) => {
    requestLogger.info('get request to /')
    res.status(200).json({ message: "server is up and running" })
})

app.use((err, req, res, next) => {
    serverLogger.error(err)
    res.status(500).send("something broke")
})

server.listen(process.env.PORT, () => {
    serverLogger.info(`server started running on port : ${process.env.PORT}`)
})