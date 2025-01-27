const express = require("express")
const scheduleRout = express.Router()
const Schedule = require("../models/Schedule")

// Fetch event schedule
scheduleRout.get('/schedule/get/:eventId', async (req, res) => {
    try {
        console.log("----------------------------------1")
        console.log("----------------------------------1", req.params.eventId)
        const schedule = await Schedule.find({ eventId: req.params.eventId });
        console.log("----------------------------------2")
        res.status(200).json(schedule);
    } catch (err) {
        console.log("----------------------------------end")
        console.log("----------------------------------end", err)
        res.status(500).json({ error: err.message });
    }
});
scheduleRout.get('/schedule', async (req, res) => {
    try {
        console.log("----------------------------------1")
        console.log("----------------------------------1")
        const schedule = await Schedule.find();
        console.log("----------------------------------2")
        res.status(200).json(schedule);
    } catch (err) {
        console.log("----------------------------------end")
        console.log("----------------------------------end", err)
        res.status(500).json({ error: err.message });
    }
});

// Add or update a session
scheduleRout.post('/schedule', async (req, res) => {
    const { eventId, sessionTitle, description, startTime, speakers, endTime, location } = req.body;
    try {
        console.log("----------------------------------1")
        const schedule = await Schedule.create({ eventId, sessionTitle, description, speakers, startTime, endTime, location });
        console.log("----------------------------------2")
        res.status(201).json(schedule);
    } catch (err) {
        console.log("----------------------------------end")
        console.log("----------------------------------end", err)
        res.status(500).json({ error: err.message });
    }
});

// Notify attendees (integration with email service)
scheduleRout.post('/notify', async (req, res) => {
    const { attendees, message } = req.body;
    try {
        // Use an email service like SendGrid or NodeMailer
        // Example: Send emails to attendees
        attendees.forEach((attendee) => {
            sendEmail(attendee.email, 'Event Schedule Update', message);
        });
        res.status(200).json({ message: 'Notifications sent successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = scheduleRout
