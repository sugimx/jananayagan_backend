# Giveway Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- PhonePe merchant account (for payment processing)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/giveway_backend

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for redirects)
   FRONTEND_URL=http://localhost:3000

   # Backend URL (for callbacks)
   BACKEND_URL=http://localhost:5000

   # PhonePe Configuration
   PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
   PHONEPE_SALT_KEY=your_phonepe_salt_key
   PHONEPE_SALT_INDEX=1
   PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret


   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=uploads
   ```

3. **Create Upload Directories**
   ```bash
   mkdir -p uploads/profile-pictures/user
   mkdir -p uploads/profile-pictures/buyer
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## API Testing

You can test the API using tools like Postman, Insomnia, or curl. Here are some example requests:

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create Profile (after login)
```bash
curl -X POST http://localhost:5000/api/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
  }'
```

### 4. Upload Profile Picture
```bash
curl -X POST http://localhost:5000/api/profile-pictures/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg"
```

## Features Implemented

### ✅ Authentication
- User registration with email/phone validation
- User login with JWT tokens
- Social authentication (Google)
- Password hashing with bcrypt

### ✅ Profile Management
- Profile creation after registration/social auth
- Profile picture upload with duplicate prevention
- Buyer profile picture upload (allows duplicates)
- Profile completion tracking

### ✅ Address Management
- Multiple address support per user
- Default address functionality
- Address CRUD operations

### ✅ Order Management
- Order creation with payment protection
- PhonePe payment integration
- Order history with pagination
- Order status tracking

### ✅ Security Features
- JWT-based authentication
- Password hashing
- File upload validation
- Duplicate profile picture prevention
- Payment protection middleware

## PhonePe Integration

The backend includes PhonePe payment gateway integration:

1. **Sandbox Environment**: Uses PhonePe's sandbox for testing
2. **Payment Flow**: 
   - Create order → Generate payment request → Process payment → Handle callback
3. **Webhook Support**: Automatic payment status updates via callbacks

## File Upload

- **User Profile Pictures**: Duplicate prevention enabled
- **Buyer Profile Pictures**: Duplicates allowed
- **Image Processing**: Automatic resizing to 300x300px
- **File Validation**: Only image files allowed, 5MB max size

## Database Schema

### User Model
- Basic user information
- Social authentication IDs
- Profile completion status
- Profile picture URL

### Profile Model
- Extended user profile information
- Profile pictures (user and buyer)
- Duplicate prevention for user profile pictures

### Address Model
- Multiple addresses per user
- Default address support
- Complete address information

### Order Model
- Order details and items
- Payment information
- Shipping address
- Order status tracking

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **JWT Token Error**
   - Ensure JWT_SECRET is set in .env file
   - Check token format in Authorization header

3. **File Upload Error**
   - Ensure upload directories exist
   - Check file size and format

4. **PhonePe Payment Error**
   - Verify PhonePe credentials in .env file
   - Check callback URL configuration

### Logs

The application logs important information to the console. Check the console output for debugging information.

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use a production MongoDB instance
3. Configure proper CORS settings
4. Set up proper file storage (AWS S3, etc.)
5. Use a reverse proxy (Nginx)
6. Enable HTTPS
7. Set up monitoring and logging

## Support

For issues or questions, check the API documentation in `API_ENDPOINTS.md` or review the code comments in the source files.
