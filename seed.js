require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Seed admin user
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      await User.create({ username: 'admin', password: 'eyeadi2026', role: 'admin' });
      console.log('✅ Admin user created (admin / eyeadi2026)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Seed sample projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany([
        {
          title: 'Neon Nights',
          category: 'Music Video',
          description: 'A vibrant music video exploring the city after dark',
          thumbnail: 'https://images.unsplash.com/photo-1601506521937-0130f14d9bba?auto=format&fit=crop&q=80&w=1000',
          videoUrl: 'https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4',
          year: '2024',
          featured: true,
          order: 1,
          published: true
        },
        {
          title: 'Velocity',
          category: 'Brand Film',
          description: 'High-octane automotive brand film showcasing raw power',
          thumbnail: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=1000',
          videoUrl: 'https://videos.pexels.com/video-files/5309381/5309381-uhd_2560_1440_25fps.mp4',
          year: '2025',
          featured: true,
          order: 2,
          published: true
        },
        {
          title: 'The Ascent',
          category: 'Short Film',
          description: 'A short documentary about pushing human limits',
          thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1000',
          videoUrl: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
          year: '2025',
          featured: false,
          order: 3,
          published: true
        }
      ]);
      console.log('✅ Sample projects seeded');
    } else {
      console.log('ℹ️  Projects already exist, skipping seed');
    }

    console.log('\n🎬 Seed complete! You can now run: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
