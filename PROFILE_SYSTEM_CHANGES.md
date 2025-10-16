# Profile System Changes Summary

## Overview
The profile system has been updated to support **multiple profiles per user**:
- **1 User Profile** (automatically created on signup)
- **Multiple Buyer Profiles** (can be added as needed)

---

## What Changed

### 1. Profile Model (`src/models/Profile.js`)

#### Added Fields:
- `profileType`: `'user'` or `'buyer'`

#### Removed Fields:
- `buyerProfileImage` (buyer profiles are now separate documents)

#### Index Changes:
- **Removed**: Unique constraint on `user` field
- **Added**: Compound index to ensure only one 'user' profile type per user
- **Updated**: Phone and Gmail indexes to be sparse (allow empty values)

```javascript
// Old: user field was unique (only 1 profile per user)
user: { type: ObjectId, ref: 'User', unique: true }

// New: user field allows multiple profiles
user: { type: ObjectId, ref: 'User' }
profileType: { type: String, enum: ['user', 'buyer'] }

// Ensures only one 'user' profile per user, but unlimited 'buyer' profiles
profileSchema.index({ user: 1, profileType: 1 }, { 
  unique: true, 
  partialFilterExpression: { profileType: 'user' } 
});
```

---

### 2. User Controller (`src/controllers/userController.js`)

#### Changes in `registerUser`:
- Now automatically creates a **user profile** with `profileType: 'user'`
- Sets `isProfileComplete: true` after profile creation

```javascript
// Auto-create user profile on signup
await Profile.create({
  user: user._id,
  profileType: 'user',  // ← Added
  name: name || '',
  phone: phone || '',
  gmail: email || '',
  status: 'active',
});
```

---

### 3. Profile Controller (`src/controllers/profileController.js`)

Completely rewritten with separate endpoints:

#### New Endpoints:

**User Profile:**
- `getUserProfile()` - GET /api/profiles/user
- `updateUserProfile()` - PUT /api/profiles/user

**Buyer Profiles:**
- `createBuyerProfile()` - POST /api/profiles/buyer
- `getBuyerProfiles()` - GET /api/profiles/buyer
- `updateBuyerProfile()` - PUT /api/profiles/buyer/:id
- `deleteBuyerProfile()` - DELETE /api/profiles/buyer/:id

**Get All:**
- `getAllProfiles()` - GET /api/profiles/all (returns user + all buyer profiles)

**Legacy (Backward Compatibility):**
- `getProfile()` - GET /api/profiles
- `updateProfile()` - PUT /api/profiles
- `deleteProfile()` - DELETE /api/profiles

---

### 4. Profile Routes (`src/routes/profileRoutes.js`)

Updated with new route structure:

```javascript
// User Profile Routes
GET    /api/profiles/user
PUT    /api/profiles/user

// Buyer Profile Routes
POST   /api/profiles/buyer
GET    /api/profiles/buyer
PUT    /api/profiles/buyer/:id
DELETE /api/profiles/buyer/:id

// Get All Profiles
GET    /api/profiles/all

// Legacy Routes (still work)
GET    /api/profiles
PUT    /api/profiles
DELETE /api/profiles
```

---

## Migration Guide

### If You Have Existing Profiles

Run this MongoDB update to add `profileType` to existing profiles:

```javascript
// In MongoDB Shell or using Mongoose
db.profiles.updateMany(
  { profileType: { $exists: false } },
  { $set: { profileType: 'user' } }
);
```

Or use this Node.js script:

```javascript
const Profile = require('./src/models/Profile');
const mongoose = require('mongoose');

async function migrateProfiles() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const result = await Profile.updateMany(
    { profileType: { $exists: false } },
    { $set: { profileType: 'user' } }
  );
  
  console.log(`Updated ${result.modifiedCount} profiles`);
  await mongoose.disconnect();
}

migrateProfiles();
```

---

## Quick Reference

### User Flow

1. **User Signs Up** → User profile auto-created
2. **Get All Profiles** → Returns user profile (no buyer profiles yet)
3. **Create Buyer Profile #1** → Add first buyer
4. **Create Buyer Profile #2** → Add second buyer
5. **Get All Profiles** → Returns user profile + 2 buyer profiles

