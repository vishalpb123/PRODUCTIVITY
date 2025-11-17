import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { recordFailedAttempt, clearFailedAttempts } from '../middleware/security.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Clear failed attempts on successful login
      clearFailedAttempts(ip);
      
      // Log successful login
      console.log(`✅ Successful login: ${email} from IP: ${ip}`);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      // Record failed attempt
      recordFailedAttempt(ip);
      
      // Log failed attempt
      console.warn(`⚠️ Failed login attempt: ${email} from IP: ${ip}`);
      
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser };
