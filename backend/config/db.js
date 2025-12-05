const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/lamar';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const conn = mongoose.connection;
    console.log(`MongoDB connected: ${conn.host}/${conn.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
