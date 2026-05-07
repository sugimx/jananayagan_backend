const express = require('express');
const router = express.Router();
const {
  createOrder,
  createPhonePePayment,
  phonePeCallback,
  createCashfreePayment,
  getUserOrders,
  getUserOrdersSummary,
  getOrdersByStatusSummary,
  getOrderStatusByOrderId,
  getOrder,
  updateOrderStatus,
  getOrderInvoice,
  getCupListData,
  getCupListDataByFilter,
} = require('../controllers/orderController');
const { handleCashfreeWebhook } = require('../webhooks/cashfreeWebhook');
const { protect, protectPayment } = require('../middleware/authMiddleware');

router.post('/payment/phonepe/callback', phonePeCallback);
router.post('/payment/cashfree/callback', handleCashfreeWebhook);

// Test endpoint
router.get('/test-cuplist', (req, res) => {
  res.json({ message: 'Cup list endpoint is accessible', timestamp: new Date().toISOString() });
});

router.get('/cuplist/all', getCupListData);
router.get('/cuplist/search', getCupListDataByFilter);
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
