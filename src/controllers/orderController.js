require('dotenv').config();
const Order = require('../models/Order');
const Address = require('../models/Address');
const { generateMultipleMugSerials } = require('../utils/mugSerialGenerator');
const { 
  createPaymentRequest, 
  validateConfig
} = require('../utils/phonepeV2Helper');

const validatePhonePeConfig = validateConfig;

const SERVER_CONFIG = {
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
};

// Validate PhonePe V2 config at startup to fail fast with clear error
try {
  validatePhonePeConfig();
  console.log('PhonePe V2 configuration validated successfully');
} catch (error) {
  console.error('PhonePe V2 configuration error:', error.message);
}

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

    const shippingCharges = 0;
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
      const paymentRequest = await createPhonePeV2PaymentRequest(order);
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

    const paymentRequest = await createPhonePeV2PaymentRequest(order);

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

/**
 * Create PhonePe V2 payment request
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Payment request details
 */
const createPhonePeV2PaymentRequest = async (order) => {
  // Generate unique transaction ID
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const merchantTransactionId = `TXN_${timestamp}_${random}`;

  const paymentData = {
    merchantTransactionId,
    userId: order.user.toString(),
    amount: order.finalAmount * 100, // Convert to paise
    redirectUrl: `${SERVER_CONFIG.frontendUrl}/profile`,
    callbackUrl: `${SERVER_CONFIG.frontendUrl}/api/orders/payment/phonepe/callback`,
    mobileNumber: order.shippingAddress.phone,
  };

  console.log('Creating PhonePe V2 payment request for order:', order.orderNumber);

  const result = await createPaymentRequest(paymentData);

  return {
    merchantTransactionId,
    redirectUrl: result.redirectUrl,
    paymentRequest: result,
  };
};
// @desc    PhonePe payment callback
// @route   POST /api/orders/payment/phonepe/callback
// @access  Public
exports.phonePeCallback = async (req, res) => {
  try {
    console.log('PhonePe V2 callback received:', req.body);

    // PhonePe V2 sends response in a slightly different format
    let decodedResponse;
    if (req.body.response) {
      // If response is base64 encoded
      decodedResponse = JSON.parse(Buffer.from(req.body.response, 'base64').toString());
    } else {
      // Direct response object
      decodedResponse = req.body;
    }

    const { merchantTransactionId, transactionId, code, responseCode } = decodedResponse;

    console.log('Decoded callback data:', {
      merchantTransactionId,
      transactionId,
      code,
      responseCode,
    });

    // PhonePe V2 uses code 'PAYMENT_SUCCESS' or 'PAYMENT_PENDING' for successful payment
    if (code === 'PAYMENT_SUCCESS' || responseCode === 'PAYMENT_SUCCESS') {
      // Update order payment status
      const order = await Order.findOne({
        'paymentDetails.phonepeTransactionId': merchantTransactionId,
      });

      if (order) {
        order.paymentDetails.status = 'completed';
        order.paymentDetails.transactionId = transactionId;
        order.orderStatus = 'confirmed';
        await order.save();
        console.log(`Order ${order.orderNumber} payment completed successfully`);
      } else {
        console.warn(`Order not found for transaction: ${merchantTransactionId}`);
      }
    } else if (code === 'PAYMENT_ERROR') {
      console.error('Payment failed for transaction:', merchantTransactionId);
    }

    res.json({
      success: true,
      message: 'Payment callback processed',
    });
  } catch (error) {
    console.error('Error processing PhonePe V2 callback:', error);
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

// @desc    Get user orders summary (product name, price, delivery details, email)
// @route   GET /api/orders/summary
// @access  Private
exports.getUserOrdersSummary = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const email = req.user?.email || null;

    const data = orders.map(order => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      items: order.items.map(item => ({
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      deliveryDetails: {
        fullName: order.shippingAddress?.fullName,
        phone: order.shippingAddress?.phone,
        addressLine1: order.shippingAddress?.addressLine1,
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        postalCode: order.shippingAddress?.postalCode,
        country: order.shippingAddress?.country,
        landmark: order.shippingAddress?.landmark || null,
        instructions: order.shippingAddress?.instructions || null,
      },
      email,
      paymentStatus: order.paymentDetails?.status,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get orders by status (booking id, payment time, buyer name, amount)
// @route   GET /api/orders/status/:status/summary
// @access  Private
exports.getOrdersByStatusSummary = async (req, res) => {
  try {
    const status = req.params.status;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const data = orders.map(order => ({
      bookingId: order.orderNumber,
      paymentTime: order.paymentDetails?.status === 'completed' ? order.updatedAt : null,
      buyerName: order.shippingAddress?.fullName || null,
      amount: order.finalAmount,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order status summary by orderId
// @route   GET /api/orders/status/:orderId/summary
// @access  Private
exports.getOrderStatusByOrderId = async (req, res) => {
  try {
    const param = req.params.orderId || req.params.status;
    
    // Check if param is a valid status - if so, it should use the status route
    // But since this route comes first, we check and handle orderId here
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    // If it's a valid status, this route shouldn't handle it - let it fall through
    // Actually, since this route is checked first, we need to distinguish
    // Check if it looks like an orderId (24 hex characters) vs a status (word)
    const isValidStatus = validStatuses.includes(param);
    
    if (isValidStatus) {
      // If it's a status, delegate to the status handler
      req.params.status = param;
      return exports.getOrdersByStatusSummary(req, res);
    }

    // Check if orderId is a valid MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(param);
    
    if (!isValidObjectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findOne({
      _id: param,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const data = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentDetails?.status || 'pending',
      bookingId: order.orderNumber,
      paymentTime: order.paymentDetails?.status === 'completed' ? order.updatedAt : null,
      buyerName: order.shippingAddress?.fullName || null,
      amount: order.finalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.json({
      success: true,
      data,
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

// @desc    Get invoice details for an order
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.getOrderInvoice = async (req, res) => {
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

    const discountAmount = 0; // No discount field in model, defaulting to 0
    const isPaid = order.paymentDetails?.status === 'completed';

    const fromAddress = {
      name: process.env.INVOICE_FROM_NAME || 'Jana Nayagan',
      addressLine1: process.env.INVOICE_FROM_ADDRESS_LINE1 || 'Chennai, Tamil Nadu',
      city: process.env.INVOICE_FROM_CITY || 'Chennai',
      state: process.env.INVOICE_FROM_STATE || 'TN',
      postalCode: process.env.INVOICE_FROM_POSTAL || '600001',
      country: process.env.INVOICE_FROM_COUNTRY || 'India',
      phone: process.env.INVOICE_FROM_PHONE || '',
      email: process.env.INVOICE_FROM_EMAIL || '',
      gstin: process.env.INVOICE_FROM_GSTIN || '',
    };

    const items = order.items.map((item) => ({
      description: item.productName,
      quantity: item.quantity,
      price: item.price,
      amount: item.totalPrice,
    }));

    const invoice = {
      invoiceId: order.orderNumber,
      invoiceDate: order.createdAt,
      billedTo: {
        name: order.shippingAddress?.fullName,
        phone: order.shippingAddress?.phone,
        addressLine1: order.shippingAddress?.addressLine1,
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        postalCode: order.shippingAddress?.postalCode,
        country: order.shippingAddress?.country,
        landmark: order.shippingAddress?.landmark || undefined,
      },
      from: fromAddress,
      items,
      totals: {
        subtotal: order.totalAmount,
        shipping: order.shippingCharges || 0,
        discount: discountAmount,
        total: order.finalAmount - discountAmount,
        amountDue: isPaid ? 0 : (order.finalAmount - discountAmount),
        currency: order.paymentDetails?.currency || 'INR',
      },
      payment: {
        method: order.paymentDetails?.method,
        status: order.paymentDetails?.status,
        transactionId: order.paymentDetails?.transactionId,
        phonepeTransactionId: order.paymentDetails?.phonepeTransactionId,
        paidAt: isPaid ? order.updatedAt : null,
      },
    };

    return res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
