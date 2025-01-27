const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sessionTitle: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  speakers: [{ name: String, bio: String }],
  location: { type: String },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
