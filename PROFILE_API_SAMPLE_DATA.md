# Profile API - Detailed Sample Data

Complete sample data with request bodies and responses for all profile endpoints.

---

## Table of Contents
1. [User Registration (Auto-creates Profile)](#user-registration)
2. [User Profile Operations](#user-profile-operations)
3. [Buyer Profile Operations](#buyer-profile-operations)
4. [Get All Profiles](#get-all-profiles)
5. [Complete Workflow Example](#complete-workflow-example)

---

## User Registration

### POST /api/users/register

**Request Body:**
```json
{
  "name": "Rajesh Kumar Sharma",
  "email": "rajesh.kumar@gmail.com",
  "phone": "+919876543210",
  "password": "SecurePass@123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "65f4a1a2c8d9e1234567890b",
    "name": "Rajesh Kumar Sharma",
    "email": "rajesh.kumar@gmail.com",
    "phone": "+919876543210",
    "role": "user",
    "isProfileComplete": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjRhMWEyYzhkOWUxMjM0NTY3ODkwYiIsImlhdCI6MTcxMDQ5NzYwMCwiZXhwIjoxNzEzMDg5NjAwfQ.8K7gH3mN9pQ2rS5tU6vW7xY8zA1bC2dE3fG4hI5jK6l"
  }
}
```

**Note:** User profile is automatically created with this data:
```json
{
  "user": "65f4a1a2c8d9e1234567890b",
  "profileType": "user",
  "name": "Rajesh Kumar Sharma",
  "phone": "+919876543210",
  "gmail": "rajesh.kumar@gmail.com",
  "status": "active",
  "dateOfBirth": null,
  "profileImage": null,
  "dist": "",
  "state": ""
}
```

---

## User Profile Operations

### 1. Get User Profile

**GET /api/profiles/user**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No Request Body**

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f4a3b2c8d9e1234567890a",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "user",
    "name": "Rajesh Kumar Sharma",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "profileImage": "https://storage.example.com/profiles/rajesh-profile.jpg",
    "phone": "+919876543210",
    "gmail": "rajesh.kumar@gmail.com",
    "status": "active",
    "dist": "Chennai",
    "state": "Tamil Nadu",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User profile not found"
}
```

---

### 2. Update User Profile

**PUT /api/profiles/user**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body - Full Update:**
```json
{
  "name": "Rajesh Kumar Sharma",
  "dateOfBirth": "1995-05-15",
  "profileImage": "https://storage.example.com/profiles/rajesh-updated.jpg",
  "phone": "+919876543211",
  "gmail": "rajesh.new@gmail.com",
  "status": "active",
  "dist": "Coimbatore",
  "state": "Tamil Nadu"
}
```

**Request Body - Partial Update (only name and district):**
```json
{
  "name": "Rajesh K Sharma",
  "dist": "Madurai"
}
```

**Request Body - Update Profile Image Only:**
```json
{
  "profileImage": "https://storage.example.com/profiles/rajesh-new-photo.jpg"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "65f4a3b2c8d9e1234567890a",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "user",
    "name": "Rajesh K Sharma",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "profileImage": "https://storage.example.com/profiles/rajesh-new-photo.jpg",
    "phone": "+919876543210",
    "gmail": "rajesh.kumar@gmail.com",
    "status": "active",
    "dist": "Madurai",
    "state": "Tamil Nadu",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-16T14:45:00.000Z"
  }
}
```

---

## Buyer Profile Operations

### 1. Create Buyer Profile

**POST /api/profiles/buyer**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body - Example 1 (Complete Profile):**
```json
{
  "name": "Priya Sharma",
  "dateOfBirth": "1998-08-20",
  "profileImage": "https://storage.example.com/buyers/priya-sharma.jpg",
  "phone": "+919988776655",
  "gmail": "priya.sharma@gmail.com",
  "status": "active",
  "dist": "Mumbai",
  "state": "Maharashtra"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Buyer profile created successfully",
  "data": {
    "_id": "65f4a3b2c8d9e1234567890c",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "buyer",
    "name": "Priya Sharma",
    "dateOfBirth": "1998-08-20T00:00:00.000Z",
    "profileImage": "https://storage.example.com/buyers/priya-sharma.jpg",
    "phone": "+919988776655",
    "gmail": "priya.sharma@gmail.com",
    "status": "active",
    "dist": "Mumbai",
    "state": "Maharashtra",
    "createdAt": "2024-03-16T11:00:00.000Z",
    "updatedAt": "2024-03-16T11:00:00.000Z"
  }
}
```

**Request Body - Example 2 (Minimal Profile):**
```json
{
  "name": "Amit Singh",
  "phone": "+919123456789",
  "gmail": "amit.singh@gmail.com"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Buyer profile created successfully",
  "data": {
    "_id": "65f4a3b2c8d9e1234567890d",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "buyer",
    "name": "Amit Singh",
    "dateOfBirth": null,
    "profileImage": null,
    "phone": "+919123456789",
    "gmail": "amit.singh@gmail.com",
    "status": "active",
    "dist": "",
    "state": "",
    "createdAt": "2024-03-16T12:00:00.000Z",
    "updatedAt": "2024-03-16T12:00:00.000Z"
  }
}
```

**Request Body - Example 3 (Business Profile):**
```json
{
  "name": "Sunita Enterprises",
  "dateOfBirth": "1985-12-10",
  "profileImage": "https://storage.example.com/buyers/sunita-business.jpg",
  "phone": "+919445566778",
  "gmail": "sunita.enterprises@gmail.com",
  "status": "active",
  "dist": "Bangalore",
  "state": "Karnataka"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Buyer profile created successfully",
  "data": {
    "_id": "65f4a3b2c8d9e1234567890e",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "buyer",
    "name": "Sunita Enterprises",
    "dateOfBirth": "1985-12-10T00:00:00.000Z",
    "profileImage": "https://storage.example.com/buyers/sunita-business.jpg",
    "phone": "+919445566778",
    "gmail": "sunita.enterprises@gmail.com",
    "status": "active",
    "dist": "Bangalore",
    "state": "Karnataka",
    "createdAt": "2024-03-16T13:30:00.000Z",
    "updatedAt": "2024-03-16T13:30:00.000Z"
  }
}
```

---

### 2. Get All Buyer Profiles

**GET /api/profiles/buyer**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No Request Body**

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f4a3b2c8d9e1234567890e",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "buyer",
      "name": "Sunita Enterprises",
      "dateOfBirth": "1985-12-10T00:00:00.000Z",
      "profileImage": "https://storage.example.com/buyers/sunita-business.jpg",
      "phone": "+919445566778",
      "gmail": "sunita.enterprises@gmail.com",
      "status": "active",
      "dist": "Bangalore",
      "state": "Karnataka",
      "createdAt": "2024-03-16T13:30:00.000Z",
      "updatedAt": "2024-03-16T13:30:00.000Z"
    },
    {
      "_id": "65f4a3b2c8d9e1234567890d",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "buyer",
      "name": "Amit Singh",
      "dateOfBirth": null,
      "profileImage": null,
      "phone": "+919123456789",
      "gmail": "amit.singh@gmail.com",
      "status": "active",
      "dist": "",
      "state": "",
      "createdAt": "2024-03-16T12:00:00.000Z",
      "updatedAt": "2024-03-16T12:00:00.000Z"
    },
    {
      "_id": "65f4a3b2c8d9e1234567890c",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "buyer",
      "name": "Priya Sharma",
      "dateOfBirth": "1998-08-20T00:00:00.000Z",
      "profileImage": "https://storage.example.com/buyers/priya-sharma.jpg",
      "phone": "+919988776655",
      "gmail": "priya.sharma@gmail.com",
      "status": "active",
      "dist": "Mumbai",
      "state": "Maharashtra",
      "createdAt": "2024-03-16T11:00:00.000Z",
      "updatedAt": "2024-03-16T11:00:00.000Z"
    }
  ]
}
```

**Success Response - No Buyer Profiles (200 OK):**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

---

### 3. Update Buyer Profile

**PUT /api/profiles/buyer/:id**

Example: `PUT /api/profiles/buyer/65f4a3b2c8d9e1234567890c`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body - Full Update:**
```json
{
  "name": "Priya Sharma (Updated)",
  "dateOfBirth": "1998-08-20",
  "profileImage": "https://storage.example.com/buyers/priya-new.jpg",
  "phone": "+919988776656",
  "gmail": "priya.updated@gmail.com",
  "status": "inactive",
  "dist": "Pune",
  "state": "Maharashtra"
}
```

**Request Body - Partial Update (status only):**
```json
{
  "status": "inactive"
}
```

**Request Body - Update Name and Location:**
```json
{
  "name": "Priya S.",
  "dist": "Thane",
  "state": "Maharashtra"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Buyer profile updated successfully",
  "data": {
    "_id": "65f4a3b2c8d9e1234567890c",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "buyer",
    "name": "Priya S.",
    "dateOfBirth": "1998-08-20T00:00:00.000Z",
    "profileImage": "https://storage.example.com/buyers/priya-sharma.jpg",
    "phone": "+919988776655",
    "gmail": "priya.sharma@gmail.com",
    "status": "active",
    "dist": "Thane",
    "state": "Maharashtra",
    "createdAt": "2024-03-16T11:00:00.000Z",
    "updatedAt": "2024-03-17T09:15:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Buyer profile not found"
}
```

---

### 4. Delete Buyer Profile

**DELETE /api/profiles/buyer/:id**

Example: `DELETE /api/profiles/buyer/65f4a3b2c8d9e1234567890c`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No Request Body**

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Buyer profile deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Buyer profile not found"
}
```

---

## Get All Profiles

### GET /api/profiles/all

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No Request Body**

**Success Response (200 OK) - With Multiple Buyer Profiles:**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f4a3b2c8d9e1234567890a",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "user",
      "name": "Rajesh Kumar Sharma",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "profileImage": "https://storage.example.com/profiles/rajesh-profile.jpg",
      "phone": "+919876543210",
      "gmail": "rajesh.kumar@gmail.com",
      "status": "active",
      "dist": "Chennai",
      "state": "Tamil Nadu",
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    },
    "buyerProfiles": [
      {
        "_id": "65f4a3b2c8d9e1234567890e",
        "user": "65f4a1a2c8d9e1234567890b",
        "profileType": "buyer",
        "name": "Sunita Enterprises",
        "dateOfBirth": "1985-12-10T00:00:00.000Z",
        "profileImage": "https://storage.example.com/buyers/sunita-business.jpg",
        "phone": "+919445566778",
        "gmail": "sunita.enterprises@gmail.com",
        "status": "active",
        "dist": "Bangalore",
        "state": "Karnataka",
        "createdAt": "2024-03-16T13:30:00.000Z",
        "updatedAt": "2024-03-16T13:30:00.000Z"
      },
      {
        "_id": "65f4a3b2c8d9e1234567890d",
        "user": "65f4a1a2c8d9e1234567890b",
        "profileType": "buyer",
        "name": "Amit Singh",
        "dateOfBirth": null,
        "profileImage": null,
        "phone": "+919123456789",
        "gmail": "amit.singh@gmail.com",
        "status": "active",
        "dist": "Delhi",
        "state": "Delhi",
        "createdAt": "2024-03-16T12:00:00.000Z",
        "updatedAt": "2024-03-16T12:00:00.000Z"
      },
      {
        "_id": "65f4a3b2c8d9e1234567890c",
        "user": "65f4a1a2c8d9e1234567890b",
        "profileType": "buyer",
        "name": "Priya Sharma",
        "dateOfBirth": "1998-08-20T00:00:00.000Z",
        "profileImage": "https://storage.example.com/buyers/priya-sharma.jpg",
        "phone": "+919988776655",
        "gmail": "priya.sharma@gmail.com",
        "status": "active",
        "dist": "Mumbai",
        "state": "Maharashtra",
        "createdAt": "2024-03-16T11:00:00.000Z",
        "updatedAt": "2024-03-16T11:00:00.000Z"
      }
    ],
    "totalBuyerProfiles": 3
  }
}
```

**Success Response - No Buyer Profiles:**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f4a3b2c8d9e1234567890a",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "user",
      "name": "Rajesh Kumar Sharma",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "profileImage": "https://storage.example.com/profiles/rajesh-profile.jpg",
      "phone": "+919876543210",
      "gmail": "rajesh.kumar@gmail.com",
      "status": "active",
      "dist": "Chennai",
      "state": "Tamil Nadu",
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    },
    "buyerProfiles": [],
    "totalBuyerProfiles": 0
  }
}
```

---

## Complete Workflow Example

### Scenario: User creates account and adds 2 buyer profiles

#### Step 1: User Registration
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "Arun Patel",
  "email": "arun.patel@gmail.com",
  "phone": "+919876501234",
  "password": "ArunPass@2024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "65f5b2c3d9e0f2345678901a",
    "name": "Arun Patel",
    "email": "arun.patel@gmail.com",
    "phone": "+919876501234",
    "role": "user",
    "isProfileComplete": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjViMmMzZDllMGYyMzQ1Njc4OTAxYSIsImlhdCI6MTcxMDUwMDAwMCwiZXhwIjoxNzEzMDkyMDAwfQ.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
  }
}
```

