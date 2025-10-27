# Order and PhonePe Payment Integration - Complete API Guide

This document provides detailed sample data and API examples for creating orders with PhonePe payment integration.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [API Flow](#api-flow)
4. [Detailed Sample Data](#detailed-sample-data)
5. [API Endpoints](#api-endpoints)
6. [Testing Guide](#testing-guide)

---

## Prerequisites

Before creating an order, ensure you have:
1. **User Account**: Registered and logged in user
2. **Profile**: Complete user profile created
3. **Address**: Shipping address saved in the system
4. **Authentication Token**: Valid JWT token from login

---

## Environment Setup

Make sure these environment variables are set in your `.env` file:

```env
# PhonePe Configuration
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

---

## API Flow

The complete order and payment flow:

```
1. User Registration → Login → Get Auth Token
2. Create Profile (if not created)
3. Create Address
4. Create Order with PhonePe Payment
5. PhonePe Payment Callback
6. Order Confirmation
```

---

## Detailed Sample Data

### 1. User Registration

**Endpoint:** `POST /api/users/register`

**Request:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh.kumar@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef0",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+919876543210",
    "role": "user",
    "isProfileComplete": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login

**Endpoint:** `POST /api/users/login`

**Request:**
```json
{
  "email": "rajesh.kumar@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef0",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save this token for subsequent requests!**

---

### 3. Create Profile

**Endpoint:** `POST /api/profiles`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

---

### 4. Create Shipping Address

**Endpoint:** `POST /api/addresses`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
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
  "landmark": "Near XYZ Mall, Opp. Metro Station"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef1",
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
    "landmark": "Near XYZ Mall, Opp. Metro Station",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Save the address `_id` for creating orders!**

---

### 5. Create Order with PhonePe Payment

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body Examples:**

#### Example 1: Order with Custom Mug (with Bike Number)

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
    },
    {
      "productId": "65a1b2c3d4e5f6789abcdef3",
      "productName": "Premium Coffee Mug Set",
      "quantity": 1,
      "price": 1299
    }
  ],
  "shippingAddressId": "65a1b2c3d4e5f6789abcdef1",
  "paymentMethod": "phonepe"
}
```

#### Example 2: Order without Mug Customization

```json
{
  "items": [
    {
      "productId": "65a1b2c3d4e5f6789abcdef4",
      "productName": "Ceramic Mug - Blue",
      "quantity": 3,
      "price": 450
    },
    {
      "productId": "65a1b2c3d4e5f6789abcdef5",
      "productName": "Insulated Travel Mug",
      "quantity": 1,
      "price": 899
    }
  ],
  "shippingAddressId": "65a1b2c3d4e5f6789abcdef1",
  "paymentMethod": "phonepe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully. Payment request generated.",
  "data": {
    "order": {
      "_id": "65a1b2c3d4e5f6789abcdef6",
      "orderNumber": "ORD-1705312200123-456",
      "user": "65a1b2c3d4e5f6789abcdef0",
      "items": [
        {
          "productId": "65a1b2c3d4e5f6789abcdef2",
          "productName": "Personalized Mug - 'Raja'",
          "quantity": 2,
          "price": 599,
          "totalPrice": 1198,
          "mugSerial": "MH12AB3456-001,MH12AB3456-002"
        },
        {
          "productId": "65a1b2c3d4e5f6789abcdef3",
          "productName": "Premium Coffee Mug Set",
          "quantity": 1,
          "price": 1299,
          "totalPrice": 1299
        }
      ],
      "shippingAddress": {
        "fullName": "Rajesh Kumar",
        "phone": "+919876543210",
        "addressLine1": "123, Building A, Sector 5",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400001",
        "country": "India",
        "landmark": "Near XYZ Mall, Opp. Metro Station"
      },
      "paymentDetails": {
        "method": "phonepe",
        "status": "pending",
        "amount": 2547,
        "currency": "INR",
        "phonepeTransactionId": "TXN_65a1b2c3d4e5f6789abcdef6_1705312200123"
      },
      "totalAmount": 2497,
      "shippingCharges": 50,
      "finalAmount": 2547,
      "orderStatus": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "paymentRequest": {
      "merchantTransactionId": "TXN_65a1b2c3d4e5f6789abcdef6_1705312200123",
      "payload": {
        "merchantId": "TEST-M232K2YCXHM8V_25102",
        "merchantTransactionId": "TXN_65a1b2c3d4e5f6789abcdef6_1705312200123",
        "merchantUserId": "65a1b2c3d4e5f6789abcdef0",
        "amount": 254700,
        "redirectUrl": "http://localhost:3000/payment/callback",
        "redirectMode": "POST",
        "callbackUrl": "http://localhost:5000/api/orders/payment/phonepe/callback",
        "mobileNumber": "+919876543210",
        "paymentInstrument": {
          "type": "PAY_PAGE"
        }
      },
      "checksum": "abc123def456...###1",
      "url": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
    }
  }
}
```

---

### 6. PhonePe Payment Request Details

When you receive the payment request response, you need to:

1. **Extract the payload and checksum**
2. **Send request to PhonePe payment URL**

**Payment Request Example:**

```bash
curl -X POST https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-VERIFY: YOUR_CHECKSUM_FROM_RESPONSE" \
  -d '{
    "request": "YOUR_BASE64_ENCODED_PAYLOAD"
  }'
```

Or in JavaScript/Postman:

```javascript
const paymentRequest = {
  request: Buffer.from(JSON.stringify(payload)).toString('base64')
};

fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-VERIFY': checksum
  },
  body: JSON.stringify(paymentRequest)
})
.then(response => response.json())
.then(data => {
  // Redirect user to data.instrumentResponse.redirectInfo.url
  console.log('Payment URL:', data.data.instrumentResponse.redirectInfo.url);
})
.catch(error => console.error('Error:', error));
```

---

### 7. Payment Callback Response

**PhonePe sends callback to:** `POST /api/orders/payment/phonepe/callback`

**PhonePe Callback Request:**
```json
{
  "response": "eyJzdGF0dXMiOiJTVUNDRVNTIiwicmVzcG9uc2VDb2RlIjoiUFNNQ0hfTVRDXzAwMDFfQT0wMDAwX0I9RkVFTCIsIm1lcmNoYW50VHJhbnNhY3Rpb25JZCI6IlRYTl9YSV8xNzA1MzEyMjAwMTIzIiwiYmFua1RyYW5zYWN0aW9uSWQiOiI1MDYyMTY1NjI2NTkwNzg2IiwiYW1vdW50IjowLjAxLCJ0eXBlIjoiREVCSUQiLCJsYXMiOiJTTiIsImluMDEyIjpudWxsLCJkZXZpY2VJZCI6bnVsbCwiY2FsbGJhY2tVUkwiOiJodHRwczovL2xvY2FsaG9zdDo0MDAwL2FwaS9wYXltZW50L2NhbGxiYWNrIiwiaXBhZGRyZXNzIjpudWxsLCJ1YVZpZCI6bnVsbCwiYmlsbGVyQXBwTmFtZSI6bnVsbCwiYmlsbGVyQWJsIjpudWxsLCJsYXN0VGltZXN0YW1wIjoiMTcwNTMxMjIwMDEyMyIsInN1YiI6bnVsbH0="
}
```

**After Payment Success, Order is automatically updated:**
- `paymentDetails.status` → `"completed"`
- `paymentDetails.transactionId` → PhonePe transaction ID
- `orderStatus` → `"confirmed"`

---

### 8. Get Order Details

**Endpoint:** `GET /api/orders/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef6",
    "orderNumber": "ORD-1705312200123-456",
    "user": "65a1b2c3d4e5f6789abcdef0",
    "items": [
      {
        "productId": "65a1b2c3d4e5f6789abcdef2",
        "productName": "Personalized Mug - 'Raja'",
        "quantity": 2,
        "price": 599,
        "totalPrice": 1198,
        "mugSerial": "MH12AB3456-001,MH12AB3456-002"
      }
    ],
    "shippingAddress": {
      "fullName": "Rajesh Kumar",
      "phone": "+919876543210",
      "addressLine1": "123, Building A, Sector 5",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India",
      "landmark": "Near XYZ Mall, Opp. Metro Station"
    },
    "paymentDetails": {
      "method": "phonepe",
      "status": "completed",
      "transactionId": "5062165626590786",
      "phonepeTransactionId": "TXN_65a1b2c3d4e5f6789abcdef6_1705312200123",
      "amount": 2547,
      "currency": "INR"
    },
    "orderStatus": "confirmed",
    "totalAmount": 2497,
    "shippingCharges": 50,
    "finalAmount": 2547,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## Complete Testing Guide with Postman/curl

