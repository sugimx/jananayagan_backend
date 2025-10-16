# Fix: Duplicate Key Error on User Field

## Error Message

```json
{
  "success": false,
  "message": "E11000 duplicate key error collection: test.profiles index: user_1 dup key: { user: ObjectId('68e61e93493ddcc203827827') }"
}
```

## What's Happening?

The error occurs because:
1. **Old database index still exists** - The MongoDB collection still has a `unique` index on the `user` field
2. This old index prevents creating multiple profiles for the same user
3. We need to **drop the old index** and create new ones

## Quick Fix (Run This Script)

### Step 1: Run the Index Fix Script

```bash
cd Giveway_Backend
node scripts/fixProfileIndexes.js
```

**This script will:**
- ✅ Drop the old `user_1` unique index
- ✅ Create new compound index (allows one user profile + multiple buyer profiles)
- ✅ Create sparse unique indexes for phone and gmail
- ✅ Show you all current indexes

### Step 2: Test Creating a Buyer Profile

After running the script, try creating a buyer profile:

```bash
curl -X POST http://localhost:5000/api/profiles/buyer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Buyer",
    "phone": "+919999999999",
    "gmail": "testbuyer@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Buyer profile created successfully",
  "data": {
    "_id": "...",
    "user": "...",
    "profileType": "buyer",
    "name": "Test Buyer",
    ...
  }
}
```

---

## Manual Fix (Alternative)

If you prefer to fix it manually using MongoDB shell:

### Connect to MongoDB
```bash
mongosh "your_connection_string"
```

### Switch to Your Database
```javascript
use your_database_name
```

### Drop the Old Index
```javascript
db.profiles.dropIndex("user_1")
```

### Verify Indexes
```javascript
db.profiles.getIndexes()
```

### Create New Indexes

```javascript
// 1. Compound index - only one 'user' profile type per user
db.profiles.createIndex(
  { user: 1, profileType: 1 },
  { 
    unique: true, 
    partialFilterExpression: { profileType: 'user' },
    name: 'user_1_profileType_1_partial'
  }
)

// 2. Non-unique user index
db.profiles.createIndex(
  { user: 1 },
  { name: 'user_1_nonunique' }
)

// 3. Sparse unique phone index
db.profiles.createIndex(
  { phone: 1 },
  { unique: true, sparse: true, name: 'phone_1_sparse_unique' }
)

// 4. Sparse unique gmail index
db.profiles.createIndex(
  { gmail: 1 },
  { unique: true, sparse: true, name: 'gmail_1_sparse_unique' }
)
```

---

## Expected Script Output

When you run `node scripts/fixProfileIndexes.js`, you should see:

```
========================================
Profile Indexes Fix Script
========================================

Connecting to MongoDB...
✅ Connected to MongoDB

Checking current indexes...

Current indexes:
  - _id_: {"_id":1}
  - user_1: {"user":1}

⚠️  Found old user_1 index (causes duplicate key error)
Dropping user_1 index...
✅ Successfully dropped user_1 index

Creating new indexes...
Creating compound index (user + profileType)...
✅ Created compound index for user profiles
Creating non-unique user index...
✅ Created non-unique user index
Creating sparse unique index for phone...
✅ Created sparse unique index for phone
Creating sparse unique index for gmail...
✅ Created sparse unique index for gmail

========================================
Final indexes:
========================================
  - _id_
    Keys: {"_id":1}
  - user_1_profileType_1_partial (UNIQUE) (PARTIAL)
    Keys: {"user":1,"profileType":1}
    Filter: {"profileType":"user"}
  - user_1_nonunique
    Keys: {"user":1}
  - phone_1_sparse_unique (UNIQUE) (SPARSE)
    Keys: {"phone":1}
  - gmail_1_sparse_unique (UNIQUE) (SPARSE)
    Keys: {"gmail":1}

✅ Index fix completed successfully!

You can now:
  1. Create buyer profiles without duplicate key errors
  2. Have multiple buyer profiles per user
  3. Each user still has only one user profile

Disconnected from MongoDB
```

---

## Understanding the New Indexes

### 1. **user_1_profileType_1_partial** (UNIQUE, PARTIAL)
- **Purpose**: Ensures each user has only ONE 'user' profile
- **Allows**: Multiple 'buyer' profiles per user
- **Filter**: Only applies to profiles where `profileType: 'user'`

### 2. **user_1_nonunique**
- **Purpose**: Fast queries to find all profiles for a user
- **Not Unique**: Allows multiple profiles per user

### 3. **phone_1_sparse_unique** (UNIQUE, SPARSE)
- **Purpose**: Phone numbers must be unique
- **Sparse**: Allows empty/null phone numbers

### 4. **gmail_1_sparse_unique** (UNIQUE, SPARSE)
- **Purpose**: Email addresses must be unique
- **Sparse**: Allows empty/null emails

---

## Verification

### Test 1: Create User Profile (Should work once)
```bash
# This should fail because user profile already exists
POST /api/profiles/user
```

### Test 2: Create First Buyer Profile (Should work)
```bash
POST /api/profiles/buyer
{
  "name": "Buyer 1",
  "phone": "+919111111111"
}
```

### Test 3: Create Second Buyer Profile (Should work)
```bash
POST /api/profiles/buyer
{
  "name": "Buyer 2",
  "phone": "+919222222222"
}
```

### Test 4: Get All Profiles (Should return 1 user + 2 buyers)
```bash
GET /api/profiles/all
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userProfile": { ... },
    "buyerProfiles": [
      { "name": "Buyer 2", ... },
      { "name": "Buyer 1", ... }
    ],
    "totalBuyerProfiles": 2
  }
}
```

---

## Common Issues After Fix

### Issue: "phone already exists"
**Cause**: Another profile is using the same phone number  
**Solution**: Use a unique phone number or leave it empty

### Issue: "gmail already exists"
**Cause**: Another profile is using the same email  
**Solution**: Use a unique email or leave it empty

### Issue: Still getting duplicate key error
**Cause**: Script may not have run successfully  
**Solution**: 
1. Check MongoDB connection string
2. Run the script again
3. Manually verify indexes were dropped/created
4. Restart your Node.js server

---

## Why This Happened

When we updated the Profile model code:

**Before:**
```javascript
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  unique: true,  // ← This creates user_1 index
}
```

**After:**
```javascript
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  // unique removed
}

// New compound index added separately
profileSchema.index({ user: 1, profileType: 1 }, { 
  unique: true, 
  partialFilterExpression: { profileType: 'user' } 
});
```

However, **MongoDB doesn't automatically drop old indexes** when you change the model. You must manually drop them.

---

## Files Created

- ✅ `scripts/fixProfileIndexes.js` - Automated index fix script
- ✅ `FIX_DUPLICATE_KEY_ERROR.md` - This documentation

---

## Summary

1. ✅ **Run the script**: `node scripts/fixProfileIndexes.js`
2. ✅ **Restart your server** (if running)
3. ✅ **Test creating buyer profiles**
4. ✅ **Profit!** 🎉

The duplicate key error should now be resolved and you can create multiple buyer profiles per user!

