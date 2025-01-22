const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory existence
const ensureDirectoryExistence = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
};

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath;

        if (file.mimetype.startsWith('image')) {
            uploadPath = path.resolve(__dirname, '../uploads/images');
        } else if (file.mimetype.startsWith('video')) {
            uploadPath = path.resolve(__dirname, '../uploads/videos');
        } else {
            return cb(new Error('Invalid file type'), false);
        }

        // Ensure the upload path exists
        ensureDirectoryExistence(uploadPath);

        cb(null, uploadPath);
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
