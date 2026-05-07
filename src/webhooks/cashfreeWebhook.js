const Order = require('../models/Order');
const MugAssignment = require('../models/Mug');
const googleSheetsHelper = require('../utils/googleSheetsHelper');

/**
 * Create mug assignments for order
 */
const createMugAssignmentsForOrder = async (order) => {
  try {
    if (!order || order.buyerProfiles.length === 0) {
      console.log('Order has no associated profile; skipping mug assignment creation');
      return;
    }

    const existingAssignment = await MugAssignment.findOne({ order: order._id });
    if (existingAssignment) {
      console.log(`Mug assignments already exist for order ${order.orderNumber}, skipping`);
      return;
    }

    // STEP 1: find last mugId in DB
    const lastMug = await MugAssignment.findOne().sort({ mugId: -1 });
    let nextId = lastMug ? lastMug.mugId + 1 : 1;

    const docs = [];

    // STEP 2: For each buyer profile → create a new incremental mugId
    for (const profile of order.buyerProfiles) {
      if (!profile?._id) continue;

      docs.push({
        profile: profile._id,
        order: order._id,
        user: order.user,
        mugId: nextId,
      });

      nextId++;
    }

    await MugAssignment.insertMany(docs, { ordered: false });
    console.log(`Created ${docs.length} mug assignment(s) for order ${order.orderNumber}`);
  } catch (error) {
    console.error(`Failed to create mug assignments for order ${order?.orderNumber}:`, error);
  }
};

/**
 * @desc    Cashfree payment webhook callback
 * @route   POST /api/orders/payment/cashfree/callback
 * @access  Public
 */
exports.handleCashfreeWebhook = async (req, res) => {
  try {
    console.log('Cashfree webhook received:', req.body);

    const payload = req.body || {};

    // Check if this is a Cashfree webhook (new format)
    if (payload.type === 'PAYMENT_FORM_ORDER_WEBHOOK' && payload.data) {
      // New webhook format with form data
      const orderData = payload.data?.order || {};
      const merchantTransactionId = orderData.order_id;
      const status = orderData.order_status;

      console.log(`Processing Cashfree webhook: Order ${merchantTransactionId}, Status: ${status}`);

      // Treat common success indicators
      const isSuccess = String(status).toLowerCase().includes('paid') || 
                       String(status).toLowerCase().includes('success') || 
                       String(status).toLowerCase().includes('completed');

      try {
        // Update Google Sheet with webhook data
        await googleSheetsHelper.addCashfreeWebhookToSheet(payload);
        console.log('Payment details added to Google Sheet successfully');
      } catch (sheetError) {
        console.error('Failed to add payment to Google Sheet:', sheetError.message);
        // Continue processing even if Google Sheets update fails
      }

      if (isSuccess && merchantTransactionId) {
        const order = await Order.findOne({ 
          'paymentDetails.orderId': merchantTransactionId 
        });
        
        if (order) {
          order.paymentDetails.status = 'completed';
          order.paymentDetails.transactionId = orderData.transaction_id || '';
          order.orderStatus = 'confirmed';
          await order.save();
          await createMugAssignmentsForOrder(order);
          console.log(`Order ${order.orderNumber} Cashfree payment completed successfully`);
        } else {
          console.warn(`Order not found for Cashfree transaction: ${merchantTransactionId}`);
        }
      } else {
        console.warn('Cashfree webhook indicates non-success status:', status);
      }

      res.json({ success: true, message: 'Cashfree webhook processed' });
    } else {
      // Legacy callback format (backward compatibility)
      const merchantTransactionId = payload.orderId || payload.order_id || payload.orderID || payload.order_id;
      const status = payload.orderStatus || payload.txStatus || payload.status || payload.order_status;

      if (!merchantTransactionId) {
        console.warn('Cashfree webhook missing order id');
        return res.json({ success: false, message: 'Missing order id' });
      }

      // Treat common success indicators
      const isSuccess = String(status).toLowerCase().includes('paid') || 
                       String(status).toLowerCase().includes('success') || 
                       String(status).toLowerCase().includes('completed');

      if (isSuccess) {
        const order = await Order.findOne({ 'paymentDetails.phonepeTransactionId': merchantTransactionId });
        if (order) {
          order.paymentDetails.status = 'completed';
          order.paymentDetails.transactionId = payload.referenceId || payload.txId || payload.transactionId || payload.txnId;
          order.orderStatus = 'confirmed';
          await order.save();
          await createMugAssignmentsForOrder(order);
          console.log(`Order ${order.orderNumber} Cashfree payment completed successfully`);
        } else {
          console.warn(`Order not found for Cashfree transaction: ${merchantTransactionId}`);
        }
      } else {
        console.warn('Cashfree webhook indicates non-success status:', status);
      }

      res.json({ success: true, message: 'Cashfree webhook processed' });
    }
  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
