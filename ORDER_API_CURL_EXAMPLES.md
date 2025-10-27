# Order and PhonePe Payment API - cURL Examples

This file contains ready-to-use cURL commands for testing the Order and PhonePe Payment API.

## Prerequisites

1. Server must be running on `http://localhost:5000`
2. MongoDB must be connected
3. Copy and paste these commands into your terminal

---

## Step 1: Register a New User

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

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef0",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token from the response!**

---

## Step 2: Login (Alternative to Register)

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh.kumar@example.com",
    "password": "SecurePass123!"
  }'
```

**Replace the token in subsequent commands with the token from login/register response.**

---

## Step 3: Create Shipping Address

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
    "landmark": "Near XYZ Mall, Opp. Metro Station"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef1",
    "fullName": "Rajesh Kumar",
    "addressLine1": "123, Building A, Sector 5",
    "city": "Mumbai",
    ...
  }
}
```

**Save the address `_id` for creating orders!**

---

## Step 4: Create Order with PhonePe Payment

### Example 1: Order with Mug Customization (Bike Number)

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": "65a1b2c3d4e5f6789abcdef2",
        "productName": "Personalized Mug - Royal King",
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
  }'
```

### Example 2: Simple Order without Mug

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": "65a1b2c3d4e5f6789abcdef4",
        "productName": "Ceramic Mug - Blue",
        "quantity": 3,
        "price": 450
      }
    ],
    "shippingAddressId": "65a1b2c3d4e5f6789abcdef1",
    "paymentMethod": "phonepe"
  }'
```

### Example 3: Single Item Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": "mug_travel_001",
        "productName": "Insulated Travel Mug",
        "quantity": 1,
        "price": 899
      }
    ],
    "shippingAddressId": "YOUR_ADDRESS_ID_HERE",
    "paymentMethod": "phonepe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully. Payment request generated.",
  "data": {
    "order": {
      "_id": "65a1b2c3d4e5f6789abcdef6",
      "orderNumber": "ORD-1705312200123-456",
      "totalAmount": 2497,
      "shippingCharges": 50,
      "finalAmount": 2547,
      ...
    },
    "paymentRequest": {
      "merchantTransactionId": "TXN_65a1b2c3d4e5f6789abcdef6_1705312200123",
      "url": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      ...
    }
  }
}
```

---

## Step 5: Get All Orders

```bash
curl -X GET "http://localhost:5000/api/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

With filters:
```bash
# Get all confirmed orders
curl -X GET "http://localhost:5000/api/orders?status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get page 2 with 5 items per page
curl -X GET "http://localhost:5000/api/orders?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 6: Get Single Order Details

```bash
curl -X GET http://localhost:5000/api/orders/65a1b2c3d4e5f6789abcdef6 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 7: Create PhonePe Payment for Existing Order

```bash
curl -X POST http://localhost:5000/api/orders/65a1b2c3d4e5f6789abcdef6/payment/phonepe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Complete Test Script

Copy this entire script to test the complete flow:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000/api"
EMAIL="rajesh.kumar@example.com"
PASSWORD="SecurePass123!"

echo "🚀 Starting Order API Test"
echo "=========================="

# Step 1: Register User
echo -e "\n1️⃣ Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Rajesh Kumar\",
    \"email\": \"$EMAIL\",
    \"phone\": \"+919876543210\",
    \"password\": \"$PASSWORD\"
  }")

echo $REGISTER_RESPONSE | jq '.'

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
fi

echo "✅ Token: ${TOKEN:0:20}..."

# Step 2: Create Address
echo -e "\n2️⃣ Creating Address..."
ADDRESS_RESPONSE=$(curl -s -X POST "$BASE_URL/addresses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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
  }')

ADDRESS_ID=$(echo $ADDRESS_RESPONSE | jq -r '.data._id')
echo "✅ Address ID: $ADDRESS_ID"

# Step 3: Create Order
echo -e "\n3️⃣ Creating Order with PhonePe..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"items\": [
      {
        \"productId\": \"65a1b2c3d4e5f6789abcdef2\",
        \"productName\": \"Personalized Mug\",
        \"quantity\": 2,
        \"price\": 599,
        \"isMug\": true,
        \"bikeNumber\": \"MH12AB3456\"
      }
    ],
    \"shippingAddressId\": \"$ADDRESS_ID\",
    \"paymentMethod\": \"phonepe\"
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.order._id')
ORDER_NUMBER=$(echo $ORDER_RESPONSE | jq -r '.data.order.orderNumber')
FINAL_AMOUNT=$(echo $ORDER_RESPONSE | jq -r '.data.order.finalAmount')

echo "✅ Order Created:"
echo "   Order ID: $ORDER_ID"
echo "   Order Number: $ORDER_NUMBER"
echo "   Total Amount: ₹$FINAL_AMOUNT"

echo -e "\n✅ Test Complete!"
```

**Save as `test_order.sh` and run with:**
```bash
chmod +x test_order.sh
./test_order.sh
```

---

## Sample Order Item Data

### Mug with Bike Number
```json
{
  "productId": "mug_custom_001",
  "productName": "Personalized Mug - King",
  "quantity": 2,
  "price": 599,
  "isMug": true,
  "bikeNumber": "MH12AB3456"
}
```

### Regular Mug
```json
{
  "productId": "mug_regular_001",
  "productName": "Premium Ceramic Mug",
  "quantity": 1,
  "price": 450
}
```

### Mug Set
```json
{
  "productId": "mug_set_001",
  "productName": "Coffee Mug Set (4 pcs)",
  "quantity": 1,
  "price": 1299
}
```

---

## Troubleshooting

### Authentication Error
```
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Solution:** Ensure your token is valid and includes 'Bearer ' prefix.

### Address Not Found
```
{
  "success": false,
  "message": "Shipping address not found"
}
```

**Solution:** Verify the address ID exists and belongs to the logged-in user.

### Invalid Payment Method
```
{
  "success": false,
  "message": "Payment method is required"
}
```

**Solution:** Set `"paymentMethod": "phonepe"` in the request body.

---

## Response Examples

### Successful Order Creation
```json
{
  "success": true,
  "message": "Order created successfully. Payment request generated.",
  "data": {
    "order": {
      "_id": "65a1b2c3d4e5f6789abcdef6",
      "orderNumber": "ORD-1705312200123-456",
      "totalAmount": 2497,
      "shippingCharges": 50,
      "finalAmount": 2547,
      "orderStatus": "pending",
      "paymentDetails": {
        "method": "phonepe",
        "status": "pending",
        "amount": 2547
      }
    },
    "paymentRequest": {
      "merchantTransactionId": "TXN_65a1b2c3d4e5f6789abcdef6_1705312200123",
      "checksum": "...",
      "url": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
    }
  }
}
```

### Order List Response
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

---

**Note:** Replace `YOUR_TOKEN_HERE` and `YOUR_ADDRESS_ID` with actual values from previous API responses.

