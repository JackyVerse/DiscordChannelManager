require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Check environment variables
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error('Error: ADMIN_USERNAME or ADMIN_PASSWORD is not defined in .env file');
  process.exit(1);
}

async function updateAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find current admin
    const currentAdmin = await User.findOne({ role: 'admin' });
    if (!currentAdmin) {
      console.log('No admin account found');
      process.exit(1);
    }

    // Update admin information
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    currentAdmin.username = process.env.ADMIN_USERNAME;
    currentAdmin.password = hashedPassword;

    await currentAdmin.save();
    console.log('Admin information updated successfully');
    console.log('New username:', process.env.ADMIN_USERNAME);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdmin(); 