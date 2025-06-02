const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation middleware
const restaurantValidation = [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('mobile').matches(/^[0-9]{10}$/),
  body('cuisines').isString().notEmpty(),
  body('vegNonveg').isIn(['veg', 'nonveg', 'both']),
  body('areaId').notEmpty(),
  body('address').notEmpty(),
  body('hours').notEmpty()
];

// Routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/area/:areaId', restaurantController.getRestaurantsByArea);
router.get('/:id', restaurantController.getRestaurantById);
router.post('/', authenticateToken, restaurantValidation, validate, restaurantController.createRestaurant);
router.put('/:id', authenticateToken, restaurantValidation, validate, restaurantController.updateRestaurant);
router.patch('/:id/approval', authenticateToken, body('approval').isBoolean(), validate, restaurantController.updateApprovalStatus);
router.delete('/:id', authenticateToken, restaurantController.deleteRestaurant);

module.exports = router;
