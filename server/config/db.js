const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
    console.warn('\n⚠️  WARNING: MongoDB URI is not configured in server/.env.');
    console.warn('⚙️  Running in Standalone Mock Database mode (In-Memory).');
    console.warn('💡 Changes will be reset when the server restarts.\n');
    global.useMockDb = true;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true, // Bypass certificate verification to prevent SSL TLS Alert 80 failures
      serverSelectionTimeoutMS: 5000,    // Time out after 5 seconds of selection to trigger mock DB fallback quickly
      connectTimeoutMS: 5000,            // Time out connection after 5 seconds
      socketTimeoutMS: 5000,             // Time out socket after 5 seconds
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ FATAL: Database connection failed in production. Exiting process...');
      process.exit(1);
    } else {
      console.warn('\n⚙️  Connection failed. Falling back to Standalone Mock Database mode (In-Memory).\n');
      global.useMockDb = true;
    }
  }
};

module.exports = connectDB;
