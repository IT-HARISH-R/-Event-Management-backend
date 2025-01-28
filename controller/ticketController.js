const Razorpay = require('razorpay');
const Ticket = require('../models/ticketModull');
const User = require("../models/userModels")
const Event = require("../models/eventModul")
const { KEY_ID, KEY_SECRET } = require('../utlis/config');
const crypto = require('crypto');
const sendEmailConfirmation = require('../middlewares/nodemailer');
const transferredsendEmail = require('../middlewares/nodemailer');

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
    const { paymentId, orderId, signature, event } = req.body;
    console.log(req.body);
    console.log("Event id: ", event);

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
      const updateuser = await User.findByIdAndUpdate(  //ticketId
        userId,
        { $push: { ticketId: ticket._id } }, // Add the user to the event's candidates array
        { new: true }
      )
      const user = await User.findById(userId);

      // Add the user to the event's list of candidates/participants
      const updatedEvent = await Event.findByIdAndUpdate(
        event,
        { $push: { candidates: user._id } }, // Add the user to the event's candidates array
        { new: true }
      );

      // Send email confirmation to the user
      sendEmailConfirmation(user, ticket);

      // Save the updated ticket
      await ticket.save();

      res.json({ message: 'Payment Successful and Ticket Booked!', event: updatedEvent });
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

exports.getTicketbyId = async (req, res) => {
  try {
    const eventid = req.params.id;
    console.log("-----------------", eventid)

    const ticket = await Ticket.findById(eventid);
    console.log("-----------------", ticket)
    console.log("-----------------", eventid)
    console.log(ticket)
    res.json(ticket)

  }
  catch (err) {
    console.log("-----------------err", req.params)
    res.status(500).json({ message: 'Error handling Get by id', err });
  }
}


// Ticket Cancellation
exports.deleteTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id; // Ticket ID from route parameters
    const userId = req.userId; // Assuming userId is available in the request object

    // Find and delete the ticket by ID
    const ticketdata = await Ticket.findById(ticketId);
    const event = await Event.findOne(ticketdata.eventId)
    console.log(event)
    const eventIndex = event.candidates.indexOf(userId);
    if (eventIndex > -1) {
      event.candidates.splice(eventIndex, 1); // Remove the ticketId from the array
      await event.save(); // Save the updated user document
    } else {
      return res.status(404).json({ message: "Ticket ID not found in user's data" });
    }
    const ticket = await Ticket.findByIdAndDelete(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Find the user and remove the first match of ticketId from the user's ticketId array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the first occurrence of ticketId
    const ticketIndex = user.ticketId.indexOf(ticketId);
    if (ticketIndex > -1) {
      user.ticketId.splice(ticketIndex, 1); // Remove the ticketId from the array
      await user.save(); // Save the updated user document
    } else {
      return res.status(404).json({ message: "Ticket ID not found in user's data" });
    }

    res.json({ message: "Ticket deleted successfully", ticket });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Error handling ticket deletion", err });
  }
};

exports.transferTicket = async (req, res) => {
  try {
    const { ticketId, newAttendeeEmail } = req.body;
    const userId = req.userId; // Old user's ID from request

    console.log("Ticket ID and New Attendee Email: ", ticketId, newAttendeeEmail);

    // Find the ticket to be transferred
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Find the old user by their userId
    const oldUser = await User.findById(userId);
    if (!oldUser) {
      return res.status(404).json({ message: "Old user not found" });
    }

    // Ensure the old user's ticketId array contains the ticket
    if (!oldUser.ticketId.includes(ticketId)) {
      return res.status(400).json({ message: "Old user does not own this ticket" });
    }

    // Find the new attendee by email
    const newAttendee = await User.findOne({ email: newAttendeeEmail });
    if (!newAttendee) {
      return res.status(404).json({ message: "New attendee not found" });
    }

    // Store the original user ID before updating
    const originalUserId = ticket.userId;

    // Update the ticket's user ID to the new attendee's ID
    ticket.userId = newAttendee._id;
    await ticket.save();

    // Update the event's candidates array
    const event = await Event.findById(ticket.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Replace the original user ID with the new user ID in the candidates array
    const candidateIndex = event.candidates.indexOf(originalUserId);
    if (candidateIndex !== -1) {
      event.candidates[candidateIndex] = newAttendee._id;
      await event.save();
    }

    // Remove the ticket from the old user's ticketId array
    oldUser.ticketId = oldUser.ticketId.filter(id => id.toString() !== ticketId.toString());
    await oldUser.save();

    // Add the ticket to the new attendee's ticketId array
    if (!newAttendee.ticketId.includes(ticketId)) {
      newAttendee.ticketId.push(ticket._id);
      await newAttendee.save();
    }



    // Optionally, notify the original and new attendee
    if (oldUser) {
      transferredsendEmail(
        oldUser,
        'Ticket Transfer',
        `Your ticket for ${event.title} has been transferred to ${newAttendee.username}.`);
    }

    transferredsendEmail(
      newAttendee,
      'Ticket Transfer',
      `You have been transferred a ticket for ${event.title}.`
    );

    res.json({
      message: "Ticket transferred successfully",
      oldUser,
      newAttendee,
    });
  } catch (error) {
    console.error('Error transferring ticket:', error);
    res.status(500).json({ message: "Error transferring ticket" });
  }
};
exports.getbyorgid = async (req, res) => {
  try {
    // Fetch events directly by organizer ID
    const newevent = await Event.find({ organizer: req.userId });

    console.log("---------", req.userId);
    console.log("---------", newevent);

    res.json(newevent);
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: "Error fetching events." });
  }
};

