const Event = require("../models/eventModul")
const cloudinary = require("../utlis/cloudinary")
const eventColtroller = {
    createEvent: async (req, res) => {
        try {
            // Log uploaded files and request body for debugging
            console.log("Request Files:", req.files);
            console.log("Request Body:", req.body);
            console.log("-----------------------------------------1");
    
            const { title, description, date, time, location, ticketTypes, category } = req.body;
            console.log(ticketTypes);
            console.log("-----------------------------------------2");
    
            // Organizer ID (from middleware/user session)
            const userId = req.userId;
    
            // File handling for images and videos
            const images = req.files?.images ? req.files.images : [];
            const videos = req.files?.videos ? req.files.videos.map(file => file.path) : []; // Path of the video files
            console.log("-----------------------------------------3");
    
            // Upload images to Cloudinary
            const imageUploads = await Promise.all(images.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "uploads",
                }).catch((error) => {
                    console.log(error);
                    throw new Error('Cloudinary upload failed');
                });
                return {
                    public_id: result?.public_id,
                    url: result?.secure_url,
                };
            }));
    
            // Handle videos (for example, uploading them to Cloudinary or storing the file paths)
            const videoUploads = await Promise.all(videos.map(async (video) => {
                // You can upload videos to Cloudinary (if needed) or simply save the path
                const result = await cloudinary.uploader.upload(video, {
                    folder: "uploads/videos",
                    resource_type: "video", // This tells Cloudinary it's a video
                }).catch((error) => {
                    console.log(error);
                    throw new Error('Cloudinary video upload failed');
                });
                return {
                    public_id: result?.public_id,
                    url: result?.secure_url, // Store the URL of the video
                };
            }));
    
            // Parse ticketTypes (if sent as a stringified JSON array)
            const parsedTicketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
            console.log("-----------------------------------------parsedTicketTypes", parsedTicketTypes);
            console.log("-----------------------------------------5");
    
            // Validate required fields
            if (!title || !description || !date || !time || !location || !parsedTicketTypes || !category) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            console.log("----------------------------------------6");
    
            // Validate ticketTypes array
            if (!Array.isArray(parsedTicketTypes) || parsedTicketTypes.length === 0) {
                return res.status(400).json({ message: 'At least one ticket type is required' });
            }
            console.log("----------------------------------------7-");
            console.log("----------------------------------------7-", imageUploads);
    
            // Create a new event
            const newEvent = new Event({
                title,
                description,
                date,
                time,
                location,
                ticketTypes: parsedTicketTypes, // Store parsed ticket types
                category,
                images: imageUploads,  // Store all image URLs
                videos: videoUploads,  // Store all video URLs
                organizer: userId, // Link to the organizer
                approvalStatus: 'Pending',
            });
            console.log("-----------------------------------------newevent ", newEvent);
            console.log("-----------------------------------------8");
    
            // Save the event to the database
            const savedEvent = await newEvent.save();
            console.log("-----------------------------------------9");
    
            res.status(200).json({ message: 'Event created successfully', event: savedEvent, newEvent });
        } catch (error) {
            // Handle errors gracefully
            console.error("Error creating event:", error);
            console.log("-----------------------------------------end");
    
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
   
    // createEvent: async (req, res) => {
    //     try {
    //         // Log uploaded files and request body for debugging
    //         console.log("Request Files:", req.files);
    //         console.log("Request Body:", req.body);
    //         console.log("-----------------------------------------1")
    
    //         const {
    //             title,
    //             description,
    //             date,
    //             time,
    //             location,
    //             ticketTypes, // This should be passed as an array of objects
    //             category,
    //         } = req.body;
    //          console.log(ticketTypes)
    //        console.log("-----------------------------------------2")

           
    //        // Organizer ID (from middleware/user session)
    //        const userId = req.userId;
           
    //        // File handling for images and videos
    //        const images = req.files?.images ? req.files.images.map(file => file.path) : [];
    //        const videos = req.files?.videos ? req.files.videos.map(file => file.path) : [];
    //        console.log("-----------------------------------------3")
           
    //        const result = await cloudinary.uploader.upload(images ,{
    //         folder: "uploades",
           
    //        })
    //         // Parse ticketTypes (if sent as a stringified JSON array)
    //         const parsedTicketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
    //         console.log("-----------------------------------------parsedTicketTypes",parsedTicketTypes)
    //         console.log("-----------------------------------------5")
    
    //         // Validate required fields
    //         if (!title || !description || !date || !time || !location || !parsedTicketTypes || !category) {
    //             return res.status(400).json({ message: 'All fields are required' });
    //         }
    //         console.log("----------------------------------------6")
    
    //         // Validate ticketTypes array
    //         if (!Array.isArray(parsedTicketTypes) || parsedTicketTypes.length === 0) {
    //             return res.status(400).json({ message: 'At least one ticket type is required' });
    //         }
    //         console.log("----------------------------------------7-")

    //         // Create a new event
    //         const newEvent = new Event({
    //             title,
    //             description,
    //             date,
    //             time,
    //             location,
    //             ticketTypes: parsedTicketTypes, // Store parsed ticket types
    //             category,
    //             images: {
    //                 public_id: result.public_id,
    //                 url: result.secure_url
    //             },
    //             videos,
    //             organizer: userId, // Link to the organizer
    //             approvalStatus:'Pending'
    //         });
    //         console.log("-----------------------------------------newevent ",newEvent)
    //         console.log("-----------------------------------------8")
    
    //         // Save the event to the database
    //         const savedEvent = await newEvent.save();
    //         console.log("-----------------------------------------9")
    
    //         res.status(200).json({ message: 'Event created successfully', event: savedEvent });
    //     } catch (error) {
    //         // Handle errors gracefully
    //         console.error("Error creating event:", error);
    //         console.log("-----------------------------------------end")

    //         res.status(500).json({ message: 'Server error', error: error.message });
    //     }
    // },    

    search: async (req, res) => {
        try {
            const { search, filterType } = req.query; // Extract query parameters
            console.log("Search Params:", req.query); // Debugging
    
            // Fetch all events from the database and sort by date
            let events = await Event.find().sort({ date: 1 });
            console.log("Total Events Fetched:", events.length); // Debugging
    
            // Apply filtering based on filterType
            if (search) {
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
                            return new Date(event.date).getTime() >= startOfMonth.getTime() && new Date(event.date).getTime() <= endOfMonth.getTime(); // Date filter
                        }
                        case 'price': {
                            const [minPrice, maxPrice] = search.split('-').map(Number);
                            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                                return event.ticketTypes.some(ticket => ticket.price >= minPrice && ticket.price <= maxPrice); // Price filter
                            }
                            return false;
                        }
                        default:
                            return false;
                    }
                });
            }
    
            console.log("Filtered Events Count:", events.length); // Debugging
            console.log("Filtered Events:", events); // Log the filtered events
    
            res.json(events); // Send the filtered events as response
        } catch (error) {
            console.error("Error in search:", error); // Log the error for debugging
            res.status(500).json({ error: error.message }); // Return error message
        }
    },
    getAll: async (req, res) => {
        try {
            const events = await Event.find();
            
                res.json(events);
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

            // // Update image paths
            // event.images = event.images.map(imagePath =>
            //     imagePath.replace(/^.*uploads[\\/]/, 'uploads/')
            // );

            // // Update video paths (assuming videos field exists)
            // event.videos = event.videos.map(videoPath =>
            //     videoPath.replace(/^.*uploads[\\/]/, 'uploads/')
            // );

            console.log(event);
            res.json(event);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


}


module.exports = eventColtroller
