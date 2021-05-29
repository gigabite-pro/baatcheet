const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    ownerName: {
        type: String,
        required: true,
    },
    ownerEmail: {
        type: String,
        required: true,
    },
    appointmentCode: {
        type: String,
        required: true,
    },
    appointmentDate: {
        type: String,
        required: true,
    },
    appointmentTime: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    memberName : {
        type: String,
    },
    memberEmail: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;