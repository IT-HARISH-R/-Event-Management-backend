const express = require('express');
const { getAllEvents, updateEventStatus, getEventReport, handleSupportInquiry, getallInquiry, rendReply, createOrganizer, getalluser } = require('../controller/adminController');
const auth = require('../middlewares/auth');
const adminRoutes = express.Router();

// Admin routes
adminRoutes.get('/events', getAllEvents);
adminRoutes.put('/events/:eventId/status', updateEventStatus);
adminRoutes.get('/reports', getEventReport);
adminRoutes.post('/support', auth.checkAuth, handleSupportInquiry);
adminRoutes.post('/support/get', auth.checkAuth, auth.allowRoles(['admin']), getallInquiry);
adminRoutes.post('/support/reply', auth.checkAuth, auth.allowRoles(['admin']), rendReply);
adminRoutes.post('/create-organizer', auth.checkAuth, auth.allowRoles(['admin']),createOrganizer );
adminRoutes.get('/getalluser', auth.checkAuth, auth.allowRoles(['admin']),getalluser );

module.exports = adminRoutes;
