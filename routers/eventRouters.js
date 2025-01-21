const express = require("express");
const eventColtroller = require("../controller/eventController");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const eventRout = express.Router();

eventRout.post("/create",auth.checkAuth,upload,eventColtroller.createEvent);
eventRout.post("/filter",auth.checkAuth,eventColtroller.search);


module.exports = eventRout;