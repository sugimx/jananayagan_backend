const express = require('express');
const router = express.Router();
const {
  createOrder,
  createPhonePePayment,
  phonePeCallback,
  createCashfreePayment,
  cashfreeCallback,
  getUserOrders,
  getUserOrdersSummary,
  getOrdersByStatusSummary,
  getOrderStatusByOrderId,
  getOrder,
  updateOrderStatus,
  getOrderInvoice,
} = require('../controllers/orderController');
const { protect, protectPayment } = require('../middleware/authMiddleware');

router.post('/payment/phonepe/callback', phonePeCallback);
router.post('/payment/cashfree/callback', cashfreeCallback);
router.post('/', protectPayment, createOrder);
router.post('/:id/payment/phonepe', protectPayment, createPhonePePayment);
router.post('/:id/payment/cashfree', protectPayment, createCashfreePayment);
router.get('/', protect, getUserOrders);
router.get('/summary', protect, getUserOrdersSummary);
router.get('/status/:orderId/summary', protect, getOrderStatusByOrderId);
router.get('/invoice/:id', protect, getOrderInvoice);
router.get('/:id/invoice', protect, getOrderInvoice);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
