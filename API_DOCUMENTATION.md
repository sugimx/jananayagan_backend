

### Register User
- **POST** `/users/register`
- **Access**: Public
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isProfileComplete": true,
    "token": "jwt_token"
  }
}
```

### Login User
- **POST** `/users/login`
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get User Profile
- **GET** `/users/profile`
- **Access**: Private (requires authentication)

---

## Social Authentication

### Google Authentication
- **POST** `/auth/google`
- **Access**: Public
- **Body**:
```json
{
  "accessToken": "google_access_token"
}
```


### Link Social Account
- **POST** `/auth/link-social`
- **Access**: Private
- **Body**:
```json
{
  "provider": "google",
  "accessToken": "access_token"
}
```

---

## Profile Management

### Create Profile
- **POST** `/profiles`
- **Access**: Private
- **Required Fields**: All fields are required
- **Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "bio": "Optional bio"
}
```

### Get Profile
- **GET** `/profiles`
- **Access**: Private

### Update Profile
- **PUT** `/profiles`
- **Access**: Private

### Delete Profile
- **DELETE** `/profiles`
- **Access**: Private

---

## Address Management

### Create Address
- **POST** `/addresses`
- **Access**: Private
- **Required Fields**: fullName, phone, addressLine1, city, state, postalCode
- **Body**:
```json
{
  "type": "home",
  "isDefault": true,
  "fullName": "John Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "landmark": "Near Central Park",
  "instructions": "Ring doorbell twice"
}
```

### Get All Addresses
- **GET** `/addresses`
- **Access**: Private

### Get Single Address
- **GET** `/addresses/:id`
- **Access**: Private

### Update Address
- **PUT** `/addresses/:id`
- **Access**: Private

### Delete Address
- **DELETE** `/addresses/:id`
- **Access**: Private

### Set Default Address
- **PUT** `/addresses/:id/default`
- **Access**: Private

---

## Order Management

### Create Order
- **POST** `/orders`
- **Access**: Private (Payment Protection - requires authentication and complete profile)
- **Body**:
```json
{
  "items": [
    {
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 2,
      "price": 100
    }
  ],
  "shippingAddressId": "address_id",
  "paymentMethod": "phonepe"
}
```

### Create PhonePe Payment
- **POST** `/orders/:id/payment/phonepe`
- **Access**: Private (Payment Protection)

### PhonePe Callback
- **POST** `/orders/payment/phonepe/callback`
- **Access**: Public (used by PhonePe)

### Get User Orders
- **GET** `/orders`
- **Access**: Private
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by order status

### Get Single Order
- **GET** `/orders/:id`
- **Access**: Private

### Update Order Status
- **PUT** `/orders/:id/status`
- **Access**: Private
- **Body**:
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "TRK123456789",
  "notes": "Order shipped via FedEx"
}
```
---
