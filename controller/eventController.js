const Event = require("../models/eventModul")

const eventColtroller = {
    createEvent: async (req, res) => {
        try {
            console.log("Request Files:", req.files); // Check files
            console.log("Request Body:", req.body);   // Check other fields

            const { title, description, date, time, location, ticketPrice, category, organizer } = req.body;
            const userid = req.userId
            // Handle files
            console.log(userid)
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
                organizer: userid
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
            // Destructure query parameters from the request
            const { search, filterType } = req.query;  // Use req.query instead of req.body
            console.log("Search Params: ", req.query);  // Log the search parameters for debugging

            // Build the filters object
            const filters = {};

            // Apply search filter based on filterType
            if (search && filterType) {
                if (filterType === 'category') {
                    filters.category = new RegExp(search, 'i'); // Case-insensitive search for title
                } else if (filterType === 'location') {
                    filters.location = new RegExp(search, 'i'); // Case-insensitive search for location
                } else if (filterType === 'date') {
                    filters.date = new Date(search); // Assuming the date is in 'yyyy-mm-dd' format
                } else if (filterType === 'price') {
                    const priceRange = search.split('-');
                    if (priceRange.length === 2) {
                        filters.ticketPrice = {
                            $gte: parseFloat(priceRange[0]), // Min price
                            $lte: parseFloat(priceRange[1])  // Max price
                        };
                    }
                }
            }

            // Fetch events based on filters
            const events = await Event.find(filters).sort({ date: 1 }); // Sorting by date ascending

            // Return the filtered events as a JSON response
            res.json(events);
        } catch (error) {
            // Return a 500 status with the error message if something goes wrong
            res.status(500).json({ error: error.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const events = await Event.find();
            // Map through events to modify image paths
            const updatedEvents = events.map(event => {
                event.images = event.images.map(imagePath =>
                    imagePath.replace(/^.*uploads[\\/]/, 'uploads/')
                );
                return event;
            });

            res.json(updatedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getbyid: async (req, res) => {
        try {
            const id = req.params.id;
            console.log(id);
    
            if (!id) {
                return res.status(400).json({ message: "Invalid event ID" });
            }
    
            const event = await Event.findById(id);
    
            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }
    
            // Update image paths
            event.images = event.images.map(imagePath =>
                imagePath.replace(/^.*uploads[\\/]/, 'uploads/')
            );
    
            // Update video paths (assuming videos field exists)
            event.videos = event.videos.map(videoPath =>
                videoPath.replace(/^.*uploads[\\/]/, 'uploads/')
            );
    
            console.log(event);
            res.json(event);
    
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    
    
}


module.exports = eventColtroller