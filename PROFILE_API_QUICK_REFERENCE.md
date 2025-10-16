# Profile API Quick Reference Card

## 🎯 Key Concept
- **1 User Profile** per user (auto-created on signup)
- **Multiple Buyer Profiles** per user (create as needed)

---

## 📋 API Endpoints

### User Profile
```
GET    /api/profiles/user           # Get user profile
PUT    /api/profiles/user           # Update user profile
```

### Buyer Profiles
```
POST   /api/profiles/buyer          # Create buyer profile
GET    /api/profiles/buyer          # Get all buyer profiles
PUT    /api/profiles/buyer/:id      # Update specific buyer profile
DELETE /api/profiles/buyer/:id      # Delete specific buyer profile
```

### Get All
```
GET    /api/profiles/all            # Get user profile + all buyer profiles
```

---

## 🚀 Quick Start Examples

### 1. Signup (Auto-creates user profile)
```bash
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123"
}
```

### 2. Get All Profiles
```bash
GET /api/profiles/all
Authorization: Bearer <token>

# Response:
{
  "userProfile": { ... },
  "buyerProfiles": [ ... ],
  "totalBuyerProfiles": 2
}
```

### 3. Create Buyer Profile
```bash
POST /api/profiles/buyer
Authorization: Bearer <token>
{
  "name": "Buyer Name",
  "phone": "+919988776655",
  "gmail": "buyer@example.com",
  "dist": "Mumbai",
  "state": "Maharashtra"
}
```

### 4. Update Buyer Profile
```bash
PUT /api/profiles/buyer/:id
Authorization: Bearer <token>
{
  "name": "Updated Name",
  "status": "inactive"
}
```

### 5. Delete Buyer Profile
```bash
DELETE /api/profiles/buyer/:id
Authorization: Bearer <token>
```

---

## 📊 Profile Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profileType` | String | Yes | `'user'` or `'buyer'` |
| `name` | String | No | Profile name |
| `dateOfBirth` | Date | No | Date of birth |
| `profileImage` | String | No | Image URL |
| `phone` | String | No | Phone number (unique) |
| `gmail` | String | No | Email (unique) |
| `status` | String | No | `'active'`, `'inactive'`, `'pending'`, `'suspended'` |
| `dist` | String | No | District |
| `state` | String | No | State |

---

## 💡 Common Use Cases

### Get all profiles on page load
```javascript
const response = await fetch('/api/profiles/all', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { userProfile, buyerProfiles } = response.data.data;
```

### Add new buyer
```javascript
const response = await fetch('/api/profiles/buyer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "New Buyer",
    phone: "+919999999999"
  })
});
```

### Update user profile
```javascript
const response = await fetch('/api/profiles/user', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Updated Name",
    dist: "New District"
  })
});
```

---

## ⚠️ Important Notes

1. **User profile** is automatically created during signup
2. **Cannot create** a second user profile (will error)
3. **Can create unlimited** buyer profiles
4. **All endpoints** require authentication token
5. **Phone and email** must be unique across all profiles (or empty)

---

## 🔍 Response Format

### Success Response
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📱 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 404 | Profile not found |
| 500 | Server error |

---

## 🔗 Related Docs

- **Full API Documentation**: `PROFILE_API_DOCUMENTATION.md`
- **System Changes**: `PROFILE_SYSTEM_CHANGES.md`
- **Main API Docs**: `API_DOCUMENTATION.md`

