const express = require("express")
const scheduleRoute  = express.Router()
const scheduleCotroller = require("../controller/scheduleCotroller");
const auth = require("../middlewares/auth");

// Fetch event schedule
scheduleRoute .get('/schedule/get/:eventId', auth.checkAuth, scheduleCotroller.getbyidschedyles);
scheduleRoute .get('/schedule', auth.checkAuth, scheduleCotroller.getallschedule);

// Add or update a session
scheduleRoute .post('/schedule', auth.checkAuth, auth.allowRoles(['organizers']), auth.checkAuth, scheduleCotroller.createschedule);

// Notify attendees (integration with email service)
scheduleRoute .post('/notify', auth.checkAuth, auth.allowRoles(['organizers']), auth.checkAuth, scheduleCotroller.notifyschedule);

module.exports = scheduleRoute 
