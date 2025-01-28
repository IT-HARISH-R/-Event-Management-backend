const express = require("express")
const scheduleRout = express.Router()
const scheduleCotroller = require("../controller/scheduleCotroller");
const auth = require("../middlewares/auth");

// Fetch event schedule
scheduleRout.get('/schedule/get/:eventId', auth.checkAuth, scheduleCotroller.getbyidschedyles);
scheduleRout.get('/schedule', auth.checkAuth, scheduleCotroller.getallschedule);

// Add or update a session
scheduleRout.post('/schedule', auth.allowRoles(['organizers']), auth.checkAuth, scheduleCotroller.createschedule);

// Notify attendees (integration with email service)
scheduleRout.post('/notify', auth.allowRoles(['organizers']), auth.checkAuth, scheduleCotroller.notifyschedule);

module.exports = scheduleRout
