const express = require("express");
const eventColtroller = require("../controller/eventController");
const auth = require("../middlewares/auth");


const eventRout = express.Router();

// eventRout.post("/create",auth.checkAuth,auth.handleUpload,eventColtroller.createEvent);
eventRout.post("/create",auth.handleUpload,eventColtroller.createEvent);
eventRout.post("/filter",auth.checkAuth,eventColtroller.search);


module.exports = eventRout;