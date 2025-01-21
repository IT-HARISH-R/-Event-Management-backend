const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',  // reference to the Event model (assumes you have an Event schema)
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // reference to the User model (assumes you have a User schema)
    required: true,
  },
  ticketType: {
    type: String,
    enum: ['General Admission', 'VIP'], // You can expand this list as needed
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
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema, 'ticket');
module.exports = Ticket;