---

#### Step 2: Get All Profiles (Initially only user profile)
```bash
GET /api/profiles/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f5b3d4e0f1g3456789012b",
      "user": "65f5b2c3d9e0f2345678901a",
      "profileType": "user",
      "name": "Arun Patel",
      "dateOfBirth": null,
      "profileImage": null,
      "phone": "+919876501234",
      "gmail": "arun.patel@gmail.com",
      "status": "active",
      "dist": "",
      "state": "",
      "createdAt": "2024-03-18T10:00:00.000Z",
      "updatedAt": "2024-03-18T10:00:00.000Z"
    },
    "buyerProfiles": [],
    "totalBuyerProfiles": 0
  }
}
```

---

#### Step 3: Update User Profile with Complete Information
```bash
PUT /api/profiles/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Arun Kumar Patel",
  "dateOfBirth": "1992-03-25",
  "profileImage": "https://storage.example.com/profiles/arun-patel.jpg",
  "dist": "Ahmedabad",
  "state": "Gujarat"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "65f5b3d4e0f1g3456789012b",
    "user": "65f5b2c3d9e0f2345678901a",
    "profileType": "user",
    "name": "Arun Kumar Patel",
    "dateOfBirth": "1992-03-25T00:00:00.000Z",
    "profileImage": "https://storage.example.com/profiles/arun-patel.jpg",
    "phone": "+919876501234",
    "gmail": "arun.patel@gmail.com",
    "status": "active",
    "dist": "Ahmedabad",
    "state": "Gujarat",
    "createdAt": "2024-03-18T10:00:00.000Z",
    "updatedAt": "2024-03-18T10:15:00.000Z"
  }
}
```

