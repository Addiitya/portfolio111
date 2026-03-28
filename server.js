require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists (wrap in try-catch for Vercel's read-only file system)
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
} catch (err) {
  // Ignored on Serverless platforms
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/blog', require('./routes/blog'));

// Admin Routes
app.use('/admin', require('./routes/admin'));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`\n🎬 _eyeadi Visuals server running at http://localhost:${PORT}`);
        console.log(`📊 Admin panel at http://localhost:${PORT}/admin`);
        console.log(`🔌 API at http://localhost:${PORT}/api\n`);
      });
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 Make sure MongoDB is running: brew services start mongodb-community');
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Export the Express API to work natively with Vercel's Serverless Functions
module.exports = app;
