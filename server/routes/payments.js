const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { createPaymentIntent, confirmPayment, webhook, refundOrder } = require('../controllers/paymentController');

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/webhook', webhook); // raw body middleware set in server.js
router.post('/refund/:id', protect, admin, refundOrder);

module.exports = router;
