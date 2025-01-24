const Razorpay = require('razorpay');
const Ticket = require('../models/ticketModull');
const User = require("../models/userModels")
const { KEY_ID, KEY_SECRET } = require('../utlis/config');
const crypto = require('crypto');
const sendEmailConfirmation = require('../middlewares/nodemailer');

const razorpayInstance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    // Ensure user is authenticated


    const userId = req.userId;  // Assuming you are extracting user from JWT or session

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { amount, eventId, ticketType, quantity } = req.body;

    if (!amount || !eventId || !ticketType || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const totalAmount = amount * quantity;

    const options = {
      amount: totalAmount * 100, // Razorpay works in paise (1 INR = 100 paise)
      currency: 'INR',  // Ensure correct currency if needed
      receipt: `order_rcptid_${new Date().getTime()}`,
    };

    // Create Razorpay order

    const order = await razorpayInstance.orders.create(options);

    if (!order || !order.id) {
      return res.status(500).json({ message: 'Order creation failed' });
    }

    // Save ticket information
    const ticket = new Ticket({
      eventId,
      userId,  // Assuming userId is coming from authenticated session or JWT
      ticketType,
      quantity,
      totalAmount,
      paymentStatus: 'Pending',
      orderId: order.id,  // Store Razorpay order ID
    });

    await ticket.save();




    res.json({
      orderId: order.id,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order, please try again later' });
  }
};

exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }


    // Find the ticket with the provided orderId
    const ticket = await Ticket.findOne({ orderId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }


    // Verify the Razorpay payment signature
    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac('sha256', KEY_SECRET) // Use your Razorpay secret key
      .update(body.toString())
      .digest('hex');


    if (expectedSignature === signature) {
      // Payment verified successfully
      ticket.paymentStatus = 'Completed';
      ticket.paymentMethod = 'Razorpay'; // Optionally store the payment method
      const userId = req.userId;
      const user = await User.findById(userId)

      sendEmailConfirmation(user, ticket)

      await ticket.save();
      res.json({ message: 'Payment Successful and Ticket Booked!' });
    } else {
      // Payment verification failed
      ticket.paymentStatus = 'Failed';
      await ticket.save();
      res.status(400).json({ message: 'Payment Verification Failed' });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ message: 'Error handling payment, please try again later' });
  }

};
