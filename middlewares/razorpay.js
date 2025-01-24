const Razorpay = require('razorpay');
const Order = require('../models/TicketPurchase');
const Event = require('../models/Event');

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key ID
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET' // Replace with your Razorpay key secret
});

// Create an order
const createOrder = async (req, res) => {
  const { eventId, ticketType, quantity } = req.body;
  try {
    const event = await Event.findById(eventId);
    const ticket = event.ticketTypes.find(t => t.type === ticketType);
    if (!ticket) {
      return res.status(400).json({ error: 'Invalid ticket type' });
    }

    const totalAmount = ticket.price * quantity * 100; // Razorpay accepts amount in paise (1 INR = 100 paise)

    // Create a Razorpay order
    const options = {
      amount: totalAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    razorpay.orders.create(options, async (err, order) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      // Save the order in the database
      const newOrder = new Order({
        event: eventId,
        ticketType,
        quantity,
        totalAmount: totalAmount / 100, // Convert back to INR
        paymentStatus: 'pending'
      });

      await newOrder.save();
      res.json({ order, orderId: newOrder._id });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle payment success callback
const handlePaymentSuccess = async (req, res) => {
  const { paymentId, orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order || order.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Invalid order or already processed' });
    }

    // Verify the payment signature (Razorpay security)
    const isSignatureValid = razorpay.utils.verifyPaymentSignature({
      payment_id: paymentId,
      order_id: orderId,
      signature: req.headers['x-razorpay-signature']
    });

    if (!isSignatureValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Mark the order as completed
    order.paymentStatus = 'completed';
    await order.save();

    // Send confirmation email
    // You can use a package like `nodemailer` for sending emails

    res.json({ message: 'Payment successful', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, handlePaymentSuccess };
