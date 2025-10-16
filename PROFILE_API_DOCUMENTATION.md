# Profile API Documentation

This API supports two types of profiles:
1. **User Profile** - One per user (automatically created on signup)
2. **Buyer Profiles** - Multiple buyer profiles per user

---

## Table of Contents
- [User Profile Endpoints](#user-profile-endpoints)
- [Buyer Profile Endpoints](#buyer-profile-endpoints)
- [Get All Profiles](#get-all-profiles)
- [Sample Data & Examples](#sample-data--examples)

---

## User Profile Endpoints

### 1. Get User Profile

Get the main user profile.

**Endpoint:** `GET /api/profiles/user`

**Access:** Private (Requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f4a3b2c8d9e1234567890a",
    "user": "65f4a1a2c8d9e1234567890b",
    "profileType": "user",
    "name": "Rajesh Kumar",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "profileImage": "https://example.com/images/profile.jpg",
    "phone": "+919876543210",
    "gmail": "rajesh@gmail.com",
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

Update the main user profile.

**Endpoint:** `PUT /api/profiles/user`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Rajesh Kumar Sharma",
  "dateOfBirth": "1995-05-15",
  "profileImage": "https://example.com/images/new-profile.jpg",
  "phone": "+919876543211",
  "gmail": "rajesh.new@gmail.com",
  "status": "active",
  "dist": "Coimbatore",
  "state": "Tamil Nadu"
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
    "name": "Rajesh Kumar Sharma",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "profileImage": "https://example.com/images/new-profile.jpg",
    "phone": "+919876543211",
    "gmail": "rajesh.new@gmail.com",
    "status": "active",
    "dist": "Coimbatore",
    "state": "Tamil Nadu",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T14:30:00.000Z"
  }
}
```

---

## Buyer Profile Endpoints

### 1. Create Buyer Profile

Create a new buyer profile. You can create multiple buyer profiles.

**Endpoint:** `POST /api/profiles/buyer`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "dateOfBirth": "1998-08-20",
  "profileImage": "https://example.com/images/priya.jpg",
  "phone": "+919988776655",
  "gmail": "priya@gmail.com",
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
    "profileImage": "https://example.com/images/priya.jpg",
    "phone": "+919988776655",
    "gmail": "priya@gmail.com",
    "status": "active",
    "dist": "Mumbai",
    "state": "Maharashtra",
    "createdAt": "2024-03-15T11:00:00.000Z",
    "updatedAt": "2024-03-15T11:00:00.000Z"
  }
}
```

---

### 2. Get All Buyer Profiles

Get all buyer profiles for the authenticated user.

**Endpoint:** `GET /api/profiles/buyer`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f4a3b2c8d9e1234567890d",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "buyer",
      "name": "Amit Singh",
      "dateOfBirth": "2000-03-10T00:00:00.000Z",
      "profileImage": "https://example.com/images/amit.jpg",
      "phone": "+919123456789",
      "gmail": "amit@gmail.com",
      "status": "active",
      "dist": "Delhi",
      "state": "Delhi",
      "createdAt": "2024-03-15T12:00:00.000Z",
      "updatedAt": "2024-03-15T12:00:00.000Z"
    },
    {
      "_id": "65f4a3b2c8d9e1234567890c",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "buyer",
      "name": "Priya Sharma",
      "dateOfBirth": "1998-08-20T00:00:00.000Z",
      "profileImage": "https://example.com/images/priya.jpg",
      "phone": "+919988776655",
      "gmail": "priya@gmail.com",
      "status": "active",
      "dist": "Mumbai",
      "state": "Maharashtra",
      "createdAt": "2024-03-15T11:00:00.000Z",
      "updatedAt": "2024-03-15T11:00:00.000Z"
    }
  ]
}
```

---

### 3. Update Buyer Profile

Update a specific buyer profile by ID.

**Endpoint:** `PUT /api/profiles/buyer/:id`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - Buyer profile ID

**Request Body:**
```json
{
  "name": "Priya Sharma Updated",
  "phone": "+919988776656",
  "status": "inactive"
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
    "name": "Priya Sharma Updated",
    "dateOfBirth": "1998-08-20T00:00:00.000Z",
    "profileImage": "https://example.com/images/priya.jpg",
    "phone": "+919988776656",
    "gmail": "priya@gmail.com",
    "status": "inactive",
    "dist": "Mumbai",
    "state": "Maharashtra",
    "createdAt": "2024-03-15T11:00:00.000Z",
    "updatedAt": "2024-03-15T13:30:00.000Z"
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

Delete a specific buyer profile by ID.

**Endpoint:** `DELETE /api/profiles/buyer/:id`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Buyer profile ID

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

### Get All Profiles (User + Buyer Profiles)

Get the user profile and all buyer profiles in one request.

**Endpoint:** `GET /api/profiles/all`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f4a3b2c8d9e1234567890a",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "user",
      "name": "Rajesh Kumar",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "profileImage": "https://example.com/images/profile.jpg",
      "phone": "+919876543210",
      "gmail": "rajesh@gmail.com",
      "status": "active",
      "dist": "Chennai",
      "state": "Tamil Nadu",
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    },
    "buyerProfiles": [
      {
        "_id": "65f4a3b2c8d9e1234567890d",
        "user": "65f4a1a2c8d9e1234567890b",
        "profileType": "buyer",
        "name": "Amit Singh",
        "dateOfBirth": "2000-03-10T00:00:00.000Z",
        "profileImage": "https://example.com/images/amit.jpg",
        "phone": "+919123456789",
        "gmail": "amit@gmail.com",
        "status": "active",
        "dist": "Delhi",
        "state": "Delhi",
        "createdAt": "2024-03-15T12:00:00.000Z",
        "updatedAt": "2024-03-15T12:00:00.000Z"
      },
      {
        "_id": "65f4a3b2c8d9e1234567890c",
        "user": "65f4a1a2c8d9e1234567890b",
        "profileType": "buyer",
        "name": "Priya Sharma",
        "dateOfBirth": "1998-08-20T00:00:00.000Z",
        "profileImage": "https://example.com/images/priya.jpg",
        "phone": "+919988776655",
        "gmail": "priya@gmail.com",
        "status": "active",
        "dist": "Mumbai",
        "state": "Maharashtra",
        "createdAt": "2024-03-15T11:00:00.000Z",
        "updatedAt": "2024-03-15T11:00:00.000Z"
      }
    ],
    "totalBuyerProfiles": 2
  }
}
```

---

## Sample Data & Examples

### Complete User Flow Example

#### Step 1: User Signup (Auto-creates user profile)

```bash
curl -X POST https://your-api.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@gmail.com",
    "phone": "+919876543210",
    "password": "securePass123"
  }'
