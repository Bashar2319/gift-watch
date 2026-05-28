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
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    console.warn('\n⚙️  Connection failed. Falling back to Standalone Mock Database mode (In-Memory).\n');
    global.useMockDb = true;
  }
};

module.exports = connectDB;
