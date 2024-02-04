const express = require("express")
const {createServer} = require("http")
const cors = require("cors")
require("dotenv").config()

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

app.get('/',async(req,res)=>{
    res.status(200).json({message:"server is up and running"})
})

app.use((err,req, res, next)=>{
    console.error(err.stack)
    res.status(500).send("something broke")
})

server.listen(process.env.PORT,()=>{
    console.log(`server started running on port : ${process.env.PORT}`)
})