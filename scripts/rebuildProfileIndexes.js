const mongoose = require('mongoose');
require('dotenv').config();

const rebuildIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('profiles');

    console.log('\n=== Dropping old indexes ===');
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop phone and gmail indexes if they exist
    try {
      await collection.dropIndex('phone_1');
      console.log('✓ Dropped phone_1 index');
    } catch (error) {
      console.log('- phone_1 index does not exist or already dropped');
    }

    try {
      await collection.dropIndex('gmail_1');
      console.log('✓ Dropped gmail_1 index');
    } catch (error) {
      console.log('- gmail_1 index does not exist or already dropped');
    }

    console.log('\n=== Creating new sparse unique indexes ===');

    // Create sparse unique index for phone
    await collection.createIndex(
      { phone: 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log('✓ Created sparse unique index for phone');

    // Create sparse unique index for gmail
    await collection.createIndex(
      { gmail: 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log('✓ Created sparse unique index for gmail');

    console.log('\n=== Verifying new indexes ===');
    const newIndexes = await collection.indexes();
    console.log('Updated indexes:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, {
        key: index.key,
        unique: index.unique || false,
        sparse: index.sparse || false
      });
    });

    console.log('\n✓ Index rebuild completed successfully!');
    
  } catch (error) {
    console.error('Error rebuilding indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

rebuildIndexes();



