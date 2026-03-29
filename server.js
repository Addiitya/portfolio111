require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Use process.cwd() to resolve root dir reliably inside Vercel Lambda
const rootDir = process.cwd();

// Ensure uploads directory exists (wrap in try-catch for Vercel's read-only file system)
const uploadsDir = path.join(rootDir, 'uploads');
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
app.set('views', path.join(rootDir, 'views'));

// Static files
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// Fallback exact routes for Vercel Serverless Function to serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

app.get('/category.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'category.html'));
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/blog', require('./routes/blog'));

// Admin Routes
app.use('/admin', require('./routes/admin'));

// Debug endpoint for diagnosing Vercel MONGODB connection
app.get('/api/debug', async (req, res) => {
  const uri = process.env.MONGODB_URI || "MISSING";
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  
  let connectionError = null;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    }
  } catch(e) {
    connectionError = e.message;
  }
  
  res.json({
    uriConfigured: uri !== "MISSING",
    maskedUri,
    connectionState: mongoose.connection.readyState,
    connectionError
  });
});

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
