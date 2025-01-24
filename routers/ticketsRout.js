const express = require('express');
const { createOrder, handlePaymentSuccess } = require('../controller/ticketController');  // Import controller methods
const auth = require('../middlewares/auth');
const ticketRoutes = express.Router();

// Route to create a Razorpay order
ticketRoutes.post('/create', auth.checkAuth, createOrder);  // Ensure the correct middleware and controller method are called

// Route to handle payment success from Razorpay
ticketRoutes.post('/handlePaymentSuccess', auth.checkAuth,handlePaymentSuccess);  // Controller method for handling payment success

module.exports = ticketRoutes;
