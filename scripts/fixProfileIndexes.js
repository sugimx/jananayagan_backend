/**
 * Fix Profile Indexes Script
 * 
 * This script removes the old unique index on the 'user' field
 * and creates the new compound index that allows multiple profiles per user.
 * 
 * Run this script once after deploying the new profile system.
 * 
 * Usage:
 *   node scripts/fixProfileIndexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixProfileIndexes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const profilesCollection = db.collection('profiles');

    // Get current indexes
    console.log('Checking current indexes...');
    const indexes = await profilesCollection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Check if old user_1 index exists
    const oldUserIndex = indexes.find(idx => idx.name === 'user_1');
    
    if (oldUserIndex) {
      console.log('\n⚠️  Found old user_1 index (causes duplicate key error)');
      console.log('Dropping user_1 index...');
      
      try {
        await profilesCollection.dropIndex('user_1');
        console.log('✅ Successfully dropped user_1 index');
      } catch (error) {
        if (error.code === 27) {
          console.log('ℹ️  Index user_1 does not exist (already removed)');
        } else {
          throw error;
        }
      }
    } else {
      console.log('\n✅ Old user_1 index not found (already removed)');
    }

    // Drop other old indexes that might cause issues
    const indexesToDrop = ['phone_1', 'gmail_1', 'profileImageHash_1', 'website_key_1', 'user_id_1'];
    
    for (const indexName of indexesToDrop) {
      const indexExists = indexes.find(idx => idx.name === indexName);
      if (indexExists) {
        try {
          console.log(`\nDropping old ${indexName} index...`);
          await profilesCollection.dropIndex(indexName);
          console.log(`✅ Successfully dropped ${indexName} index`);
        } catch (error) {
          if (error.code === 27) {
            console.log(`ℹ️  Index ${indexName} does not exist`);
          } else {
            console.log(`⚠️  Could not drop ${indexName}:`, error.message);
          }
        }
      }
    }

    // Create new indexes
    console.log('\nCreating new indexes...');
    
    // 1. Compound index: one user can have only one 'user' profile type
    console.log('Creating compound index (user + profileType)...');
    try {
      await profilesCollection.createIndex(
        { user: 1, profileType: 1 },
        { 
          unique: true, 
          partialFilterExpression: { profileType: 'user' },
          name: 'user_1_profileType_1_partial'
        }
      );
      console.log('✅ Created compound index for user profiles');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️  Compound index already exists');
      } else {
        console.log('⚠️  Error creating compound index:', error.message);
      }
    }

    // 2. Index on user field (non-unique)
    console.log('Creating non-unique user index...');
    try {
      await profilesCollection.createIndex(
        { user: 1 },
        { name: 'user_1_nonunique' }
      );
      console.log('✅ Created non-unique user index');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️  User index already exists');
      } else {
        console.log('⚠️  Error creating user index:', error.message);
      }
    }

    // 3. Sparse unique indexes for phone and gmail
    console.log('Creating sparse unique index for phone...');
    try {
      await profilesCollection.createIndex(
        { phone: 1 },
        { unique: true, sparse: true, name: 'phone_1_sparse_unique' }
      );
      console.log('✅ Created sparse unique index for phone');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️  Phone index already exists');
      } else {
        console.log('⚠️  Error creating phone index:', error.message);
      }
    }

    console.log('Creating sparse unique index for gmail...');
    try {
      await profilesCollection.createIndex(
        { gmail: 1 },
        { unique: true, sparse: true, name: 'gmail_1_sparse_unique' }
      );
      console.log('✅ Created sparse unique index for gmail');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️  Gmail index already exists');
      } else {
        console.log('⚠️  Error creating gmail index:', error.message);
      }
    }

    // Show final indexes
    console.log('\n========================================');
    console.log('Final indexes:');
    console.log('========================================');
    const finalIndexes = await profilesCollection.indexes();
    finalIndexes.forEach(index => {
      const unique = index.unique ? ' (UNIQUE)' : '';
      const sparse = index.sparse ? ' (SPARSE)' : '';
      const partial = index.partialFilterExpression ? ' (PARTIAL)' : '';
      console.log(`  - ${index.name}${unique}${sparse}${partial}`);
      console.log(`    Keys: ${JSON.stringify(index.key)}`);
      if (index.partialFilterExpression) {
        console.log(`    Filter: ${JSON.stringify(index.partialFilterExpression)}`);
      }
    });

    console.log('\n✅ Index fix completed successfully!');
    console.log('\nYou can now:');
    console.log('  1. Create buyer profiles without duplicate key errors');
    console.log('  2. Have multiple buyer profiles per user');
    console.log('  3. Each user still has only one user profile\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Index fix failed:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
console.log('========================================');
console.log('Profile Indexes Fix Script');
console.log('========================================\n');

fixProfileIndexes();

