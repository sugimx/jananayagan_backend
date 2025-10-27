# Order and PhonePe Payment Integration - Usage Guide

This guide explains how to use the Order and PhonePe Payment integration with detailed sample data and testing instructions.

---

## 📁 Files Created

1. **ORDER_AND_PAYMENT_API.md** - Complete API documentation with sample data
2. **ORDER_API_CURL_EXAMPLES.md** - Ready-to-use cURL commands
3. **Order_PhonePe_API.postman_collection.json** - Postman collection for testing
4. **test_order_api.js** - Automated Node.js test script
5. **USAGE_GUIDE.md** - This file (quick start guide)

---

## 🚀 Quick Start

### Method 1: Using Node.js Test Script

1. **Start your server:**
```bash
npm start
# or
node src/server.js
```

2. **Run the test script:**
```bash
node test_order_api.js
```

This will automatically:
- Register a user
- Create an address
- Create an order with PhonePe payment
- Display order details

### Method 2: Using Postman

1. **Import the collection:**
   - Open Postman
   - Click "Import"
   - Select `Order_PhonePe_API.postman_collection.json`

2. **Set environment variables:**
   - Click on the collection name
   - Go to "Variables" tab
   - Update `baseUrl` if needed (default: `http://localhost:5000/api`)

3. **Run in sequence:**
   - Authentication → Register User (saves token automatically)
   - Address Management → Create Address (saves address ID automatically)
   - Order Management → Create Order with Mug
   - Check order details

### Method 3: Using cURL

Copy commands from `ORDER_API_CURL_EXAMPLES.md` and replace placeholders:

```bash
# 1. Register
curl -X POST http://localhost:5000/api/users/register ...

# 2. Create Address (replace YOUR_TOKEN_HERE)
curl -X POST http://localhost:5000/api/addresses ...

# 3. Create Order (replace YOUR_TOKEN_HERE and address ID)
curl -X POST http://localhost:5000/api/orders ...
```

---

## 📝 Sample Data Examples

### Example 1: Order with Mug Customization

```json
{
  "items": [
    {
      "productId": "65a1b2c3d4e5f6789abcdef2",
      "productName": "Personalized Mug - 'Raja'",
      "quantity": 2,
      "price": 599,
      "isMug": true,
      "bikeNumber": "MH12AB3456"
    }
  ],
  "shippingAddressId": "65a1b2c3d4e5f6789abcdef1",
  "paymentMethod": "phonepe"
}
```

**Response includes:**
- Order with auto-generated mug serials: `MH12AB3456-001, MH12AB3456-002`
- PhonePe payment request with transaction ID
- Total amount calculation (items + ₹50 shipping)

---

### Example 2: Multiple Items Order

```json
{
  "items": [
    {
      "productId": "mug_personalized_001",
      "productName": "Personalized Mug - 'King'",
      "quantity": 2,
      "price": 599,
      "isMug": true,
      "bikeNumber": "DL05AB6789"
    },
    {
      "productId": "mug_set_001",
      "productName": "Premium Coffee Mug Set",
      "quantity": 1,
      "price": 1299
    },
    {
      "productId": "mug_travel_001",
      "productName": "Insulated Travel Mug",
      "quantity": 1,
      "price": 899
    }
  ],
  "shippingAddressId": "YOUR_ADDRESS_ID",
  "paymentMethod": "phonepe"
}
```

**Calculation:**
- Item 1: 2 × ₹599 = ₹1,198
- Item 2: 1 × ₹1,299 = ₹1,299
- Item 3: 1 × ₹899 = ₹899
- **Subtotal:** ₹3,396
- **Shipping:** ₹0 (order > ₹1,000)
- **Total:** ₹3,396

---

### Example 3: Small Order (with shipping charges)

```json
{
  "items": [
    {
      "productId": "mug_regular_001",
      "productName": "Ceramic Mug - Blue",
      "quantity": 1,
      "price": 450
    }
  ],
  "shippingAddressId": "YOUR_ADDRESS_ID",
  "paymentMethod": "phonepe"
}
```

**Calculation:**
- Item: 1 × ₹450 = ₹450
- **Shipping:** ₹50 (order < ₹1,000)
- **Total:** ₹500

---

## 🔑 Required API Endpoints

### Authentication
```
POST /api/users/register
POST /api/users/login
```

### Address Management
```
POST /api/addresses       - Create address
GET  /api/addresses       - Get all addresses
```

### Order Management
```
POST /api/orders                    - Create order
GET  /api/orders                    - Get all orders
GET  /api/orders/:id                - Get single order
POST /api/orders/:id/payment/phonepe - Initiate payment
```

---

## 💰 Pricing Logic

