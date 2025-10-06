const Order = require('../models/Order');
const Address = require('../models/Address');
const crypto = require('crypto');

// PhonePe configuration
const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX || 1,
  baseUrl: process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox',
};

// Generate PhonePe checksum
const generateChecksum = (payload, saltKey) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksumString = base64Payload + '/pg/v1/pay' + saltKey;
  const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
  return checksum + '###' + PHONEPE_CONFIG.saltIndex;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddressId, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
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

    // Calculate totals
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const itemTotal = item.quantity * item.price;
      totalAmount += itemTotal;
      
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: itemTotal,
      };
    });

    const shippingCharges = totalAmount > 1000 ? 0 : 50; // Free shipping above 1000
    const finalAmount = totalAmount + shippingCharges;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.address,
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
    });

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

// Helper function to create PhonePe payment request
const createPhonePePaymentRequest = async (order) => {
  const merchantTransactionId = `TXN_${order._id}_${Date.now()}`;
  
  const payload = {
    merchantId: PHONEPE_CONFIG.merchantId,
    merchantTransactionId,
    merchantUserId: order.user.toString(),
    amount: order.finalAmount * 100, // PhonePe expects amount in paise
    redirectUrl: `${process.env.FRONTEND_URL}/payment/callback`,
    redirectMode: 'POST',
    callbackUrl: `${process.env.BACKEND_URL}/api/orders/payment/phonepe/callback`,
    mobileNumber: order.shippingAddress.phone,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const checksum = generateChecksum(payload, PHONEPE_CONFIG.saltKey);
  
  return {
    merchantTransactionId,
    payload,
    checksum,
    url: `${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`,
  };
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
