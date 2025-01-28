const express = require('express');
const { getEventAnalytics } = require('../controller/analyticsController');
const auth = require('../middlewares/auth');
const analyticsRoutes = express.Router();

// Route to fetch event analytics
analyticsRoutes.get('/ticket/analytics/:eventId', auth.checkAuth, auth.allowRoles(['organizers', 'admin']), getEventAnalytics);

module.exports = analyticsRoutes;
