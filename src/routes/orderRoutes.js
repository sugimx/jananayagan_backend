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
} = require('../controllers/orderController');
const { handleCashfreeWebhook } = require('../webhooks/cashfreeWebhook');
const { protect, protectPayment } = require('../middleware/authMiddleware');

router.post('/payment/phonepe/callback', phonePeCallback);
router.post('/payment/cashfree/callback', handleCashfreeWebhook);

// Public endpoints - NO authentication required
router.get('/cuplist/all', async (req, res) => {
  try {
    const result = await require('../utils/googleSheetsHelper').getCupListData();
    res.json({
      success: true,
      sheetName: result.sheetName,
      count: result.count,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Cup List data: ' + error.message,
    });
  }
});

router.get('/cuplist/search', async (req, res) => {
  try {
    const filters = {};
    const validFilters = ['Name', 'Phone', 'Email', 'Address', 'Location', 'State', 'Pincode', 'Order ID', 'Cup'];
    validFilters.forEach(filterKey => {
      const queryKey = filterKey.toLowerCase().replace(' ', '');
      if (req.query[queryKey]) {
        filters[filterKey] = req.query[queryKey];
      }
    });
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const result = await require('../utils/googleSheetsHelper').getCupListDataByFilter(filters, limit);
    res.json({
      success: true,
      sheetName: result.sheetName,
      count: result.count,
      filtersApplied: result.filtersApplied,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filtered Cup List data: ' + error.message,
    });
  }
});
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