---

#### Step 4: Create First Buyer Profile
```bash
POST /api/profiles/buyer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Meera Reddy",
  "dateOfBirth": "1995-07-18",
  "profileImage": "https://storage.example.com/buyers/meera-reddy.jpg",
  "phone": "+919988112233",
  "gmail": "meera.reddy@gmail.com",
  "status": "active",
  "dist": "Hyderabad",
  "state": "Telangana"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buyer profile created successfully",
  "data": {
    "_id": "65f5b4e5f1g2h4567890123c",
    "user": "65f5b2c3d9e0f2345678901a",
    "profileType": "buyer",
    "name": "Meera Reddy",
    "dateOfBirth": "1995-07-18T00:00:00.000Z",
    "profileImage": "https://storage.example.com/buyers/meera-reddy.jpg",
    "phone": "+919988112233",
    "gmail": "meera.reddy@gmail.com",
    "status": "active",
    "dist": "Hyderabad",
    "state": "Telangana",
    "createdAt": "2024-03-18T11:00:00.000Z",
    "updatedAt": "2024-03-18T11:00:00.000Z"
  }
}
```

---

#### Step 5: Create Second Buyer Profile
```bash
POST /api/profiles/buyer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Vikram Industries",
  "dateOfBirth": "1988-11-30",
  "profileImage": "https://storage.example.com/buyers/vikram-industries.jpg",
  "phone": "+919123998877",
  "gmail": "vikram.industries@gmail.com",
  "status": "active",
  "dist": "Surat",
  "state": "Gujarat"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buyer profile created successfully",
  "data": {
    "_id": "65f5b5f6g2h3i5678901234d",
    "user": "65f5b2c3d9e0f2345678901a",
    "profileType": "buyer",
    "name": "Vikram Industries",
    "dateOfBirth": "1988-11-30T00:00:00.000Z",
    "profileImage": "https://storage.example.com/buyers/vikram-industries.jpg",
    "phone": "+919123998877",
    "gmail": "vikram.industries@gmail.com",
    "status": "active",
    "dist": "Surat",
    "state": "Gujarat",
    "createdAt": "2024-03-18T12:00:00.000Z",
    "updatedAt": "2024-03-18T12:00:00.000Z"
  }
}
```

