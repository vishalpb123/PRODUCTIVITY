import express from 'express';
import {
  chatWithCatBot,
  streamChatWithCatBot,
  confirmToolCall,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateChatMessage, validateToolConfirmation } from '../middleware/validation.js';

const router = express.Router();

// Chat with AI Cat Bot (non-streaming)
router.post('/message', protect, validateChatMessage, chatWithCatBot);

// Stream chat with AI Cat Bot (SSE - Server-Sent Events)
router.post('/stream', protect, validateChatMessage, streamChatWithCatBot);

// Confirm tool/function call
router.post('/confirm', protect, validateToolConfirmation, confirmToolCall);

// Get chat history
router.get('/history', protect, getChatHistory);

// Clear chat history
router.delete('/history', protect, clearChatHistory);

export default router;
