const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    address: { type: String },
    role: { type: String, required: true },
    referedBy: { type: String },
    status: { type: String, required: true }

},
    { timestamps: true })

const User = mongoose.model("User", userSchema)

module.exports = User