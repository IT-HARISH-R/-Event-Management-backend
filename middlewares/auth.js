const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utlis/config");
const upload = require("./upload");
const User = require("../models/userModels")
const auth = {
    checkAuth: async (req, res, next) => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            console.log("-----------------------", req.headers.authorization)
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ msg: 'No token, authorization denied' });
            }
            // Get the token part of the header
            const token = authHeader.split(' ')[2]; // Extract the actual token
            console.log("...............................", token)
            if (!token) {
                return res.status(401).json({ msg: 'Invalid token format' });
            }

            console.log("Token from Authorization header:", token);

            // Verify the token
            const decoded = jwt.verify(token, SECRET_KEY);
            console.log("Decoded Token:", decoded);

            // Find the user by ID
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ msg: 'User not found' });
            }

            console.log("Authenticated User:", user);

            // Attach the user ID to the request object
            req.userId = decoded.id;
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error("Authentication Error:", error);
            res.status(401).json({ msg: 'Invalid or expired token' });
        }
    },
    handleUpload: (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: 'Upload failed: ' + err.message });
            }
            next(); // Proceed to the next middleware after upload
        });
    },
    allowRoles: (roles) => {
        return async (req, res, next) => {
            // get the userId from the request object
            const userId = req.userId;
            const user = await User.findById(userId);

            // check if the user exists
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // check if the user role is allowed
            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // proceed to the next middleware
            next();
        }
    }
};

module.exports = auth;
