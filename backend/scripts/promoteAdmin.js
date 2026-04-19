require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address: node promoteAdmin.js <email>');
  process.exit(1);
}

const promote = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`🔍 User not found. Creating a NEW ADMIN user...`);
      user = await User.create({
        name: 'System Admin',
        email: email.toLowerCase(),
        password: 'AdminPassword123', // Default temporary password
        role: 'admin'
      });
      console.log(`🚀 Created NEW ADMIN user!`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Temp Password: AdminPassword123`);
      console.log(`⚠️ Please change your password after logging in.`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`🚀 Successfully promoted ${user.name} (${user.email}) to ADMIN!`);
    }

    process.exit();
  } catch (error) {
    console.error('❌ Promotion Error:', error);
    process.exit(1);
  }
};

promote();
