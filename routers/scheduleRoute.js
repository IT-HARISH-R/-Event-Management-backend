const express = require("express")
const ScheduleRoute  = express.Router()
const scheduleCotroller = require("../controller/scheduleCotroller");
const auth = require("../middlewares/auth");

// Fetch event schedule
ScheduleRoute .get('/schedule/get/:eventId', auth.checkAuth, scheduleCotroller.getbyidschedyles);
ScheduleRoute .get('/schedule', auth.checkAuth, scheduleCotroller.getallschedule);

// Add or update a session
ScheduleRoute .post('/schedule', auth.checkAuth, auth.allowRoles(['organizers']), auth.checkAuth, scheduleCotroller.createschedule);

// Notify attendees (integration with email service)
ScheduleRoute .post('/notify', auth.checkAuth, auth.allowRoles(['organizers']), auth.checkAuth, scheduleCotroller.notifyschedule);

module.exports = ScheduleRoute 
  