### Step 1: Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+919876543210",
    "password": "SecurePass123!"
  }'
```

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh.kumar@example.com",
    "password": "SecurePass123!"
  }'
```

**Copy the `token` from response.**

### Step 3: Create Address
```bash
curl -X POST http://localhost:5000/api/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
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
  }'
```

**Copy the address `_id` from response.**

### Step 4: Create Order with PhonePe
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": "65a1b2c3d4e5f6789abcdef2",
        "productName": "Personalized Mug",
        "quantity": 2,
        "price": 599,
        "isMug": true,
        "bikeNumber": "MH12AB3456"
      }
    ],
    "shippingAddressId": "YOUR_ADDRESS_ID_HERE",
    "paymentMethod": "phonepe"
  }'
```

---

## Sample Order Items

### Mug with Bike Number Customization
```json
{
  "productId": "mug_custom_001",
  "productName": "Personalized Mug - Your Name",
  "quantity": 1,
  "price": 599,
  "isMug": true,
  "bikeNumber": "MH12AB3456"
}
```

### Regular Mug (No customization)
```json
{
  "productId": "mug_regular_001",
  "productName": "Premium Ceramic Mug",
  "quantity": 2,
  "price": 450
}
```

### Mug Set
```json
{
  "productId": "mug_set_001",
  "productName": "Premium Coffee Mug Set (4 pcs)",
  "quantity": 1,
  "price": 1299
}
```

---

## PhonePe Payment Flow

1. **User initiates payment** → Frontend creates order via API
2. **Backend generates payment request** → Returns PhonePe payment URL and data
3. **Frontend redirects to PhonePe** → User completes payment on PhonePe page
4. **PhonePe processes payment** → Sends callback to your backend
5. **Backend updates order** → Order status changes to "confirmed"
6. **User redirected back** → Frontend shows success/failure message

---

## Testing PhonePe Payment in Sandbox

### Test Cards (Sandbox Environment)

- **Success:** Use any card, Payment will succeed
- **Failure:** PhonePe may have test scenarios (check PhonePe documentation)

### Important Notes

1. **Amount Calculation:**
   - Order Subtotal: Sum of all items
   - Shipping Charges: ₹50 (if order < ₹1000), ₹0 (if order ≥ ₹1000)
   - Final Amount: Subtotal + Shipping Charges
   - PhonePe Amount: Final Amount × 100 (converted to paise)

2. **Order Status Flow:**
   ```
   pending → confirmed → processing → shipped → delivered
   ```

3. **Payment Status Flow:**
   ```
   pending → completed (or failed)
   ```

4. **Mug Serial Number:**
   - Generated automatically for mug products with bike number
   - Format: `{BIKE_NUMBER}-{SEQUENTIAL_NUMBER}`
   - Example: `MH12AB3456-001`, `MH12AB3456-002`

---

## Troubleshooting

### Common Issues

1. **"Shipping address not found"**
   - Ensure `shippingAddressId` is correct
   - Address must belong to logged-in user

2. **"Order items are required"**
   - Check items array is not empty
   - Validate all required fields are present

3. **"Payment method is required"**
   - Set `paymentMethod` to `"phonepe"`

4. **PhonePe payment not redirecting**
   - Check environment variables are set correctly
   - Verify merchant ID and salt key are correct

5. **"Profile not complete"**
   - Ensure user has completed profile creation
   - Check `isProfileComplete` field in user model

---

## API Request/Response Examples

### Get All Orders

**Endpoint:** `GET /api/orders?page=1&limit=10&status=confirmed`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "currentPage": 1,
  "totalPages": 2,
  "data": [...]
}
```

### Update Order Status (Admin)

**Endpoint:** `PUT /api/orders/:id/status`

**Request:**
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "DTDC1234567890",
  "notes": "Order dispatched via DTDC Express"
}
```

---

## Security Notes

1. **Authentication Required:** All order endpoints require valid JWT token
2. **Payment Protection:** Order creation and payment require complete profile
3. **Address Validation:** Shipping address must belong to the ordering user
4. **Checksum Verification:** PhonePe callbacks include checksum for security
5. **HTTPS in Production:** Always use HTTPS for payment callbacks in production

---

## Support

For any issues or questions:
- Check the order controller logs
- Verify database connection
- Ensure PhonePe credentials are correct
- Review PhonePe API documentation

---

**Last Updated:** January 2024
**API Version:** 1.0

