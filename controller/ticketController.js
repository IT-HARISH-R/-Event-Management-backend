const Razorpay = require('razorpay');
const crypto = require('crypto'); // Used for signature verification
const Ticket = require('../models/ticket'); // Assuming you have your ticket model set up

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: 'your_razorpay_key_id', // Replace with your Razorpay Key ID
    key_secret: 'your_razorpay_key_secret' // Replace with your Razorpay Key Secret
});

const ticketController = {

    // Function to create a ticket and process payment
    createTicketAndProcessPayment: async (req, res) => {
        const { eventId, userId, ticketType, quantity, paymentOrderId, paymentSignature, paymentId } = req.body;

        try {
            // Step 1: Calculate total amount
            let ticketPrice = 50; // Hardcoded ticket price for simplicity, you can fetch from database
            if (ticketType === 'VIP') {
                ticketPrice = 100; // VIP ticket price
            }
            const totalAmount = ticketPrice * quantity;

            // Step 2: Verify Razorpay payment signature
            const generatedSignature = crypto.createHmac('sha256', razorpay.key_secret)
                .update(`${paymentOrderId}|${paymentId}`)
                .digest('hex');

            if (generatedSignature !== paymentSignature) {
                return res.status(400).json({ message: 'Invalid payment signature' });
            }

            // Step 3: Create the ticket record in MongoDB
            const newTicket = new Ticket({
                eventId,
                userId,
                ticketType,
                quantity,
                totalAmount,
                paymentStatus: 'Pending',
            });

            const savedTicket = await newTicket.save();

            // Step 4: Update payment status
            savedTicket.paymentStatus = 'Completed';
            await savedTicket.save();

            // Optionally, send a confirmation email to the user
            // sendConfirmationEmail(userId, savedTicket);

            res.status(200).json({ message: 'Payment successful, ticket created', ticket: savedTicket });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = ticketController;


// npm install razorpay crypto  // npm 
