import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authLimiter, loginSlowDown, trackSuspiciousActivity } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authLimiter, trackSuspiciousActivity, validateRegister, registerUser);
router.post('/login', authLimiter, loginSlowDown, trackSuspiciousActivity, validateLogin, loginUser);

export default router;
