import express from 'express';
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  validateNote, 
  validateNoteUpdate, 
  validateObjectId 
} from '../middleware/validation.js';

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, validateNote, addNote);
router
  .route('/:id')
  .put(protect, validateObjectId, validateNoteUpdate, updateNote)
  .delete(protect, validateObjectId, deleteNote);

export default router;
