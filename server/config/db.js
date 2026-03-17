import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  const uri = config.MONGO_URI;
  if (!uri || uri === 'mongodb://localhost:27017/telecom_noc') {
    console.warn('MONGO_URI not set or using default localhost. Set MONGO_URI in server/.env for MongoDB Atlas.');
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const msg = error.message || '';
    console.error('MongoDB connection failed:', msg);
    if (error.name) console.error('Error name:', error.name);
    if (msg.includes('auth') || msg.includes('Authentication')) {
      console.error('Check username/password in MONGO_URI and Atlas Database Access.');
    }
    if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      console.error('Check network and Atlas cluster host. For Atlas, allow IP in Network Access (e.g. 0.0.0.0/0).');
    }
    throw error;
  }
};

export default connectDB;
