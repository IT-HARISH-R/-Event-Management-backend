const mongoose = require('mongoose');
const Ticket = require('../models/ticketModull');
const Event = require('../models/eventModul');

// Controller for fetching event analytics
const getEventAnalytics = async (req, res) => {
    const { eventId } = req.params;
    console.log(eventId);

    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    try {
        // Aggregate ticket sales and revenue for the specific event
        const ticketAnalytics = await Ticket.aggregate([
            { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
            {
                $group: { 
                    _id: "$ticketType",
                    totalRevenue: { $sum: "$totalAmount" },
                    totalTicketsSold: { $sum: "$quantity" },
                    paymentStatus: {
                        $push: "$paymentStatus",
                    }, 
                },
            },
            {
                $project: { 
                    ticketType: "$_id",
                    totalRevenue: 1,
                    totalTicketsSold: 1,
                    paymentStatus: {
                        Pending: { $size: { $filter: { input: "$paymentStatus", as: "status", cond: { $eq: ["$$status", "Pending"] } } } },
                        Completed: { $size: { $filter: { input: "$paymentStatus", as: "status", cond: { $eq: ["$$status", "Completed"] } } } },
                        Failed: { $size: { $filter: { input: "$paymentStatus", as: "status", cond: { $eq: ["$$status", "Failed"] } } } },
                    },
                },
            },
        ]);

        if (!ticketAnalytics.length) {
            return res.status(404).json({ message: 'No analytics found for this event' });
        }

        // Fetch event details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Send the analytics and event details in the response
        res.status(200).json({
            event: {
                title: event.title,
                description: event.description,
                date: event.date,
                location: event.location,
            },
            analytics: ticketAnalytics,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getEventAnalytics };
