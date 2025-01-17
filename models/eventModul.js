const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }], // URLs for images
    videos: [{ type: String }], // URLs for videos
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema, "enent");
