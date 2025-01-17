const Event = require("../models/eventModul")

const eventColtroller = {
    createEvent: async (req, res) => {
        try {
            const { title, description, date, time, location, ticketPrice, category, images, videos } = req.body;
            const organizer = req.user_id.id; // Assume authentication middleware is used
            const event = new Event({ title, description, date, time, location, ticketPrice, category, images, videos, organizer });
            await event.save();
            res.status(201).json(event);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
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