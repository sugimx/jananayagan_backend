/**
 * Complete Test Script for Order and PhonePe Payment API
 * 
 * This script demonstrates the complete flow from registration to order creation
 * Run with: node test_order_api.js
 * 
 * Prerequisites:
 * - Server running on http://localhost:5000
 * - MongoDB connection configured
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Configuration - Replace with your test data
const TEST_USER = {
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  phone: '+919876543210',
  password: 'SecurePass123!'
};

const TEST_ADDRESS = {
  type: 'home',
  isDefault: true,
  fullName: 'Rajesh Kumar',
  phone: '+919876543210',
  addressLine1: '123, Building A, Sector 5',
  city: 'Mumbai',
  state: 'Maharashtra',
  district: 'Mumbai',
  postalCode: '400001',
  country: 'India',
  landmark: 'Near XYZ Mall, Opp. Metro Station'
};

const TEST_ORDER_ITEMS = [
  {
    productId: '65a1b2c3d4e5f6789abcdef2',
    productName: 'Personalized Mug - Royal King',
    quantity: 2,
    price: 599,
    isMug: true,
    bikeNumber: 'MH12AB3456'
  },
  {
    productId: '65a1b2c3d4e5f6789abcdef3',
    productName: 'Premium Coffee Mug Set',
    quantity: 1,
    price: 1299
  }
];

// Utility function for making API requests
async function makeRequest(method, url, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function testOrderFlow() {
  console.log('🚀 Starting Order and Payment API Test\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Register User
    console.log('\n1️⃣ Registering User...');
    const registerResponse = await makeRequest('POST', '/users/register', TEST_USER);
    console.log('✅ User Registered:', registerResponse.data.email);
    
    const authToken = registerResponse.data.token;
    console.log('📝 Auth Token:', authToken.substring(0, 20) + '...\n');

    // Step 2: Create Address
    console.log('2️⃣ Creating Shipping Address...');
    const addressResponse = await makeRequest('POST', '/addresses', TEST_ADDRESS, authToken);
    console.log('✅ Address Created:', addressResponse.data._id);
    console.log('📍 Address:', addressResponse.data.addressLine1, ',', addressResponse.data.city);
    
    const addressId = addressResponse.data._id;
    console.log('');

    // Step 3: Create Order with PhonePe Payment
    console.log('3️⃣ Creating Order with PhonePe Payment...');
    const orderData = {
      items: TEST_ORDER_ITEMS,
      shippingAddressId: addressId,
      paymentMethod: 'phonepe'
    };

    const orderResponse = await makeRequest('POST', '/orders', orderData, authToken);
    console.log('✅ Order Created:', orderResponse.data.order.orderNumber);
    console.log('💰 Total Amount: ₹', orderResponse.data.order.finalAmount);
    console.log('📦 Items:', orderResponse.data.order.items.length);
    console.log('🆔 Order ID:', orderResponse.data.order._id);
    
    if (orderResponse.data.paymentRequest) {
      console.log('\n📱 PhonePe Payment Details:');
      console.log('  Transaction ID:', orderResponse.data.paymentRequest.merchantTransactionId);
      console.log('  Amount:', orderResponse.data.paymentRequest.payload.amount / 100, 'INR');
      console.log('  Payment URL:', orderResponse.data.paymentRequest.url);
      console.log('\n💳 To complete payment, use the transaction ID and make request to PhonePe');
    }

    const orderId = orderResponse.data.order._id;

    // Step 4: Get Order Details
    console.log('\n4️⃣ Fetching Order Details...');
    const orderDetails = await makeRequest('GET', `/orders/${orderId}`, null, authToken);
    console.log('✅ Order Status:', orderDetails.data.orderStatus);
    console.log('💳 Payment Status:', orderDetails.data.paymentDetails.status);
    console.log('🛍️ Items in Order:');
    orderDetails.data.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.productName} x ${item.quantity} = ₹${item.totalPrice}`);
      if (item.mugSerial) {
        console.log(`      Serial Numbers: ${item.mugSerial}`);
      }
    });

    // Step 5: Get All User Orders
    console.log('\n5️⃣ Fetching All Orders...');
    const allOrders = await makeRequest('GET', '/orders', null, authToken);
    console.log('✅ Total Orders:', allOrders.total);
    console.log('📊 Orders Count:', allOrders.count);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All Tests Completed Successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
    console.log('\nTroubleshooting Tips:');
    console.log('1. Check if server is running on http://localhost:5000');
    console.log('2. Verify MongoDB connection is established');
    console.log('3. Ensure all environment variables are set');
    console.log('4. Check if user/profile already exists (use different email)');
  }
}

// Example API Call Data
const EXAMPLES = {
  // Complete Registration Request
  register: {
    url: `${BASE_URL}/users/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: TEST_USER
  },

  // Complete Login Request
  login: {
    url: `${BASE_URL}/users/login`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email: TEST_USER.email,
      password: TEST_USER.password
    }
  },

  // Complete Create Address Request
  createAddress: {
    url: `${BASE_URL}/addresses`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: TEST_ADDRESS
  },

  // Complete Create Order Request
  createOrder: {
    url: `${BASE_URL}/orders`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: {
      items: TEST_ORDER_ITEMS,
      shippingAddressId: 'YOUR_ADDRESS_ID',
      paymentMethod: 'phonepe'
    }
  },

  // Order with Single Item (No Mug Customization)
  simpleOrder: {
    items: [
      {
        productId: '65a1b2c3d4e5f6789abcdef4',
        productName: 'Ceramic Mug - Blue',
        quantity: 3,
        price: 450
      }
    ],
    shippingAddressId: 'YOUR_ADDRESS_ID',
    paymentMethod: 'phonepe'
  },

  // Order with Multiple Mug Items
  mugOrder: {
    items: [
      {
        productId: 'mug_personalized_001',
        productName: 'Personalized Mug - "John"',
        quantity: 2,
        price: 599,
        isMug: true,
        bikeNumber: 'MH12AB3456'
      },
      {
        productId: 'mug_travel_001',
        productName: 'Insulated Travel Mug',
        quantity: 1,
        price: 899
      }
    ],
    shippingAddressId: 'YOUR_ADDRESS_ID',
    paymentMethod: 'phonepe'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testOrderFlow,
    EXAMPLES,
    TEST_USER,
    TEST_ADDRESS,
    TEST_ORDER_ITEMS
  };
}

// Run test if executed directly
if (require.main === module) {
  testOrderFlow();
}

console.log(`
Sample API Requests:

1. Register User:
   ${EXAMPLES.register.url}
   ${JSON.stringify(EXAMPLES.register.body, null, 2)}

2. Login:
   ${EXAMPLES.login.url}
   ${JSON.stringify(EXAMPLES.login.body, null, 2)}

3. Create Address:
   ${EXAMPLES.createAddress.url}
   Headers: Authorization: Bearer <TOKEN>
   ${JSON.stringify(EXAMPLES.createAddress.body, null, 2)}

4. Create Order:
   ${EXAMPLES.createOrder.url}
   Headers: Authorization: Bearer <TOKEN>
   ${JSON.stringify(EXAMPLES.createOrder.body, null, 2)}

Run: node test_order_api.js
`);

