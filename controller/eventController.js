const Event = require("../models/eventModul")

const eventColtroller = {
    createEvent: async (req, res) => {
        try {
            console.log("Request Files:", req.files); // Check files
            console.log("Request Body:", req.body);   // Check other fields

            const { title, description, date, time, location, ticketPrice, category, organizer } = req.body;

            // Handle files
            const images = req.files?.images ? req.files.images.map(file => file.path) : [];
            const videos = req.files?.videos ? req.files.videos.map(file => file.path) : [];

            // Save event to DB
            const newEvent = new Event({
                title,
                description,
                date,
                time,
                location,
                ticketPrice,
                category,
                images,
                videos,
                organizer
            });

            const savedEvent = await newEvent.save();
            res.status(200).json({ message: 'Event created successfully', event: savedEvent });
        } catch (error) {
            console.error("Error creating event:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    search: async (req, res) => {
        try {
            const { search, dateFrom, dateTo, location, category, minPrice, maxPrice } = req.query;

            const filters = {};
            if (search) filters.title = new RegExp(search, 'i');
            if (dateFrom || dateTo) filters.date = { ...(dateFrom && { $gte: dateFrom }), ...(dateTo && { $lte: dateTo }) };
            if (location) filters.location = new RegExp(location, 'i');
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