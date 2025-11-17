import express from 'express';
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  validateTask, 
  validateTaskUpdate, 
  validateObjectId 
} from '../middleware/validation.js';

const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, validateTask, addTask);
router
  .route('/:id')
  .put(protect, validateObjectId, validateTaskUpdate, updateTask)
  .delete(protect, validateObjectId, deleteTask);

export default router;
