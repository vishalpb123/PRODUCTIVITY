import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Troubleshooting steps:');
    console.error('1. Check MongoDB Atlas Network Access (whitelist 0.0.0.0/0)');
    console.error('2. Verify username and password are correct');
    console.error('3. Check if cluster is active in MongoDB Atlas');
    console.error('4. Verify internet connection');
    process.exit(1);
  }
};

export default connectDB;
