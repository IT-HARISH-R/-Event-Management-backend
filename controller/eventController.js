const Event = require("../models/eventModul")

const eventColtroller = {
    createEvent: async (req, res) => async (req, res) => {
        try {
            const { title, description, date, time, location, ticketPrice, category, organizer } = req.body;
console.log("comeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
            // Prepare URLs or file paths for uploaded images and videos
            const images = req.files.images ? req.files.images.map(file => file.path) : [];
            const videos = req.files.videos ? req.files.videos.map(file => file.path) : [];

            // Create the event in the database
            const newEvent = new Event({
                title,
                description,
                date,
                time,
                location,
                ticketPrice,
                category,
                images,  // Save file paths of images
                videos,  // Save file paths of videos
                organizer
            });

            const savedEvent = await newEvent.save();
            res.status(200).json({ message: 'Event created successfully', event: savedEvent });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    search: async (req, res) => {
        try {
            const { search, dateFrom, dateTo, location, category, minPrice, maxPrice } = req.query;

            const filters = {};
            if (search) filters.title = new RegExp(search, 'i'); // Case-insensitive search
            if (dateFrom || dateTo) filters.date = { ...(dateFrom && { $gte: dateFrom }), ...(dateTo && { $lte: dateTo }) };
            if (location) filters.location = new RegExp(location, 'i'); // Case-insensitive
            if (category) filters.category = category;
            if (minPrice || maxPrice) filters.ticketPrice = { ...(minPrice && { $gte: minPrice }), ...(maxPrice && { $lte: maxPrice }) };

            const events = await Event.find(filters);
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = eventColtroller