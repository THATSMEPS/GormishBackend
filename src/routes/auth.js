const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['customer', 'restaurant', 'delivery_partner']),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const refreshTokenValidation = [
  body('refresh_token').notEmpty()
];

// Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

// Google auth route
router.post('/google', 
  body('access_token').notEmpty(),
  validate,
  authController.googleSignIn
);

// Refresh token route
router.post('/refresh-token',
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

module.exports = router;
