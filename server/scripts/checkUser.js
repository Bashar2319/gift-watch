const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log('Connected to DB');

    const email = 'pro4134@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User ${email} NOT found in database.`);
    } else {
      console.log(`✅ User ${email} FOUND!`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Hashed Password: ${user.password}`);
      
      const isMatch = await bcrypt.compare('7081271482s', user.password);
      console.log(`   Password '7081271482s' Match: ${isMatch ? 'YES' : 'NO'}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

check();
