// Try to load .env from multiple possible locations
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const Profile = require('../src/models/Profile');

const fixProfileEmptyStrings = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      console.error('Please create a .env file with MONGO_URI or set it in your environment');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');
    console.log('Starting Profile empty string cleanup...\n');

    // Step 1: Drop existing problematic indexes FIRST
    console.log('Step 1: Dropping existing indexes...');

    const existingIndexes = await Profile.collection.indexes();
    console.log('Current indexes:', existingIndexes.map(idx => idx.name).join(', '));

    try {
      await Profile.collection.dropIndex('phone_1');
      console.log('✓ Dropped phone_1 index');
    } catch (err) {
      console.log('- phone_1 index does not exist or already dropped');
    }

    try {
      await Profile.collection.dropIndex('gmail_1');
      console.log('✓ Dropped gmail_1 index');
    } catch (err) {
      console.log('- gmail_1 index does not exist or already dropped');
    }

    try {
      await Profile.collection.dropIndex('phone_1_sparse_unique');
      console.log('✓ Dropped phone_1_sparse_unique index');
    } catch (err) {
      console.log('- phone_1_sparse_unique index does not exist or already dropped');
    }

    try {
      await Profile.collection.dropIndex('gmail_1_sparse_unique');
      console.log('✓ Dropped gmail_1_sparse_unique index');
    } catch (err) {
      console.log('- gmail_1_sparse_unique index does not exist or already dropped');
    }

    console.log('\n');

    // Step 2: Find all profiles with empty string values
    const profilesWithEmptyStrings = await Profile.find({
      $or: [
        { phone: '' },
        { gmail: '' },
        { name: '' },
        { dist: '' },
        { state: '' }
      ]
    });

    console.log(`Step 2: Found ${profilesWithEmptyStrings.length} profiles with empty strings\n`);

    // Step 3: Update each profile individually
    let updatedCount = 0;
    for (const profile of profilesWithEmptyStrings) {
      const updates = {};
      
      if (profile.phone === '') updates.phone = null;
      if (profile.gmail === '') updates.gmail = null;
      if (profile.name === '') updates.name = null;
      if (profile.dist === '') updates.dist = null;
      if (profile.state === '') updates.state = null;

      if (Object.keys(updates).length > 0) {
        await Profile.findByIdAndUpdate(profile._id, updates);
        updatedCount++;
        console.log(`Updated profile ${profile._id}: ${Object.keys(updates).join(', ')}`);
      }
    }

    console.log(`\nStep 3: Updated ${updatedCount} profiles\n`);

    console.log('Step 4: Creating new sparse indexes...');

    // Create indexes with sparse: true
    await Profile.collection.createIndex(
      { phone: 1 }, 
      { unique: true, sparse: true, background: true }
    );
    console.log('✓ Created phone index (unique, sparse)');

    await Profile.collection.createIndex(
      { gmail: 1 }, 
      { unique: true, sparse: true, background: true }
    );
    console.log('✓ Created gmail index (unique, sparse)');

    console.log('\n✅ Profile cleanup completed successfully!');
    console.log('\nSummary:');
    console.log(`- Updated ${updatedCount} profiles`);
    console.log('- Rebuilt unique sparse indexes for phone and gmail');
    console.log('- All empty strings converted to null');
    console.log('\nYou can now restart your server and try signup again!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('\nError details:');
    console.error('Message:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.keyPattern) console.error('Key Pattern:', error.keyPattern);
    if (error.keyValue) console.error('Key Value:', error.keyValue);
    process.exit(1);
  }
};

// Run the cleanup
fixProfileEmptyStrings();

