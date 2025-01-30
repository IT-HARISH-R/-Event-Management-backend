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
        required: [true, 'Event date is required'],
        validate: {
            validator: function (value) {
                return value >= new Date(); // Date must be in the future
            },
            message: 'Event date must be in the future',
        },
    },
    // date: {
    //     type: Date,
    //     required: true
    // },
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
            type: { type: String, required: [true, 'Ticket type is required'] },
            price: { type: Number, required: [true, 'Ticket price is required'] },
            quantity: { type: Number, required: [true, 'Ticket quantity is required'] },
        },
    ],
    category: {
        type: String,
        required: true
    },
    images: [{
        public_id: {
            type: String,
            require: true
        },
        url: {
            type: String,
            require: true
        }
    }],
    // images: {
    //     type: [String],
    //     required: true
    // },
    videos: [{
        public_id: {
            type: String,
            require: true
        },
        url: {
            type: String,
            require: true
        }
    }],
    candidates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizer',
        required: true
    },
    approvalStatus: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema, "event");