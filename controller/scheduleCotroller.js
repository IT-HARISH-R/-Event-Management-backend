const transferredsendEmail = require("../middlewares/nodemailer")
const Schedule = require("../models/Schedule")
const Event = require("../models/eventModul")
const User = require("../models/userModels")

const scheduleCotroller = {

    getallschedule: async (req, res) => {
        try {
            console.log("----------------------------------1")
            console.log("----------------------------------1")
            const schedule = await Schedule.find();
            console.log("----------------------------------2")
            res.status(200).json(schedule);
        } catch (err) {
            console.log("----------------------------------end")
            console.log("----------------------------------end", err)
            res.status(500).json({ error: err.message });
        }
    },
    createschedule: async (req, res) => {
        const { eventId, sessionTitle, description, startTime, speakers, endTime, location } = req.body;
        try {
            console.log("----------------------------------1")
            const schedule = await Schedule.create({ eventId, sessionTitle, description, speakers, startTime, endTime, location });
            console.log("----------------------------------2")
            res.status(201).json(schedule);
        } catch (err) {
            console.log("----------------------------------end")
            console.log("----------------------------------end", err)
            res.status(500).json({ error: err.message });
        }
    },
    notifyschedule: async (req, res) => {
        const { eventId, startTime, endTime } = req.body
        try {
            const start = new Date(startTime).toDateString()
            const end = new Date(endTime).toDateString()

            const event = await Event.findById(eventId);
            console.log(event.candidates)

            event.candidates.map(async (data) => {
                console.log("------------------:", data)
                const user = await User.findById(data)
                console.log(user)
                console.log(user.email,'Event Schedule Update',`AT ${start} TO ${end}`)

                transferredsendEmail(user,'Event Schedule Update',`Schedule Update AT ${start} TO ${end}`)

            });

          

            console.log(start)
            console.log(end)
            res.status(200).json({ message: 'Notifications sent successfully.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getbyidschedyles: async (req, res) => {
        try {
            console.log("----------------------------------1")
            console.log("----------------------------------1", req.params.eventId)
            const schedule = await Schedule.find({ eventId: req.params.eventId });
            console.log("----------------------------------2")
            res.status(200).json(schedule);
        } catch (err) {
            console.log("----------------------------------end")
            console.log("----------------------------------end", err)
            res.status(500).json({ error: err.message });
        }
    }

}

module.exports = scheduleCotroller;