exports.analytics = async (req, res) => {
  async (req, res) => {
    try {
      // Fetch all ticket data
      const tickets = await Ticket.find().populate("eventId");

      // Calculate analytics
      const eventAnalytics = await Promise.all(
        tickets.reduce((acc, ticket) => {
          // Find the corresponding event
          const event = ticket.eventId;

          // Create an entry for each event
          if (!acc[event._id]) {
            acc[event._id] = {
              eventId: event._id,
              title: event.title,
              totalTicketsSold: 0,
              revenue: 0,
              paymentStatus: { Pending: 0, Completed: 0, Failed: 0 },
              ticketTypes: {},
            };
          }

          // Aggregate ticket sales data
          acc[event._id].totalTicketsSold += ticket.quantity;
          acc[event._id].revenue += ticket.totalAmount;

          // Update payment status counts
          acc[event._id].paymentStatus[ticket.paymentStatus] += 1;

          // Aggregate by ticket type
          if (!acc[event._id].ticketTypes[ticket.ticketType]) {
            acc[event._id].ticketTypes[ticket.ticketType] = 0;
          }
          acc[event._id].ticketTypes[ticket.ticketType] += ticket.quantity;

          return acc;
        }, {})
      );

      // Convert the object to an array
      const result = Object.values(eventAnalytics);

      res.json(result);
    } catch (err) {
      console.error("Error fetching ticket analytics:", err);
      res.status(500).json({ message: "Error fetching ticket analytics" });
    }
  }
}

























// Ticket Transfer
// exports.transferTicket = async (req, res) => {
//   try {
//     const { ticketId, newAttendeeEmail } = req.body;
//     console.log("------------------------------------", ticketId, newAttendeeEmail);

//     // Find the ticket to be transferred
//     const ticket = await Ticket.findById(ticketId);
//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // Find the new attendee by email
//     const newAttendee = await User.findOne({ email: newAttendeeEmail });
//     if (!newAttendee) {
//       return res.status(404).json({ message: "New attendee not found" });
//     }

//     // Store the original user ID before updating
//     const originalUserId = ticket.userId;

//     // Update the ticket's user ID to the new attendee's ID
//     console.log(newAttendee)
//     console.log("#######################")
//     console.log(newAttendee._id)
//     ticket.userId = newAttendee._id;
//     console.log(ticket)
//     console.log("#######################")
//     await ticket.save();

//     // Update the event's candidates array
//     const event = await Event.findById(ticket.eventId);
//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     // Replace the original user ID with the new user ID in the candidates array
//     const candidateIndex = event.candidates.indexOf(originalUserId);
//     console.log(originalUserId)
//     console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\")
//     console.log(candidateIndex)
//     if (candidateIndex !== -1) {
//       console.log(event.candidates[candidateIndex])
//       event.candidates[candidateIndex] = newAttendee._id;
//       console.log(event.candidates[candidateIndex])
//       await event.save();
//     }

//     // newAttendee.ticketId
//     const updateuser = await User.findByIdAndUpdate(  //ticketId
//       newAttendee._id,
//       { $push: { ticketId: ticket._id } }, // Add the user to the event's candidates array
//       { new: true }
//     )

//     // Optionally, notify the original and new attendee
//     const originalUser = await User.findById(originalUserId);
//     console.log("------------------------------------originalUser", originalUser);

//     if (originalUser) {
//       sendEmailConfirmation(
//         originalUser,
//         'Ticket Transfer',
//         `Your ticket for ${ticket.eventTitle} has been transferred.`
//       );
//     }

//     sendEmailConfirmation(
//       newAttendee,
//       'Ticket Transfer',
//       `You have been transferred a ticket for ${ticket.eventTitle}.`
//     );

//     res.json({ message: "Ticket transferred successfully", updateuser });
//   } catch (error) {
//     console.error('Error transferring ticket:', error);
//     res.status(500).json({ message: "Error transferring ticket" });
//   }
// };














