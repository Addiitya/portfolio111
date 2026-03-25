const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  year: { type: String, default: new Date().getFullYear().toString() },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true }
}, { timestamps: true });

projectSchema.index({ order: 1 });

module.exports = mongoose.model('Project', projectSchema);
