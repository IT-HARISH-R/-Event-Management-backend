// const jwt = require('jsonwebtoken');
// const User = require('../models/userModels');
// const { SECRET_KEY } = require('../utlis/config');

// const authenticate = async (req, res, next) => {
//   try {
//     // Extract token from Authorization header
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ msg: 'No token, authorization denied' });
//     }

//     // Get the token part of the header
//     const token = authHeader.split(' ')[1]; // Extract the actual token
//     if (!token) {
//       return res.status(401).json({ msg: 'Invalid token format' });
//     }

//     console.log("Token from Authorization header:", token);

//     // Verify the token
//     const decoded = jwt.verify(token, SECRET_KEY);
//     console.log("Decoded Token:", decoded);

//     // Find the user by ID
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ msg: 'User not found' });
//     }

//     console.log("Authenticated User:", user);

//     // Attach the user ID to the request object
//     req.userId = decoded.id;
//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     console.error("Authentication Error:", error);
//     res.status(401).json({ msg: 'Invalid or expired token' });
//   }
// };

// module.exports =  authenticate ;
