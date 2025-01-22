const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utlis/config");
const upload = require("./upload");

const auth = {
    checkAuth: (request, response, next) => {
        const token = request.cookies?.token; // Ensure cookies exist
        if (!token) {
            return response.status(401).json({ message: 'Unauthorized: Token missing' });
        }
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            request.user = decoded; // Attach decoded token to request
        } catch (err) {
            return response.status(500).json({ message: 'Invalid token: ' + err.message });
        }
        next();
    },
    handleUpload: (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: 'Upload failed: ' + err.message });
            }
            next(); // Proceed to the next middleware after upload
        });
    },
};

module.exports = auth;
