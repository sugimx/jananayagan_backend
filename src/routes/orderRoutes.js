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

// ⭐ IMPORTANT: Public routes MUST come FIRST before protected routes
// Otherwise they'll never be reached

// Test endpoint (no auth) - simple JSON response
router.get('/test-simple', (req, res) => {
  res.json({ 
    success: true,
    message: 'Orders route is accessible',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for cuplist (no auth)
router.get('/test-cuplist', (req, res) => {
  res.json({ message: 'Cup list endpoint is accessible', timestamp: new Date().toISOString() });
});

// Cup list endpoints (no auth required)
router.get('/cuplist/all', getCupListData);
router.get('/cuplist/search', getCupListDataByFilter);

// Webhook routes (no auth)
router.post('/payment/phonepe/callback', phonePeCallback);
router.post('/payment/cashfree/callback', handleCashfreeWebhook);

// ⭐ Protected routes come AFTER public routes
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