```

**Response:** Returns user data with token. User profile is automatically created.

---

#### Step 2: Get All Profiles

```bash
curl -X GET https://your-api.com/api/profiles/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userProfile": {
      "_id": "65f4a3b2c8d9e1234567890a",
      "user": "65f4a1a2c8d9e1234567890b",
      "profileType": "user",
      "name": "Rajesh Kumar",
      "phone": "+919876543210",
      "gmail": "rajesh@gmail.com",
      "status": "active"
    },
    "buyerProfiles": [],
    "totalBuyerProfiles": 0
  }
}
```

---

#### Step 3: Create First Buyer Profile

```bash
curl -X POST https://your-api.com/api/profiles/buyer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "dateOfBirth": "1998-08-20",
    "profileImage": "https://example.com/images/priya.jpg",
    "phone": "+919988776655",
    "gmail": "priya@gmail.com",
    "dist": "Mumbai",
    "state": "Maharashtra"
  }'
```

---

#### Step 4: Create Second Buyer Profile

```bash
curl -X POST https://your-api.com/api/profiles/buyer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amit Singh",
    "dateOfBirth": "2000-03-10",
    "profileImage": "https://example.com/images/amit.jpg",
    "phone": "+919123456789",
    "gmail": "amit@gmail.com",
    "dist": "Delhi",
    "state": "Delhi"
  }'
```

---

#### Step 5: Get All Profiles Again

```bash
curl -X GET https://your-api.com/api/profiles/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Now returns user profile + 2 buyer profiles

---

#### Step 6: Update Specific Buyer Profile

```bash
curl -X PUT https://your-api.com/api/profiles/buyer/65f4a3b2c8d9e1234567890c \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma Updated",
    "status": "inactive"
  }'
```

---

#### Step 7: Delete Buyer Profile

