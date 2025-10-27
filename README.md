# Giveway Backend API

A Node.js/Express backend API for the Giveway application.

## Features

- RESTful API architecture
- MongoDB database integration
- JWT authentication
- User registration and login
- Password hashing with bcrypt
- Environment-based configuration
- Error handling middleware
- CORS enabled

## Project Structure

```
Giveway_Backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/
│   │   └── userController.js # User business logic
│   ├── middleware/
│   │   └── authMiddleware.js # JWT authentication
│   ├── models/
│   │   └── User.js           # User model
│   ├── routes/
│   │   └── userRoutes.js     # User routes
│   └── server.js             # Entry point
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Giveway_Backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/giveway_db
JWT_SECRET=your_secret_key_here
```

5. Start the development server
```bash
npm run dev
```

Or for production:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (Protected)

### Request Examples

### 📦 Order and PhonePe Payment API

### Quick Links
- **[Complete API Documentation](./ORDER_AND_PAYMENT_API.md)** - Detailed API documentation with sample data
- **[cURL Examples](./ORDER_API_CURL_EXAMPLES.md)** - Ready-to-use cURL commands
- **[Usage Guide](./USAGE_GUIDE.md)** - Quick start guide
- **[Postman Collection](./Order_PhonePe_API.postman_collection.json)** - Import to Postman for testing

### Quick Start
```bash
# Run automated test
node test_order_api.js

# Or use cURL commands from ORDER_API_CURL_EXAMPLES.md
# Or import Postman collection
```

---

### Register User
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```json
POST /api/users/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/users/profile
Headers: {
  "Authorization": "Bearer <your_token>"
}
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## License

ISC

