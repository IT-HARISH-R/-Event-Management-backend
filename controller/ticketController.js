const Razorpay = require('razorpay');
const Ticket = require('../models/ticketModull');  // Fixed model name typo
const { KEY_ID, KEY_SECRET } = require('../utlis/config');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    // Ensure user is authenticated
    console.log("startttttttttttttttttttttttttttttttttttt")
    console.log("startttttttttttttttttttttttttttttttttttt", req.userId)

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
    console.log("startttttttttttttttttttttttttttttttttttt", amount, eventId, ticketType, quantity)

    // Create Razorpay order

    const order = await razorpayInstance.orders.create(options);
    console.log("startttttttttttttttttttttttttttttttttttt")

    if (!order || !order.id) {
      return res.status(500).json({ message: 'Order creation failed' });
    }
    console.log("endtttttttttttttttttttttttttttttttttttt", order.id)

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

    console.log("----------------------------1");

    // Find the ticket with the provided orderId
    const ticket = await Ticket.findOne({ orderId });

    if (!ticket) {
      console.log("----------------------------2");
      return res.status(404).json({ message: 'Ticket not found' });
    }

    console.log("----------------------------3");

    // Verify the Razorpay payment signature
    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac('sha256',KEY_SECRET) // Use your Razorpay secret key
      .update(body.toString())
      .digest('hex');

    console.log("----------------------------4");

    if (expectedSignature === signature) {
      // Payment verified successfully
      ticket.paymentStatus = 'Completed';
      ticket.paymentMethod = 'Razorpay'; // Optionally store the payment method
      console.log("----------------------------5");
      await ticket.save();
      res.json({ message: 'Payment Successful and Ticket Booked!' });
    } else {
      // Payment verification failed
      ticket.paymentStatus = 'Failed';
      await ticket.save();
      res.status(400).json({ message: 'Payment Verification Failed' });
    }
  } catch (error) {
    console.log("----------------------------6");
    console.error('Error handling payment success:', error);
    res.status(500).json({ message: 'Error handling payment, please try again later' });
  }

};
