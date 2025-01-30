const express = require("express");
const eventColtroller = require("../controller/eventController");
const auth = require("../middlewares/auth");


const eventRout = express.Router();

// eventRout.post("/create",auth.checkAuth,auth.handleUpload,eventColtroller.createEvent);
eventRout.post("/create",auth.checkAuth,auth.allowRoles(['organizers']),auth.handleUpload,eventColtroller.createEvent);
// eventRout.post("/create",auth.checkAuth,auth.allowRoles(['organizers']),eventColtroller.createEvent);
eventRout.get("/filter",auth.checkAuth,eventColtroller.search);
eventRout.get("/",eventColtroller.getAll);
eventRout.get("/:id",eventColtroller.getbyid);


module.exports = eventRout;