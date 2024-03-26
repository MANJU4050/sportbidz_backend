const express = require("express")
const { createServer } = require("http")
const cors = require("cors")
require("dotenv").config()
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser')
const { Server } = require('socket.io')
const { v4: uuidv4 } = require('uuid')

const { ObjectId } = mongoose.Types
const { dbLogger, requestLogger, serverLogger } = require("./utils/logger")
const userRoutes = require("./routes/userRoutes")
const tournamentRoutes = require('./routes/tournamentRoutes')
const playerRoutes = require('./routes/PlayerRoutes')
const managerRoutes = require('./routes/managerRoutes')
const auctionRoutes = require('./routes/auctionRoutes')
const verifyTokenSocket = require('./middlewares/jwt/verifyTokenSocket')

const Player = require('./models/Player')
const Auction = require('./models/Auction')
const Manager = require('./models/Manager')

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
})

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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
app.use(`/api/${process.env.API_VERSION}/tournaments`, tournamentRoutes)
app.use(`/api/${process.env.API_VERSION}/players`, playerRoutes)
app.use(`/api/${process.env.API_VERSION}/managers`, managerRoutes)
app.use(`/api/${process.env.API_VERSION}/auctions`, auctionRoutes)



// app.use((err, req, res, next) => {
//     serverLogger.error(err)
//     return res.status(500).send("something broke")
// })


