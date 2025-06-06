const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation middleware
const restaurantValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number is required'),
  body('cuisines').isString().notEmpty().withMessage('Cuisines are required'),
  body('vegNonveg').isIn(['veg', 'nonveg', 'both']).withMessage('Valid food type is required'),
  body('areaId').notEmpty().withMessage('Area ID is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('hours').notEmpty().withMessage('Operating hours are required')
];

// Routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/area/:areaId', restaurantController.getRestaurantsByArea);
router.get('/:id', restaurantController.getRestaurantById);
router.post('/', restaurantValidation, validate, restaurantController.createRestaurant);
router.put('/:id', authenticateToken, restaurantValidation, validate, restaurantController.updateRestaurant);
router.patch('/:id/approval', authenticateToken, body('approval').isBoolean(), validate, restaurantController.updateApprovalStatus);
router.delete('/:id', authenticateToken, restaurantController.deleteRestaurant);

module.exports = router;
