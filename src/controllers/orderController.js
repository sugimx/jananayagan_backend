require('dotenv').config();
const Order = require('../models/Order');
const Address = require('../models/Address');
const crypto = require('crypto');
const axios = require('axios');
const { generateMultipleMugSerials } = require('../utils/mugSerialGenerator');

// Load configuration directly from environment variables instead of ../config/index.js
const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX,
  baseUrl: process.env.PHONEPE_BASE_URL,
};

// Validate PhonePe config at startup to fail fast with clear error
if (!PHONEPE_CONFIG.merchantId || !PHONEPE_CONFIG.saltKey || !PHONEPE_CONFIG.saltIndex || !PHONEPE_CONFIG.baseUrl) {
  console.error('PhonePe configuration is missing. Ensure PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX, PHONEPE_BASE_URL are set.');
}


const SERVER_CONFIG = {
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Generate PhonePe checksum
const generateChecksum = (payload, saltKey) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksumString = base64Payload + '/pg/v1/pay' + saltKey;
  const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
  return checksum + '###' + PHONEPE_CONFIG.saltIndex;
};

// Ensure PhonePe gets a 10-digit mobile number (strip country code and non-digits)
const sanitizeMobileNumber = (input) => {
  if (!input) return '9876543210';
  const digits = String(input).replace(/\D/g, '');
  return digits.slice(-10) || '9876543210';
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
   
    
    // Check if body is empty or undefined
    if (!req.body) {
     
      return res.status(400).json({
        success: false,
        message: 'Request body is empty',
      });
    }
    
    // If body is empty object
    if (Object.keys(req.body).length === 0) {
    
      return res.status(400).json({
        success: false,
        message: 'Request body is empty',
      });
    }
    
    const { items, shippingAddressId, paymentMethod } = req.body;
    
   
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
     
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
        debug: {
          items: items,
          itemsType: typeof items,
          isArray: Array.isArray(items),
          itemsLength: items?.length
        }
      });
    }
  

    if (!shippingAddressId) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    // Get shipping address
    const shippingAddress = await Address.findOne({
      _id: shippingAddressId,
      user: req.user._id,
    });

    if (!shippingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Shipping address not found',
      });
    }

    // Calculate totals and generate mug serials
    let totalAmount = 0;
    const orderItems = [];
    
   // console.log('Processing items:', items);
    
    for (const item of items) {
     
      const itemTotal = item.quantity * item.price;
      totalAmount += itemTotal;
      
      const orderItem = {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: itemTotal,
      };
      
      //console.log('Created orderItem:', orderItem);
      
      // Generate mug serial if this is a mug product and bike number is provided
      if (item.isMug && item.bikeNumber) {
        try {
          const mugSerials = await generateMultipleMugSerials(item.bikeNumber, item.quantity);
          orderItem.mugSerial = mugSerials.join(','); // Store multiple serials as comma-separated string
        } catch (error) {
          console.error('Error generating mug serials:', error);
          // Continue without mug serial if generation fails
        }
      }
      
      orderItems.push(orderItem);
    }

    const shippingCharges = 0; // Free shipping for all orders
    const finalAmount = totalAmount + shippingCharges;

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const orderData = {
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        landmark: shippingAddress.landmark,
      },
      paymentDetails: {
        method: paymentMethod,
        amount: finalAmount,
      },
      totalAmount,
      shippingCharges,
      finalAmount,
    };

    let order;
    try {
      order = await Order.create(orderData);
      console.log('Order created successfully:', order);
    } catch (error) {
      console.error('Order creation failed:', error);
      console.error('Order validation error:', error.message);
      return res.status(400).json({
        success: false,
        message: `Order creation failed: ${error.message}`,
      });
    }

    // If payment method is PhonePe, create payment request
    if (paymentMethod === 'phonepe') {
      const paymentRequest = await createPhonePePaymentRequest(order);
      order.paymentDetails.phonepeTransactionId = paymentRequest.merchantTransactionId;
      await order.save();

      return res.status(201).json({
        success: true,
        message: 'Order created successfully. Payment request generated.',
        data: {
          order,
          paymentRequest,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create PhonePe payment request
// @route   POST /api/orders/:id/payment/phonepe
// @access  Private
exports.createPhonePePayment = async (req, res) => {
  
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentDetails.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    const paymentRequest = await createPhonePePaymentRequest(order);
    
    order.paymentDetails.phonepeTransactionId = paymentRequest.merchantTransactionId;
    await order.save();

    res.json({
      success: true,
      message: 'Payment request created successfully',
      data: paymentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const createPhonePePaymentRequest = async (order) => {
  const merchantTransactionId = `TXN_${order._id}_${Date.now()}`;
  
  const payload = {
    merchantId: PHONEPE_CONFIG.merchantId,
    merchantTransactionId: "MT" + Date.now(),
    merchantUserId: "U123",
    amount: order.finalAmount * 100, 
    redirectUrl: `${SERVER_CONFIG.frontendUrl}/payment/callback`,
    redirectMode: 'POST',
    callbackUrl: `http://localhost:${SERVER_CONFIG.port}/api/orders/payment/phonepe/callback`,
    mobileNumber: sanitizeMobileNumber(order.shippingAddress.phone),
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };


  const checksum = generateChecksum(payload, PHONEPE_CONFIG.saltKey);

  try {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  
    const phonepeResponse = await axios.post(`${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`, {
      request: base64Payload
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId,
      }
    });

    
    const phonepeData = phonepeResponse.data;
   
    // Extract the redirect URL from PhonePe response
    let redirectUrl = null;
    if (phonepeData.success && phonepeData.data?.instrumentResponse?.redirectInfo?.url) {
      redirectUrl = phonepeData.data.instrumentResponse.redirectInfo.url;
    } else if (phonepeData.data?.redirectUrl) {
      redirectUrl = phonepeData.data.redirectUrl;
    } else if (phonepeData.url) {
      redirectUrl = phonepeData.url;
    }

    if (!redirectUrl) {
      throw new Error(`PhonePe payment failed: ${phonepeData.message || 'No redirect URL received'}`);
    }

    return {
      merchantTransactionId,
      payload,
      checksum,
      url: `${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`,
      redirectUrl, // This is the URL the user should be redirected to
      phonepeResponse: phonepeData
    };
  } catch (error) {
    console.error('Error calling PhonePe API:', error.message);
    if (error.response) {
      console.error('PhonePe API Error Status:', error.response.status);
      console.error('PhonePe API Error Headers:', error.response.headers);
      console.error('PhonePe API Error Body:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`PhonePe API call failed: ${error.response?.data?.message || error.message}`);
  }
};

// @desc    PhonePe payment callback
// @route   POST /api/orders/payment/phonepe/callback
// @access  Public
exports.phonePeCallback = async (req, res) => {
  try {
    const { response } = req.body;
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
    
    const { merchantTransactionId, transactionId, state, code, responseCode } = decodedResponse;
    
    if (responseCode === 'PAYMENT_SUCCESS') {
      // Update order payment status
      const order = await Order.findOne({
        'paymentDetails.phonepeTransactionId': merchantTransactionId,
      });

      if (order) {
        order.paymentDetails.status = 'completed';
        order.paymentDetails.transactionId = transactionId;
        order.orderStatus = 'confirmed';
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment callback processed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    if (orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
