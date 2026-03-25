const express = require('express');
const multer = require('multer');
const path = require('path');
const BlogPost = require('../models/BlogPost');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, 'blog-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/blog — public (published only)
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/blog/:slug — public
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/blog — admin
router.post('/', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.coverImage = '/uploads/' + req.file.filename;
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim());
    }
    if (data.published === 'true') data.published = true;
    else if (data.published === 'false') data.published = false;
    // Auto-generate slug
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const post = await BlogPost.create(data);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

// PUT /api/blog/:id — admin
router.put('/:id', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.coverImage = '/uploads/' + req.file.filename;
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim());
    }
    if (data.published === 'true') data.published = true;
    else if (data.published === 'false') data.published = false;
    const post = await BlogPost.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/blog/:id — admin
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
