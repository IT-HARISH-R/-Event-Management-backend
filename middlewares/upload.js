const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify where to save uploaded files (e.g., "uploads/images" and "uploads/videos")
        if (file.mimetype.startsWith('image')) {
            cb(null, '../uploads/images');
        } else if (file.mimetype.startsWith('video')) {
            cb(null, '../uploads/videos');
        } else {
            cb(new Error('Invalid file type'), false);
        }
        console.log("------------end")
    },
    filename: (req, file, cb) => {
        // Save file with a unique name
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with storage configuration and file size limit (10MB)
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).fields([
    { name: 'images', maxCount: 5 },  // Allow up to 5 images
    { name: 'videos', maxCount: 2 }   // Allow up to 2 videos
]);

module.exports = upload;
