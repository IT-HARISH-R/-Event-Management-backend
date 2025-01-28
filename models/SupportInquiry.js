const mongoose = require('mongoose');

const supportInquirySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  inquiry: { type: String, required: true },
  status: { type: String, enum: ['Pending' , 'Resolved' ], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SupportInquiry', supportInquirySchema);
