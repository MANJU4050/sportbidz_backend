const mongoose = require('mongoose')

const managerSchema = mongoose.Schema({
    
    tournamentId: { type: String, required: true },
    managerId:{type: String,required: true},
    managerName: { type: String, required: true },
    mobile: { type: String, required: true },
    role:{type: String,required: true},    
    teamName: { type: String },
    address:{type: String},
    dateOfBirth:{type: String},
    pointsUsed:{type: Number,default:0},
    pointsRemaining:{type: Number, default:0},
    playersRequired:{type: Number,default:0},
    playersBought:{type: Number, default:0},
    icon: {
        name: { type: String },
        role:{type: String},
        mobile: { type: String },
        address: { type: String }
    }
},{ timestamps: true })

const Manager = mongoose.model('Manager',managerSchema)

module.exports = Manager