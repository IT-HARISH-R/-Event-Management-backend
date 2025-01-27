const express = require('express');
const { getEventAnalytics } = require('../controller/analyticsController');
const analyticsRoutes = express.Router();

// Route to fetch event analytics
analyticsRoutes.get('/ticket/analytics/:eventId', getEventAnalytics);

module.exports = analyticsRoutes;
