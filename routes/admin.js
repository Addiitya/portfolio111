const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Booking = require('../models/Booking');
const BlogPost = require('../models/BlogPost');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();


// Login page
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect('/admin');
  } catch (err) {
    res.render('admin/login', { error: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard
router.get('/', requireLogin, async (req, res) => {
  const [projectCount, contactCount, bookingCount, postCount, unreadContacts, pendingBookings] = await Promise.all([
    Project.countDocuments(),
    Contact.countDocuments(),
    Booking.countDocuments(),
    BlogPost.countDocuments(),
    Contact.countDocuments({ read: false }),
    Booking.countDocuments({ status: 'pending' })
  ]);
  res.render('admin/dashboard', {
    username: req.session.username,
    stats: { projectCount, contactCount, bookingCount, postCount, unreadContacts, pendingBookings }
  });
});

// Projects
router.get('/projects', requireLogin, async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.render('admin/projects', { username: req.session.username, projects });
});

router.post('/projects', requireLogin, async (req, res) => {
  const data = { ...req.body };
  data.featured = data.featured === 'on';
  data.published = data.published !== 'off';
  await Project.create(data);
  res.redirect('/admin/projects');
});

router.post('/projects/:id/delete', requireLogin, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.redirect('/admin/projects');
});

// Contacts
router.get('/contacts', requireLogin, async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.render('admin/contacts', { username: req.session.username, contacts });
});

router.post('/contacts/:id/read', requireLogin, async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { read: true });
  res.redirect('/admin/contacts');
});

// Bookings
router.get('/bookings', requireLogin, async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.render('admin/bookings', { username: req.session.username, bookings });
});

router.post('/bookings/:id/status', requireLogin, async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect('/admin/bookings');
});

// Blog
router.get('/blog', requireLogin, async (req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  res.render('admin/blog', { username: req.session.username, posts });
});

router.post('/blog', requireLogin, async (req, res) => {
  const data = { ...req.body };
  if (data.tags) data.tags = data.tags.split(',').map(t => t.trim());
  data.published = data.published === 'on';
  if (!data.slug && data.title) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  await BlogPost.create(data);
  res.redirect('/admin/blog');
});

router.post('/blog/:id/delete', requireLogin, async (req, res) => {
  await BlogPost.findByIdAndDelete(req.params.id);
  res.redirect('/admin/blog');
});

module.exports = router;