```bash
curl -X DELETE https://your-api.com/api/profiles/buyer/65f4a3b2c8d9e1234567890c \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## JavaScript/Axios Examples

```javascript
// Set up axios with token
const api = axios.create({
  baseURL: 'https://your-api.com/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// 1. Get all profiles
const getAllProfiles = async () => {
  const response = await api.get('/profiles/all');
  console.log(response.data);
};

// 2. Update user profile
const updateUserProfile = async () => {
  const response = await api.put('/profiles/user', {
    name: "Rajesh Kumar Sharma",
    dist: "Coimbatore"
  });
  console.log(response.data);
};

// 3. Create buyer profile
const createBuyerProfile = async () => {
  const response = await api.post('/profiles/buyer', {
    name: "Priya Sharma",
    phone: "+919988776655",
    gmail: "priya@gmail.com",
    dist: "Mumbai",
    state: "Maharashtra"
  });
  console.log(response.data);
};

// 4. Get all buyer profiles
const getBuyerProfiles = async () => {
  const response = await api.get('/profiles/buyer');
  console.log(response.data);
};

// 5. Update buyer profile
const updateBuyerProfile = async (buyerId) => {
  const response = await api.put(`/profiles/buyer/${buyerId}`, {
    name: "Updated Name",
    status: "inactive"
  });
  console.log(response.data);
};

// 6. Delete buyer profile
const deleteBuyerProfile = async (buyerId) => {
  const response = await api.delete(`/profiles/buyer/${buyerId}`);
  console.log(response.data);
};
```

---

## React Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileManager() {
  const [userProfile, setUserProfile] = useState(null);
  const [buyerProfiles, setBuyerProfiles] = useState([]);
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'https://your-api.com/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Load all profiles on mount
  useEffect(() => {
    loadAllProfiles();
  }, []);

  const loadAllProfiles = async () => {
    try {
      const response = await api.get('/profiles/all');
      setUserProfile(response.data.data.userProfile);
      setBuyerProfiles(response.data.data.buyerProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const createBuyerProfile = async (profileData) => {
    try {
      const response = await api.post('/profiles/buyer', profileData);
      // Reload profiles after creating
      loadAllProfiles();
      return response.data;
    } catch (error) {
      console.error('Error creating buyer profile:', error);
      throw error;
    }
  };

  const updateBuyerProfile = async (buyerId, updateData) => {
    try {
      const response = await api.put(`/profiles/buyer/${buyerId}`, updateData);
      // Reload profiles after updating
      loadAllProfiles();
      return response.data;
    } catch (error) {
      console.error('Error updating buyer profile:', error);
      throw error;
    }
  };

  const deleteBuyerProfile = async (buyerId) => {
    try {
      await api.delete(`/profiles/buyer/${buyerId}`);
      // Reload profiles after deleting
      loadAllProfiles();
    } catch (error) {
      console.error('Error deleting buyer profile:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      {userProfile && (
        <div>
          <p>Name: {userProfile.name}</p>
          <p>Email: {userProfile.gmail}</p>
          <p>Phone: {userProfile.phone}</p>
        </div>
      )}

      <h2>Buyer Profiles ({buyerProfiles.length})</h2>
      {buyerProfiles.map(buyer => (
        <div key={buyer._id}>
          <p>Name: {buyer.name}</p>
          <p>Phone: {buyer.phone}</p>
          <button onClick={() => deleteBuyerProfile(buyer._id)}>
            Delete
          </button>
        </div>
      ))}

      <button onClick={() => createBuyerProfile({
        name: "New Buyer",
        phone: "+919999999999"
      })}>
        Add Buyer Profile
      </button>
    </div>
  );
}

export default ProfileManager;
```

---

## Key Features

✅ **User profile automatically created on signup**
✅ **Multiple buyer profiles supported**
✅ **Separate endpoints for user and buyer profiles**
✅ **Get all profiles in one API call**
✅ **Full CRUD operations on buyer profiles**
✅ **Backward compatible with legacy endpoints**

---

## Profile Types

- **user**: Main profile (one per user)
- **buyer**: Buyer profiles (multiple allowed)

## Status Values

- `active`: Profile is active
- `inactive`: Profile is inactive
- `pending`: Profile pending verification
- `suspended`: Profile is suspended

