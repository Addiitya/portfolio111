const express = require('express');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'adityakolhe168@gmail.com',
    pass: process.env.EMAIL_PASS || ''  // App Password needed
  }
});

// Send email notification to admin
async function sendNotificationEmail(contact) {
  try {
    await transporter.sendMail({
      from: `"_eyeadi Visuals" <${process.env.EMAIL_USER || 'adityakolhe168@gmail.com'}>`,
      to: 'adityakolhe168@gmail.com',
      subject: `🎬 New Inquiry from ${contact.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #f5f5f5; padding: 2rem; border-radius: 12px;">
          <h1 style="color: #e60000; font-size: 1.5rem; margin-bottom: 1.5rem;">New Contact Form Submission</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 0.5rem 0; color: #888;">Name</td><td style="padding: 0.5rem 0; color: white; font-weight: bold;">${contact.name}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #888;">Email</td><td style="padding: 0.5rem 0;"><a href="mailto:${contact.email}" style="color: #e60000;">${contact.email}</a></td></tr>
            ${contact.phone ? `<tr><td style="padding: 0.5rem 0; color: #888;">Phone</td><td style="padding: 0.5rem 0; color: white;">${contact.phone}</td></tr>` : ''}
          </table>
          <div style="margin-top: 1.5rem; padding: 1rem; background: #111; border-radius: 8px; border-left: 3px solid #e60000;">
            <p style="color: #888; margin: 0 0 0.5rem;">Message</p>
            <p style="color: #e0e0e0; margin: 0; line-height: 1.6;">${contact.message}</p>
          </div>
          <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #555;">— _eyeadi Visuals Admin</p>
        </div>
      `
    });
    console.log(`📧 Email notification sent to adityakolhe168@gmail.com`);
  } catch (err) {
    console.log(`⚠️  Email notification failed: ${err.message}`);
    console.log('💡 To enable email, set EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env');
  }
}

// POST /api/contacts — public
router.post('/', async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    const contact = await Contact.create({ name, email, phone, message });
    console.log(`📧 New contact from ${name} (${email}): ${message}`);
    
    // Send email notification (await for Vercel Serverless persistence)
    await sendNotificationEmail({ name, email, phone, message });
    
    res.status(201).json({ message: 'Thank you! We\'ll get back to you soon.', contact });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/contacts — admin
router.get('/', verifyToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/contacts/:id/read — admin
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
