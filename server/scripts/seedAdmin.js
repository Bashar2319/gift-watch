const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
    console.error('Error: MongoDB connection string not configured in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected for admin seeding...');

    const email = 'pro4134@gmail.com';
    const password = '7081271482s';
    const name = 'Admin Pro';

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log(`User ${email} already exists. Promoting to admin and resetting password...`);
      user.role = 'admin';
      user.password = password;
      user.name = name;
      await user.save();
      console.log(`Successfully updated user ${email} to admin role!`);
    } else {
      console.log(`Creating new admin user: ${email}...`);
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'admin',
      });
      console.log(`Successfully created admin user: ${email}!`);
    }

    await mongoose.disconnect();
    console.log('Seeding completed. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