---

#### Step 6: Get All Profiles (Now with 2 buyer profiles)
```bash
GET /api/profiles/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f5b3d4e0f1g3456789012b",
      "user": "65f5b2c3d9e0f2345678901a",
      "profileType": "user",
      "name": "Arun Kumar Patel",
      "dateOfBirth": "1992-03-25T00:00:00.000Z",
      "profileImage": "https://storage.example.com/profiles/arun-patel.jpg",
      "phone": "+919876501234",
      "gmail": "arun.patel@gmail.com",
      "status": "active",
      "dist": "Ahmedabad",
      "state": "Gujarat",
      "createdAt": "2024-03-18T10:00:00.000Z",
      "updatedAt": "2024-03-18T10:15:00.000Z"
    },
    "buyerProfiles": [
      {
        "_id": "65f5b5f6g2h3i5678901234d",
        "user": "65f5b2c3d9e0f2345678901a",
        "profileType": "buyer",
        "name": "Vikram Industries",
        "dateOfBirth": "1988-11-30T00:00:00.000Z",
        "profileImage": "https://storage.example.com/buyers/vikram-industries.jpg",
        "phone": "+919123998877",
        "gmail": "vikram.industries@gmail.com",
        "status": "active",
        "dist": "Surat",
        "state": "Gujarat",
        "createdAt": "2024-03-18T12:00:00.000Z",
        "updatedAt": "2024-03-18T12:00:00.000Z"
      },
      {
        "_id": "65f5b4e5f1g2h4567890123c",
        "user": "65f5b2c3d9e0f2345678901a",
        "profileType": "buyer",
        "name": "Meera Reddy",
        "dateOfBirth": "1995-07-18T00:00:00.000Z",
        "profileImage": "https://storage.example.com/buyers/meera-reddy.jpg",
        "phone": "+919988112233",
        "gmail": "meera.reddy@gmail.com",
        "status": "active",
        "dist": "Hyderabad",
        "state": "Telangana",
        "createdAt": "2024-03-18T11:00:00.000Z",
        "updatedAt": "2024-03-18T11:00:00.000Z"
      }
    ],
    "totalBuyerProfiles": 2
  }
}
```

