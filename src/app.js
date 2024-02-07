const express = require("express")
const { createServer } = require("http")
const cors = require("cors")
require("dotenv").config()
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser')

const { dbLogger, requestLogger, serverLogger } = require("./utils/logger")
const userRoutes = require("./routes/userRoutes")

const app = express()
const server = createServer(app)

app.use(cors({
    origin: 'http://localhost:5173',
    methods:['GET','POST','PUT','PATCH','DELETE'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

//connect to mongoDB atlas
mongoose.connect(process.env.MONGODB_URL)
    .then(() => { dbLogger.info('connected to mongoDB') })
    .catch((error) => { dbLogger.error("mongoDB connection failed : ") })

app.get('/', async (req, res) => {
    requestLogger.info('get request to /')
    res.status(200).json({ message: "server is up and running" })
})


app.use(`/api/${process.env.API_VERSION}/users`, userRoutes)

app.use((err, req, res, next) => {
    serverLogger.error(err)
    res.status(500).send("something broke")
})

server.listen(process.env.PORT, () => {
    serverLogger.info(`server started running on port : ${process.env.PORT}`)
})