let customIdToSocketIdMap = {}
const auctionSpace = io.of('/auctions')
auctionSpace.on('connection', async (socket) => {
    try {

        console.log(`user ${socket.id} connected`)

        const cookies = socket.handshake.headers.cookie

        if (!cookies) {
            socket.disconnect()
            console.log('user doesnt have any cookies')
            return
        }

        const isAuthorized = await verifyTokenSocket(cookies)

        if (!isAuthorized) {
            socket.disconnect()
            return
        }

        const { userId } = isAuthorized

        customIdToSocketIdMap[userId] = socket.id

        socket.on('start', async (auctionId, tournamentId) => {

            const auction = await Auction.findById(auctionId)
            if (auction?.adminId !== userId) {
                socket.disconnect()
                console.log('unauthorized start request')
                return
            }

            const players = await Player.find({ tournamentId: tournamentId })
            const updateResult = await Auction.updateOne(
                { _id: auctionId },
                [
                    {
                        $set: {
                            "players": players,
                            "managers": {
                                $map: {
                                    input: "$managers",
                                    as: "manager",
                                    in: {
                                        $mergeObjects: [
                                            "$$manager",
                                            {
                                                playersRequired: "$playersPerTeam",
                                                pointsRemaining: "$totalTeamPoints"
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]
            );


            const randomNumber = Math.floor(Math.random() * (players.length))
            const selectedPlayer = players[randomNumber]
            await Auction.updateOne({ _id: auctionId }, { currentBiddingPlayer: selectedPlayer, auctionStatus: 'started', currentPlayerNumber: 1 })
            io.of('/auctions').emit('started', (selectedPlayer))

        })

        socket.on('bid', async (bidder, auctionId) => {

            const auction = await Auction.aggregate([
                { $match: { _id: new ObjectId(auctionId) } }, // Match document by ID
                {
                    $set: { // or $set, which is equivalent in this context
                        manager: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$managers",
                                        as: "manager",
                                        cond: { $eq: ["$$manager.managerId", bidder?.managerId] } // Filter condition
                                    }
                                },
                                0 // Get the first element from the filtered results
                            ]

                        }
                    }
                }
            ])

            if (auction[0]?.manager?.playersBought >= auction[0]?.playersPerTeam) {
                io.of('/auctions').to(socket.id).emit('message', 'you already bought enough players')
                console.log('enough players bought')
                return
            }


            if (bidder?.managerId === auction[0]?.currentHighestBid?.bidder?.managerId) {
                io.of('/auctions').to(socket.id).emit('message', 'you are already the highest bidder')
                console.log('already highest bidder')
                return
            }

            let bid = 0
            if (auction[0]?.currentHighestBid?.bid === 0) {
                bid = auction[0]?.basePlayerPoints

            } else {
                bid = auction[0]?.currentHighestBid?.bid + auction[0]?.currentHikePoints
            }

            const pointsLeft = auction[0]?.manager?.pointsRemaining - bid
            const pointsRequired = (auction[0]?.manager?.playersRequired - 1) * auction[0]?.basePlayerPoints

            console.log(pointsLeft, "pointsleft")
            console.log(pointsRequired, "pointsRequired")

            if (pointsLeft < pointsRequired) {

                io.of('/auctions').to(socket.id).emit('message', 'not enough points')
                console.log('not enough points')
                return
            }

            const bidDetails = {
                _id: uuidv4(),
                bid: bid,
                bidder: bidder
            }

            const updateBid = await Auction.updateOne({ _id: auctionId }, { $push: { currentPlayerBids: bidDetails }, $set: { currentHighestBid: { bid: bid, bidder: bidder } } })
            io.of('/auctions').emit('newBid', (bidDetails))
        })

        socket.on('sell', async (auctionId) => {

            const auction = await Auction.aggregate([
                { $match: { _id: new ObjectId(auctionId) } }, // Match document by ID
                {
                    $set: { // or $set, which is equivalent in this context
                        manager: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$managers",
                                        as: "manager",
                                        cond: { $eq: ["$$manager.managerId", "$currentHighestBid.bidder.managerId"] } // Filter condition
                                    }
                                },
                                0 // Get the first element from the filtered results
                            ]

                        }
                    }
                }
            ])


            const pointsUsed = auction[0]?.currentHighestBid.bid
            const totalPointsUsed = auction[0]?.manager?.pointsUsed + pointsUsed
            const pointsRemaining = auction[0]?.manager?.pointsRemaining - pointsUsed
            const playersBought = auction[0]?.manager?.playersBought + 1
            const playersRequired = auction[0]?.manager?.playersRequired - 1
            let maxBiddablePoints = 0
            if (auction[0]?.manager?.playersRequired === 1) {
                maxBiddablePoints = auction[0]?.manager?.pointsRemaining - auction[0]?.currentHighestBid?.bid
            } else {
                maxBiddablePoints = (auction[0]?.manager?.pointsRemaining - auction[0]?.currentHighestBid?.bid) - ((auction[0]?.manager?.playersRequired - 2) * auction[0]?.basePlayerPoints)

            }
            console.log(maxBiddablePoints, "max biddable")

            const auctionDetails = {
                _id: uuidv4(),
                bid: pointsUsed,
                bidder: auction[0]?.currentHighestBid?.bidder,
                player: auction[0]?.currentBiddingPlayer
            }

            const updatedBid = await Auction.findOneAndUpdate({ _id: auctionId, 'managers.managerId': auction[0]?.currentHighestBid?.bidder?.managerId }, { $push: { soldPlayers: auction[0]?.currentBiddingPlayer, auctionDetails: auctionDetails, 'managers.$.players': auction[0]?.currentBiddingPlayer }, $set: { currentPlayerStatus: 'sold', 'managers.$.pointsRemaining': pointsRemaining, 'managers.$.pointsUsed': totalPointsUsed, 'managers.$.playersBought': playersBought, 'managers.$.playersRequired': playersRequired } }, { new: true })
            const points = {
                pointsUsed: totalPointsUsed,
                pointsRemaining
            }


            const socketId = customIdToSocketIdMap[auction[0]?.currentHighestBid?.bidder?.managerId]
            io.of('/auctions').emit('sold', auctionDetails, updatedBid?.managers)
            io.of('/auctions').to(socketId).emit('points', points, maxBiddablePoints)
        })

        socket.on('unsold', async (auctionId) => {
            const auction = await Auction?.findById(auctionId)

            const updatedAuction = await Auction?.updateOne({ _id: auctionId }, { $push: { unSoldPlayers: auction?.currentBiddingPlayer }, $set: { currentPlayerStatus: 'unsold' } })
            io.of('/auctions').emit('playerunsold')
        })

        // socket.on('nextplayer', async (auctionId) => {

        //     const auction = await Auction.findById(auctionId)
        //     let auctionPlayers = []
        //     if (auction?.currentPlayerNumber === auction?.players?.length) {
        //         auctionPlayers = auction?.unSoldPlayers
        //     }else{
        //         auctionPlayers = auction?.players
        //     }

        //     const randomNumber = Math.floor(Math.random() * (auctionPlayers?.length))
        //     const selectedPlayer = auction?.players[randomNumber]

        //     const playerAlreadyAuctioned = auction?.soldPlayers.some((player)=>{
        //         return player?._id === selectedPlayer?._id
        //     })

        //     const playerAlreadyUnSold = auction?.unSoldPlayers?.some((player)=>{
        //         return player?._id === selectedPlayer?._id
        //     })

        //     await Auction.updateOne({ _id: auctionId }, { currentBiddingPlayer: selectedPlayer, currentPlayerStatus: 'new', currentHighestBid: { bid: 0, bidder: {} }, currentPlayerBids: [] })
        //     io.of('/auctions').emit('playerupdate', (selectedPlayer))

        // })


        socket.on('nextplayer', async (auctionId) => {
            let auction = await Auction.findById(auctionId);
            let auctionPlayers = [];
            let currentPlayerNumber = 0

            if (auction?.currentPlayerNumber === auction?.players?.length) {
                auctionPlayers = auction?.unSoldPlayers;
                currentPlayerNumber = 1
                auction = await Auction.findOneAndUpdate({ _id: auctionId }, { players: auctionPlayers, unSoldPlayers: [], currentPlayerNumber: currentPlayerNumber }, { new: true });
            } else {
                auctionPlayers = auction?.players;
                currentPlayerNumber = auction?.currentPlayerNumber + 1
            }

            let selectedPlayer = null;
            const attemptedPlayerIds = new Set(); // Store attempted player IDs to avoid repeats
            let attempts = 0;

            console.log(attemptedPlayerIds, "attempted")

            while (attempts < auctionPlayers.length) {
                const randomNumber = Math.floor(Math.random() * auctionPlayers.length);
                const potentialPlayer = auctionPlayers[randomNumber];

                // Check if this player was already attempted
                if (attemptedPlayerIds.has(potentialPlayer?._id.toString())) {
                    continue; // Skip this loop iteration without incrementing attempts
                }

                // Mark this player as attempted
                attemptedPlayerIds.add(potentialPlayer?._id.toString());

                // Check if the player is neither in the soldPlayers nor in the unSoldPlayers arrays
                const isPlayerAvailable = !auction?.soldPlayers.some(player => player?._id.toString() === potentialPlayer?._id.toString()) &&
                    !auction?.unSoldPlayers.some(player => player?._id.toString() === potentialPlayer?._id.toString());

                if (isPlayerAvailable) {
                    selectedPlayer = potentialPlayer;
                    break;
                }
                attempts++;
            }

            if (selectedPlayer) {
                await Auction.updateOne({ _id: auctionId }, {
                    currentBiddingPlayer: selectedPlayer,
                    currentPlayerStatus: 'new',
                    currentHighestBid: { bid: 0, bidder: {} },
                    currentPlayerNumber: currentPlayerNumber,
                    currentPlayerBids: []
                });
                io.of('/auctions').emit('playerupdate', selectedPlayer, currentPlayerNumber, auctionPlayers?.length);
            } else {
                // Handle the case where no available player is found
                io.of('/auctions').to(socket.id).emit('message', 'no available players found')
            }
        });


    } catch (error) {
        socket.disconnect()
        console.log(error)
        return
    }

})

server.listen(process.env.PORT, () => {
    serverLogger.info(`server started running on port : ${process.env.PORT}`)
})