---

#### Step 7: Update First Buyer Profile (Mark as Inactive)
```bash
PUT /api/profiles/buyer/65f5b4e5f1g2h4567890123c
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buyer profile updated successfully",
  "data": {
    "_id": "65f5b4e5f1g2h4567890123c",
    "user": "65f5b2c3d9e0f2345678901a",
    "profileType": "buyer",
    "name": "Meera Reddy",
    "dateOfBirth": "1995-07-18T00:00:00.000Z",
    "profileImage": "https://storage.example.com/buyers/meera-reddy.jpg",
    "phone": "+919988112233",
    "gmail": "meera.reddy@gmail.com",
    "status": "inactive",
    "dist": "Hyderabad",
    "state": "Telangana",
    "createdAt": "2024-03-18T11:00:00.000Z",
    "updatedAt": "2024-03-18T14:30:00.000Z"
  }
}
```

---

#### Step 8: Get Only Buyer Profiles
```bash
GET /api/profiles/buyer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f5b5f6g2h3i5678901234d",
      "user": "65f5b2c3d9e0f2345678901a",
      "profileType": "buyer",
      "name": "Vikram Industries",
      "dateOfBirth": "1988-11-30T00:00:00.000Z",
      "profileImage": "https://storage.example.com/buyers/vikram-industries.jpg",
      "phone": "+919123998877",
      "gmail": "vikram.industries@gmail.com",
      "status": "active",
      "dist": "Surat",
      "state": "Gujarat",
      "createdAt": "2024-03-18T12:00:00.000Z",
      "updatedAt": "2024-03-18T12:00:00.000Z"
    },
    {
      "_id": "65f5b4e5f1g2h4567890123c",
      "user": "65f5b2c3d9e0f2345678901a",
      "profileType": "buyer",
      "name": "Meera Reddy",
      "dateOfBirth": "1995-07-18T00:00:00.000Z",
      "profileImage": "https://storage.example.com/buyers/meera-reddy.jpg",
      "phone": "+919988112233",
      "gmail": "meera.reddy@gmail.com",
      "status": "inactive",
      "dist": "Hyderabad",
      "state": "Telangana",
      "createdAt": "2024-03-18T11:00:00.000Z",
      "updatedAt": "2024-03-18T14:30:00.000Z"
    }
  ]
}
```

