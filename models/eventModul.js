const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    ticketTypes: [
        {
            type: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    category: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    videos: {
        type: [String],
        required: true
    },
    candidates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizer',
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema, "event");