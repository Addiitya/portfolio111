const express = require('express');
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'adityakolhe168@gmail.com',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Send booking email notification
async function sendBookingEmail(booking) {
  try {
    const dateStr = new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    await transporter.sendMail({
      from: `"_eyeadi Visuals" <${process.env.EMAIL_USER || 'adityakolhe168@gmail.com'}>`,
      to: 'adityakolhe168@gmail.com',
      subject: `📅 New Booking Request: ${booking.eventType} by ${booking.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #f5f5f5; padding: 2rem; border-radius: 12px;">
          <h1 style="color: #e60000; font-size: 1.5rem; margin-bottom: 1.5rem;">🎬 New Booking Request</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 0.5rem 0; color: #888;">Client</td><td style="padding: 0.5rem 0; color: white; font-weight: bold;">${booking.name}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #888;">Email</td><td style="padding: 0.5rem 0;"><a href="mailto:${booking.email}" style="color: #e60000;">${booking.email}</a></td></tr>
            ${booking.phone ? `<tr><td style="padding: 0.5rem 0; color: #888;">Phone</td><td style="padding: 0.5rem 0; color: white;">${booking.phone}</td></tr>` : ''}
            <tr><td style="padding: 0.5rem 0; color: #888;">Event Type</td><td style="padding: 0.5rem 0; color: white; font-weight: bold;">${booking.eventType}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #888;">Date</td><td style="padding: 0.5rem 0; color: #e60000; font-weight: bold;">${dateStr}</td></tr>
            ${booking.location ? `<tr><td style="padding: 0.5rem 0; color: #888;">Location</td><td style="padding: 0.5rem 0; color: white;">${booking.location}</td></tr>` : ''}
            ${booking.budget ? `<tr><td style="padding: 0.5rem 0; color: #888;">Budget</td><td style="padding: 0.5rem 0; color: white;">${booking.budget}</td></tr>` : ''}
          </table>
          ${booking.details ? `
          <div style="margin-top: 1.5rem; padding: 1rem; background: #111; border-radius: 8px; border-left: 3px solid #e60000;">
            <p style="color: #888; margin: 0 0 0.5rem;">Project Details</p>
            <p style="color: #e0e0e0; margin: 0; line-height: 1.6;">${booking.details}</p>
          </div>` : ''}
          <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #555;">— _eyeadi Visuals Admin</p>
        </div>
      `
    });
    console.log(`📧 Booking email sent to adityakolhe168@gmail.com`);
  } catch (err) {
    console.log(`⚠️  Booking email failed: ${err.message}`);
  }
}

// POST /api/bookings — public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, eventType, date, location, budget, details } = req.body;
    if (!name || !email || !eventType || !date) {
      return res.status(400).json({ error: 'Name, email, event type, and date are required.' });
    }
    const booking = await Booking.create({ name, email, phone, eventType, date, location, budget, details });
    console.log(`📅 New booking from ${name} for ${eventType} on ${date}`);
    
    // Send email notification (non-blocking)
    sendBookingEmail({ name, email, phone, eventType, date, location, budget, details });
    
    res.status(201).json({ message: 'Booking request received! We\'ll confirm shortly.', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/bookings — admin
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/bookings/:id/status — admin
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
