const express = require("express");
const eventColtroller = require("../controller/eventController");
const auth = require("../middlewares/auth");

const eventRout = express.Router();

eventRout.post("/",auth.checkAuth,eventColtroller.createEvent);
eventRout.post("/filter",auth.checkAuth,eventColtroller.search);


module.exports = eventRout;