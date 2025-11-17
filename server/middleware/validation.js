import { body, param, validationResult } from 'express-validator';

// Validation error handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  validate
];

// User login validation
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Task validation
export const validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
    .escape(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status value'),
  
  validate
];

// Task update validation (all fields optional)
export const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
    .escape(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status value'),
  
  validate
];

// Note validation
export const validateNote = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Title must be between 2 and 150 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
  
  validate
];

// Note update validation (all fields optional)
export const validateNoteUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Title must be between 2 and 150 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
  
  validate
];

// MongoDB ObjectId validation
export const validateObjectId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  validate
];

// Chat message validation
export const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  
  body('conversationHistory')
    .optional()
    .isArray().withMessage('Conversation history must be an array'),
  
  validate
];

// Tool confirmation validation
export const validateToolConfirmation = [
  body('toolCallId')
    .notEmpty().withMessage('Tool call ID is required'),
  
  body('approved')
    .isBoolean().withMessage('Approval status must be a boolean'),
  
  validate
];
