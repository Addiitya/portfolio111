const express = require('express');
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Multer config for file uploads (thumbnails + videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max for videos
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files for thumbnails'), false);
    } else if (file.fieldname === 'videoFile') {
      if (file.mimetype.startsWith('video/')) cb(null, true);
      else cb(new Error('Only video files'), false);
    } else {
      cb(null, true);
    }
  }
});
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]);

// GET /api/projects — public (supports ?category=Music+Video filter)
router.get('/', async (req, res) => {
  try {
    const filter = { published: true };
    if (req.query.category) {
      filter.category = { $regex: new RegExp(req.query.category, 'i') };
    }
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
});

// GET /api/projects/:id — public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/projects — admin
router.post('/', verifyToken, uploadFields, async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.thumbnail?.[0]) data.thumbnail = '/uploads/' + req.files.thumbnail[0].filename;
    if (req.files?.videoFile?.[0]) data.videoUrl = '/uploads/' + req.files.videoFile[0].filename;
    if (data.featured === 'true') data.featured = true;
    if (data.published === 'false') data.published = false;
    const project = await Project.create(data);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/projects/:id — admin
router.put('/:id', verifyToken, uploadFields, async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.thumbnail?.[0]) data.thumbnail = '/uploads/' + req.files.thumbnail[0].filename;
    if (req.files?.videoFile?.[0]) data.videoUrl = '/uploads/' + req.files.videoFile[0].filename;
    if (data.featured === 'true') data.featured = true;
    else if (data.featured === 'false') data.featured = false;
    if (data.published === 'true') data.published = true;
    else if (data.published === 'false') data.published = false;
    const project = await Project.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/projects/:id — admin
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
