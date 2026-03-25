const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  eventType: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, default: '' },
  budget: { type: String, default: '' },
  details: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
