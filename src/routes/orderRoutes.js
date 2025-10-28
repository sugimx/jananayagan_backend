const express = require('express');
const router = express.Router();
const {
  createOrder,
  createPhonePePayment,
  phonePeCallback,
  getUserOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, protectPayment } = require('../middleware/authMiddleware');

router.post('/payment/phonepe/callback', phonePeCallback);
router.post('/', protectPayment, createOrder);
router.post('/:id/payment/phonepe', protectPayment, createPhonePePayment);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
