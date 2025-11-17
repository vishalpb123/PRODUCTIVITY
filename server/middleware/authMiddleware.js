import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, please login again' });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ 
        message: error.name === 'TokenExpiredError' 
          ? 'Session expired, please login again' 
          : 'Not authorized, invalid token' 
      });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export { protect };