---

#### Step 9: Delete Inactive Buyer Profile
```bash
DELETE /api/profiles/buyer/65f5b4e5f1g2h4567890123c
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Buyer profile deleted successfully"
}
```

---

#### Step 10: Final Check - Get All Profiles
```bash
GET /api/profiles/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f5b3d4e0f1g3456789012b",
      "user": "65f5b2c3d9e0f2345678901a",
      "profileType": "user",
      "name": "Arun Kumar Patel",
      "dateOfBirth": "1992-03-25T00:00:00.000Z",
      "profileImage": "https://storage.example.com/profiles/arun-patel.jpg",
      "phone": "+919876501234",
      "gmail": "arun.patel@gmail.com",
      "status": "active",
      "dist": "Ahmedabad",
      "state": "Gujarat",
      "createdAt": "2024-03-18T10:00:00.000Z",
      "updatedAt": "2024-03-18T10:15:00.000Z"
    },
    "buyerProfiles": [
      {
        "_id": "65f5b5f6g2h3i5678901234d",
        "user": "65f5b2c3d9e0f2345678901a",
        "profileType": "buyer",
        "name": "Vikram Industries",
        "dateOfBirth": "1988-11-30T00:00:00.000Z",
        "profileImage": "https://storage.example.com/buyers/vikram-industries.jpg",
        "phone": "+919123998877",
        "gmail": "vikram.industries@gmail.com",
        "status": "active",
        "dist": "Surat",
        "state": "Gujarat",
        "createdAt": "2024-03-18T12:00:00.000Z",
        "updatedAt": "2024-03-18T12:00:00.000Z"
      }
    ],
    "totalBuyerProfiles": 1
  }
}
```

---

## Error Responses

### 401 Unauthorized (Missing or Invalid Token)
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Phone number already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

---

## Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | String | No | Full name | "Rajesh Kumar Sharma" |
| `dateOfBirth` | Date/String | No | Birth date (ISO format or YYYY-MM-DD) | "1995-05-15" |
| `profileImage` | String | No | Profile image URL | "https://example.com/image.jpg" |
| `phone` | String | No | Phone number with country code | "+919876543210" |
| `gmail` | String | No | Email address | "user@gmail.com" |
| `status` | String | No | Profile status | "active", "inactive", "pending", "suspended" |
| `dist` | String | No | District/City | "Chennai", "Mumbai" |
| `state` | String | No | State/Province | "Tamil Nadu", "Maharashtra" |

---

## Notes

1. **All fields are optional** in update requests - only send fields you want to update
2. **Phone and email must be unique** across all profiles (or can be empty)
3. **Dates can be in ISO format** or simple YYYY-MM-DD format
4. **Profile images should be URLs** to stored images (not base64)
5. **Status values** are enum: 'active', 'inactive', 'pending', 'suspended'
6. **Token is required** in Authorization header for all profile endpoints
7. **Buyer profiles are sorted** by creation date (newest first)

