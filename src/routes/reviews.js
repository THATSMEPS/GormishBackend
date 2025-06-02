const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { body } = require('express-validator');
const validate = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const reviewValidation = [
  body('orderId').notEmpty(),
  body('reviewText').trim().notEmpty()
];

// Routes
router.get('/', authenticateToken, reviewController.getReviews);
router.post('/', authenticateToken, reviewValidation, validate, reviewController.createReview);
router.put('/:id', authenticateToken, body('reviewText').trim().notEmpty(), validate, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
