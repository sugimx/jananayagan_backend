/**
 * Migration Script: Add profileType to existing profiles
 * 
 * This script updates all existing profiles in the database to include
 * the profileType field set to 'user'.
 * 
 * Run this script once after deploying the new profile system.
 * 
 * Usage:
 *   node scripts/migrateProfiles.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define Profile schema (minimal version for migration)
const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  profileType: String,
  name: String,
  dateOfBirth: Date,
  profileImage: String,
  phone: String,
  gmail: String,
  status: String,
  dist: String,
  state: String,
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

async function migrateProfiles() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all profiles without profileType field
    console.log('Finding profiles without profileType...');
    const profilesWithoutType = await Profile.find({
      profileType: { $exists: false }
    });

    console.log(`Found ${profilesWithoutType.length} profiles to update\n`);

    if (profilesWithoutType.length === 0) {
      console.log('✅ All profiles already have profileType field. No migration needed.');
      await mongoose.disconnect();
      return;
    }

    // Update each profile
    console.log('Updating profiles...');
    const result = await Profile.updateMany(
      { profileType: { $exists: false } },
      { $set: { profileType: 'user' } }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Profiles updated: ${result.modifiedCount}`);
    console.log(`   - Profiles matched: ${result.matchedCount}`);

    // Verify the update
    console.log('\nVerifying migration...');
    const remainingProfiles = await Profile.find({
      profileType: { $exists: false }
    });

    if (remainingProfiles.length === 0) {
      console.log('✅ All profiles now have profileType field');
    } else {
      console.log(`⚠️  Warning: ${remainingProfiles.length} profiles still don't have profileType`);
    }

    // Show summary
    console.log('\nProfile Type Summary:');
    const userProfiles = await Profile.countDocuments({ profileType: 'user' });
    const buyerProfiles = await Profile.countDocuments({ profileType: 'buyer' });
    console.log(`   - User profiles: ${userProfiles}`);
    console.log(`   - Buyer profiles: ${buyerProfiles}`);
    console.log(`   - Total profiles: ${userProfiles + buyerProfiles}\n`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
console.log('========================================');
console.log('Profile Type Migration Script');
console.log('========================================\n');

migrateProfiles();

