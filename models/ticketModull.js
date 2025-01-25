// models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String, // Razorpay order ID should be a string
    required: true,
  },
  ticketType: {
    type: String,
    enum: ['General Admission', 'VIP'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'At least one ticket must be purchased'],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount must be greater than or equal to 0'],
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,  // Add payment method field
    enum: ['Credit Card', 'PayPal', 'Razorpay'],  // Example methods
  },
}, { timestamps: true });

// Indexing for fast lookups
TicketSchema.index({ eventId: 1, userId: 1 });

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;