### API Endpoints Summary

| Action | Endpoint | Method | Returns |
|--------|----------|--------|---------|
| Get user profile | `/api/profiles/user` | GET | User profile only |
| Update user profile | `/api/profiles/user` | PUT | Updated user profile |
| Create buyer profile | `/api/profiles/buyer` | POST | New buyer profile |
| Get all buyer profiles | `/api/profiles/buyer` | GET | Array of buyer profiles |
| Update buyer profile | `/api/profiles/buyer/:id` | PUT | Updated buyer profile |
| Delete buyer profile | `/api/profiles/buyer/:id` | DELETE | Success message |
| **Get all profiles** | `/api/profiles/all` | GET | User + all buyer profiles |

---

## Testing

### Test the Complete Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "password123"
  }'

# Save the token from response

# 2. Get all profiles (should show only user profile)
curl -X GET http://localhost:5000/api/profiles/all \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create first buyer profile
curl -X POST http://localhost:5000/api/profiles/buyer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buyer One",
    "phone": "+919988776655",
    "gmail": "buyer1@example.com"
  }'

# 4. Create second buyer profile
curl -X POST http://localhost:5000/api/profiles/buyer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buyer Two",
    "phone": "+919123456789",
    "gmail": "buyer2@example.com"
  }'

# 5. Get all profiles (should show user profile + 2 buyer profiles)
curl -X GET http://localhost:5000/api/profiles/all \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. Get only buyer profiles
curl -X GET http://localhost:5000/api/profiles/buyer \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Update a buyer profile (replace BUYER_ID with actual ID)
curl -X PUT http://localhost:5000/api/profiles/buyer/BUYER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Buyer Name"
  }'

# 8. Delete a buyer profile (replace BUYER_ID with actual ID)
curl -X DELETE http://localhost:5000/api/profiles/buyer/BUYER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Key Benefits

✅ **Automatic user profile creation** on signup
✅ **Multiple buyer profiles** supported per user
✅ **Clear separation** between user and buyer profiles
✅ **One API call** to get all profiles (`/api/profiles/all`)
✅ **Backward compatible** with legacy endpoints
✅ **Full CRUD operations** on buyer profiles
✅ **Type safety** with profileType field
✅ **Database constraints** ensure data integrity

---

## Important Notes

1. **User Profile**: Automatically created during signup, cannot create another 'user' profile
2. **Buyer Profiles**: Can create unlimited buyer profiles
3. **Legacy Endpoints**: Still work for user profile operations (backward compatibility)
4. **Profile Types**: Only 'user' and 'buyer' are valid profileType values
5. **Phone/Email**: Can be empty or unique (sparse indexes)

---

## Troubleshooting

### Issue: "Profile already exists" error

**Cause**: Trying to create a user profile when one already exists

**Solution**: Use `/api/profiles/buyer` endpoint to create buyer profiles instead

---

### Issue: Duplicate key error on phone/email

**Cause**: Phone or email already exists in another profile

**Solution**: Use unique phone/email for each profile, or leave empty

---

### Issue: Can't find buyer profile by ID

**Cause**: Using wrong profile ID or trying to access another user's buyer profile

**Solution**: 
- Verify the buyer profile ID is correct
- Ensure you're using the correct authentication token
- Check that the buyer profile belongs to the authenticated user

---

## Files Modified

1. ✅ `src/models/Profile.js` - Added profileType, updated indexes
2. ✅ `src/controllers/userController.js` - Auto-create user profile on signup
3. ✅ `src/controllers/profileController.js` - Complete rewrite with new endpoints
4. ✅ `src/routes/profileRoutes.js` - Added new routes

---

## Next Steps

1. **Test the new endpoints** using the test commands above
2. **Update your frontend** to use the new endpoints
3. **Migrate existing data** if you have existing profiles
4. **Update API documentation** in your main docs

---

For detailed API documentation with all request/response examples, see **PROFILE_API_DOCUMENTATION.md**

