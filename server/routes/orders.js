const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createOrder, getOrders, getOrder, trackOrder, requestReturn, cancelOrder, updateOrderStatus,
} = require('../controllers/orderController');

router.get('/track', trackOrder);
router.post('/', optionalAuth, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', optionalAuth, getOrder);
router.put('/:id/return', protect, requestReturn);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, updateOrderStatus); // admin only in controller

module.exports = router;
