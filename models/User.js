const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    typeOfUser: {
        type: String,
        required: true,
    },
    appointments : {
        type: Array,
    },
    email: {
        type: String,
        required: true,
    },
    pfpUrl: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;