### Shipping Charges
- Orders < ₹1,000: ₹50 shipping
- Orders ≥ ₹1,000: Free shipping

### Mug Serial Generation
- Generated only for items with `isMug: true` and `bikeNumber` provided
- Format: `{BIKE_NUMBER}-{SEQUENTIAL_NUMBER}`
- Example: `MH12AB3456-001`, `MH12AB3456-002`

---

## 🧪 Testing Checklist

### Pre-Testing
- [ ] Server is running on `http://localhost:5000`
- [ ] MongoDB is connected
- [ ] Environment variables are set (`.env` file)

### Test Flow
- [ ] Register or login user
- [ ] Get authentication token
- [ ] Create complete user profile
- [ ] Create shipping address
- [ ] Create order with `phonepe` payment method
- [ ] Verify order details
- [ ] Check mug serial generation (if applicable)
- [ ] Verify payment request generation

---

## 📦 Order Response Structure

### Successful Order Creation
```json
{
  "success": true,
  "message": "Order created successfully. Payment request generated.",
  "data": {
    "order": {
      "_id": "Order MongoDB ID",
      "orderNumber": "ORD-1705312200123-456",
      "user": "User MongoDB ID",
      "items": [...],
      "shippingAddress": {...},
      "paymentDetails": {
        "method": "phonepe",
        "status": "pending",
        "amount": 2547,
        "phonepeTransactionId": "TXN_..."
      },
      "totalAmount": 2497,
      "shippingCharges": 50,
      "finalAmount": 2547,
      "orderStatus": "pending"
    },
    "paymentRequest": {
      "merchantTransactionId": "TXN_...",
      "payload": {...},
      "checksum": "...",
      "url": "https://api-preprod.phonepe.com/..."
    }
  }
}
```

---

## 🔧 Configuration

### PhonePe Settings
PhonePe is already configured in `src/controllers/orderController.js`:
- Merchant ID: `TEST-M232K2YCXHM8V_25102`
- Salt Key: `NTE4ZWE4ODItNTM5OC00MDMxLTgwZmItOGU1MTIzNTM4NjJh`
- Base URL: `https://api-preprod.phonepe.com/apis/pg-sandbox` (sandbox)

### Environment Variables Required
```env
# Required
MONGODB_URI=mongodb://localhost:27017/jananayagan
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d

# PhonePe
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

---

## 🐛 Common Issues

### Issue 1: "Shipping address not found"
**Solution:** Verify the address ID exists and belongs to the logged-in user.

### Issue 2: "Order items are required"
**Solution:** Ensure the `items` array is not empty and contains valid items.

### Issue 3: "Profile not complete"
**Solution:** Complete the user profile before creating orders (required for payment protection).

### Issue 4: Authentication error
**Solution:** Check if the JWT token is valid and not expired. Re-login if needed.

---

## 📊 Order Status Flow

```
pending → confirmed → processing → shipped → delivered
         ↓
      cancelled (if cancelled)
```

### Payment Status
```
pending → completed (success)
       → failed (failure)
```

---

## 🔐 Security Features

1. **Authentication Required:** All endpoints require valid JWT token
2. **Payment Protection:** Order creation requires complete user profile
3. **Address Validation:** Only user's own addresses can be used
4. **Checksum Validation:** PhonePe callbacks are validated with checksums

---

## 📚 Additional Resources

- **Complete Documentation:** See `ORDER_AND_PAYMENT_API.md`
- **cURL Examples:** See `ORDER_API_CURL_EXAMPLES.md`
- **Postman Collection:** Import `Order_PhonePe_API.postman_collection.json`
- **Automated Tests:** Run `node test_order_api.js`

---

## 🎯 Quick Test Data

### User Registration
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh.kumar@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123!"
}
```

### Address Creation
```json
{
  "type": "home",
  "isDefault": true,
  "fullName": "Rajesh Kumar",
  "phone": "+919876543210",
  "addressLine1": "123, Building A, Sector 5",
  "city": "Mumbai",
  "state": "Maharashtra",
  "district": "Mumbai",
  "postalCode": "400001",
  "country": "India",
  "landmark": "Near XYZ Mall"
}
```

### Simple Order
```json
{
  "items": [
    {
      "productId": "65a1b2c3d4e5f6789abcdef2",
      "productName": "Ceramic Mug - Blue",
      "quantity": 1,
      "price": 450
    }
  ],
  "shippingAddressId": "YOUR_ADDRESS_ID",
  "paymentMethod": "phonepe"
}
```

---

## 📞 Support

For issues or questions:
1. Check server logs for errors
2. Verify MongoDB connection
3. Review environment variables
4. Check PhonePe sandbox credentials

---

**Created:** January 2024
**Version:** 1.0
**Last Updated:** 2024-01-15

