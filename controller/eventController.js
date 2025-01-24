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
            const { search, filterType } = req.query; // Extract query parameters
            console.log("Search Params:", req.query); // Debugging
    
            // Fetch all events from the database and sort by date
            let events = await Event.find().sort({ date: 1 });
            console.log("Total Events Fetched:", events.length); // Debugging
    
            // Apply filtering based on filterType
            if (search && filterType) {
                events = events.filter((event) => {
                    switch (filterType) {
                        case 'category':
                            return new RegExp(`^${search}$`, 'i').test(event.category); // Category filter
                        case 'location':
                            return new RegExp(search, 'i').test(event.location); // Location filter
                        case 'date': {
                            const date = new Date(search);
                            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                            return new Date(event.date) >= startOfMonth && new Date(event.date) <= endOfMonth; // Date filter
                        }
                        case 'price': {
                            const [minPrice, maxPrice] = search.split('-').map(Number);
                            console.log(minPrice, maxPrice ,"---------")
                            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                                console.log(event.ticketPrice)
                                return event.ticketPrice >= minPrice && event.ticketPrice <= maxPrice; // Price filter
                            }
                            return false;
                        }
                        default:
                            console.log(`Invalid filterType: ${filterType}`); // Log invalid filterType
                            return false;
                    }
                });
            }
    
            console.log("Filtered Events Count:", events.length); // Debugging
    
            // Modify image paths and return the updated events
            const updatedEvents = events.map((event) => ({
                ...event.toObject(),
                images: event.images.map((imagePath) => imagePath.replace(/^.*uploads[\\/]/, 'uploads/'))
            }));
    
            res.json(updatedEvents); // Send the filtered events as response
        } catch (error) {
            console.error("Error in search:", error); // Log the error for debugging
            res.status(500).json({ error: error.message }); // Return error message
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



// search: async (req, res) => {
//     try {
//         // Destructure query parameters from the request
//         const { search, filterType } = req.query; // Use req.query instead of req.body
//         console.log("Search Params:", req.query); // Debugging

//         // Initialize the filters object
//         const filters = {};

//         console.log("Applied Filters Before Processing:", filters); // Log filters before applying conditions

//         // Apply search filter based on filterType
//         if (search && filterType) {
//             if (filterType === 'category') {
//                 filters.category = { $regex: new RegExp(`^${search}$`, 'i') };
//                 console.log(filters.category,"-----------")
//                 // Strict case-insensitive match
//             } 
//             else if (filterType === 'location') {
//                 filters.location = { $regex: new RegExp(search, 'i') };
//             }

            
//             else if (filterType === 'date') {
//                 const date = new Date(search); // Assuming the input is in 'yyyy-mm-dd' format

//                 // Get the first and last day of the month
//                 const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//                 const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

//                 // Filter events within the month
//                 filters.date = {
//                     $gte: startOfMonth, // Greater than or equal to the start of the month
//                     $lte: endOfMonth    // Less than or equal to the end of the month
//                 };
//             }
//             else if (filterType === 'price') {
//                 const priceRange = search.split('-');
//                 if (priceRange.length === 2) {
//                     filters.ticketPrice = {
//                         $gte: parseFloat(priceRange[0]), // Min price
//                         // $lte: parseFloat(priceRange[1])  // Max price
//                     };
//                 }
//             }
//         }

//         console.log("Applied Filters After Processing:", filters); // Log filters after applying conditions

//         // if(!filters)

//         // Fetch events based on filters
//         const events = await Event.find(filters).sort({ date: 1 }); // Sorting by date ascending

//         // Map through events to modify image paths
//         const updatedEvents = events.map(event => {
//             event.images = event.images.map(imagePath =>
//                 imagePath.replace(/^.*uploads[\\/]/, 'uploads/')
//             );
//             return event;
//         });


//         // Return the filtered events as a JSON response
//         res.json(updatedEvents);
//     } catch (error) {
//         // Return a 500 status with the error message if something goes wrong
//         console.error("Error in search:", error); // Log the error for debugging
//         res.status(500).json({ error: error.message });
//     }