const axios = require('axios');
/**
 * Cashfree Helper Utility
 * Minimal wrapper for creating payment orders, checking status and processing refunds
 * Uses Cashfree client id & secret in headers (`x-client-id`, `x-client-secret`).
 * NOTE: Confirm endpoint paths with Cashfree docs for your environment (sandbox/production).
 */

const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  baseUrl: process.env.CASHFREE_BASE_URL,
  env: process.env.CASHFREE_ENV,
};

const validateConfig = () => {
  const missing = [];
  if (!CASHFREE_CONFIG.appId) missing.push('CASHFREE_APP_ID');
  if (!CASHFREE_CONFIG.secretKey) missing.push('CASHFREE_SECRET_KEY');
  if (!CASHFREE_CONFIG.baseUrl) missing.push('CASHFREE_BASE_URL');

  if (missing.length > 0) {
    throw new Error(`Cashfree configuration missing: ${missing.join(', ')}`);
  }
};

/**
 * Create Cashfree payment order and return a redirect/payment link
 * paymentData: {
 *   merchantTransactionId, amount (in rupees or as expected by API), redirectUrl, callbackUrl, customer: { id, email, phone }
 * }
 */
const createPaymentRequest = async (paymentData) => {
  validateConfig();
  console.log('Creating Cashfree payment request with data:', paymentData);
  // Build request body using common Cashfree order payload fields
  const orderPayload = {
    order_id: paymentData.merchantTransactionId,
    order_amount: String((paymentData.amount / 100).toFixed(2)), // convert paise -> rupees if amount given in paise
    order_currency: 'INR',
    customer_details: {
      customer_id: paymentData.userId || '',
      customer_email: paymentData.customer?.email || '',
      customer_phone: paymentData.mobileNumber || paymentData.customer?.phone || '',
      customer_name: paymentData.customer?.name || '',
    },
    order_meta: {
      return_url: paymentData.redirectUrl,
    },
  };

  const url = `${CASHFREE_CONFIG.baseUrl.replace(/\/$/, '')}/pg/orders`;

  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': CASHFREE_CONFIG.appId,
    'x-client-secret': CASHFREE_CONFIG.secretKey,
    "x-api-version": "2023-08-01"
  };

  try {
    const resp = await axios.post(url, orderPayload, { headers });

    console.log('Cashfree createPaymentRequest response:', resp.data);

    const returnUrl = resp.data.order_meta?.return_url;
    const data = resp.data;

    // const sessionUrl = `${CASHFREE_CONFIG.baseUrl}/pg/links`;
    // const data = {
    //     ... resp.data,
    //   cf_order_id: cfOrderId,
    //   link_expiry_time: 30, // in minutes
    //   link_amount: orderPayload.order_amount,
    //   link_currency: orderPayload.order_currency,
    //   link_meta: {
    //     return_url: paymentData.redirectUrl,
    //   },
    // };
    // const sessionResp = await axios.post(sessionUrl, {data}, { headers });
    // const paymentLink = sessionResp.data.payment_link;
    // console.log('Cashfree session response:', sessionResp.data);
    // const redirectUrl = paymentLink;

    return { success: true, redirectUrl:returnUrl, response: data };
  } catch (error) {
    console.error('Error creating Cashfree payment:', error.message);
    if (error.response) {
      console.error('Cashfree API error:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Cashfree createPaymentRequest failed: ${error.message}`);
  }
};

/**
 * Check payment/order status
 */
const checkPaymentStatus = async (merchantTransactionId) => {
  validateConfig();
  const url = `${CASHFREE_CONFIG.baseUrl.replace(/\/$/, '')}/pg/orders/${merchantTransactionId}`;
  const headers = {
    'Accept': 'application/json',
    'x-client-id': CASHFREE_CONFIG.appId,
    'x-client-secret': CASHFREE_CONFIG.secretKey,
    "x-api-version": "2023-08-01"
  };

  try {
    const resp = await axios.get(url, { headers });
    return resp.data;
  } catch (error) {
    console.error('Error checking Cashfree payment status:', error.message);
    if (error.response) console.error('Status API Error:', JSON.stringify(error.response.data, null, 2));
    throw new Error(`Cashfree checkPaymentStatus failed: ${error.message}`);
  }
};

/**
 * Process refund (basic implementation)
 */
const processRefund = async (refundData) => {
  validateConfig();
  const url = `${CASHFREE_CONFIG.baseUrl.replace(/\/$/, '')}/pg/refunds`;
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': CASHFREE_CONFIG.appId,
    'x-client-secret': CASHFREE_CONFIG.secretKey,
    "x-api-version": "2023-08-01"
  };

  const payload = {
    orderId: refundData.orderId,
    refundAmount: String((refundData.amount / 100).toFixed(2)),
    refundId: refundData.merchantRefundId,
    refundReason: refundData.reason || 'merchant_initiated'
  };

  try {
    const resp = await axios.post(url, payload, { headers });
    return resp.data;
  } catch (error) {
    console.error('Error processing Cashfree refund:', error.message);
    if (error.response) console.error('Refund API Error:', JSON.stringify(error.response.data, null, 2));
    throw new Error(`Cashfree processRefund failed: ${error.message}`);
  }
};

module.exports = {
  validateConfig,
  createPaymentRequest,
  checkPaymentStatus,
  processRefund,
  CASHFREE_CONFIG,
};
