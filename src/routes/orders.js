const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation middleware
const createOrderValidation = [
  body('restaurantId').notEmpty(),
  body('items').isArray().notEmpty(),
  body('items.*.menuItemId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('paymentType').isIn(['COD', 'ONLINE'])
];

const updateStatusValidation = [
  body('status').isIn([
    'preparing',
    'ready',
    'dispatch',
    'delivered',
    'cancelled',
    'rejected'
  ])
];

// Routes
router.get('/', authenticateToken, orderController.getOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, createOrderValidation, validate, orderController.createOrder);
router.patch('/:id/status', authenticateToken, updateStatusValidation, validate, orderController.updateOrderStatus);

// Customer orders
router.get('/customer/:customerId', authenticateToken, orderController.getCustomerOrders);

// Restaurant orders
router.get('/restaurant/:restaurantId', authenticateToken, orderController.getRestaurantOrders);

// Delivery partner orders
router.get('/delivery-partner/:dpId', authenticateToken, orderController.getDeliveryPartnerOrders);

module.exports = router;
