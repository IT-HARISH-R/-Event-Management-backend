const transferredsendEmail = require('../middlewares/nodemailer');
const Event = require('../models/eventModul');
const SupportInquiry = require('../models/SupportInquiry'); // Import the SupportInquiry model
const User = require("../models/userModels")
const bcrypt = require("bcrypt");

// Get all events (pending, approved, or rejected)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find(); // Filter by `approvalStatus` if needed
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject an event listing
exports.updateEventStatus = async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body; // "Approved" or "Rejected"

  try {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { approvalStatus: status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: `Event ${status} successfully`, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event performance report
exports.getEventReport = async (req, res) => {
  try {
    const report = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          totalRevenue: { $sum: '$ticketTypes.price' },
          totalTicketsSold: { $sum: '$ticketTypes.quantity' },
        },
      },
    ]);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle user support inquiries (example stub)
exports.handleSupportInquiry = async (req, res) => {

  const userId = req.userId;

  const { subject, inquiry } = req.body;

  try {
    // Validate input
    if (!userId || !subject || !inquiry) {
      return res.status(400).json({ message: 'User ID, subject, and inquiry are required.' });
    }

    // Create and save the inquiry in the database
    const newInquiry = new SupportInquiry({
      userId,
      subject,
      inquiry,
      status: 'Pending',
      createdAt: new Date(),
    });

    await newInquiry.save();

    res.status(201).json({
      message: 'Support inquiry received and logged. Our team will get back to you shortly.',
      inquiry: newInquiry,
    });
  } catch (error) {
    console.error('Error handling support inquiry:', error);
    res.status(500).json({ message: 'An error occurred while processing the inquiry.', error: error.message });
  }
};
exports.getallInquiry = async (req, res) => {

  try {
    const inquiry = await SupportInquiry.find()

    res.json(inquiry);

  } catch (error) {
    console.error('Error handling support inquiry:', error);
    res.status(500).json({ message: 'An error occurred while processing the inquiry.', error: error.message });
  }
}
exports.rendReply = async (req, res) => {

  try {
    const { inquiryId, reply } = req.body

    const inquiry = await SupportInquiry.findById(inquiryId)
    const userid = inquiry.userId
    const user = await User.findById(userid)

    transferredsendEmail(user, `Response to Your Inquiry: ${inquiry.subject}`, `Hello ${user.username},\n\nThank you for reaching out to us. Here is our response to your inquiry:\n\n${reply}\n\nBest regards,\nSupport Team`)

    console.log(req.body)
    console.log(inquiryId, reply)
    console.log(user)
    // res.json(inquiry);
    inquiry.reply = reply;
    inquiry.status = 'Resolved';
    await inquiry.save();

    res.json({ message: 'Reply sent successfully and inquiry updated.' });


  } catch (error) {
    console.error('Error handling support inquiry:', error);
    res.status(500).json({ message: 'An error occurred while processing the inquiry.', error: error.message });
  }
}
exports.createOrganizer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email })

    if (user) {
      return response.json({ message: "This email is already registered" })
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const passwordhash = await bcrypt.hash(password, 10)
    console.log("Creating organizer:", { name, email, password });

    const newUser = await User.create({
      username: name,
      email,
      password: passwordhash,
      role: "organizers", // Keep role consistent 
    });

    console.log("New Organizer Created:", newUser);

    transferredsendEmail(newUser, 'Organizer Account Created', `Hello ${newUser.username},\n\nYour organizer account has been successfully created.\n\nEmail: ${newUser.email}\nPassword: (Set by admin or reset it from the login page)\n\nLogin here: https://guvi-event-management-project.netlify.app/login \n\nBest Regards,\nEvent Management Team`);
    res.json({
      status: true,
      message: "Organizer created successfully.",
      organizer: newUser,
    });

  } catch (error) {
    console.error("Error creating organizer:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while creating the organizer.",
      error: error.message,
    });
  }
};
exports.getalluser = async (req, res) => {
  try {
      const user = await User.find()

      const filteredUsers = user.filter(data => data.role !== 'admin');

    res.json(filteredUsers);

  } catch (error) {
    console.error("Error creating organizer:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while creating the organizer.",
      error: error.message,
    });
  }
}; 

