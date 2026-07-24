// backend/seedAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const DEMO_ADMIN = {
  username: 'admin',
  email: 'admin@ecommerce.com',
  password: 'admin123',
  role: 'admin',
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding admin.');

    const existing = await Admin.findOne({
      $or: [{ email: DEMO_ADMIN.email }, { username: DEMO_ADMIN.username }],
    }).select('+password');

    if (existing) {
      existing.username = DEMO_ADMIN.username;
      existing.email = DEMO_ADMIN.email;
      existing.password = DEMO_ADMIN.password; // re-hashed by the pre-save hook
      existing.role = DEMO_ADMIN.role;
      await existing.save();
      console.log(`✅ Existing admin updated: ${DEMO_ADMIN.email}`);
    } else {
      await Admin.create(DEMO_ADMIN);
      console.log(`✅ Demo admin created: ${DEMO_ADMIN.email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
