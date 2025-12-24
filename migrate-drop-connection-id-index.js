// Migration script: Drop old 'id' index from connections collection
const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vnu-dating');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('connections');

        // List current indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current indexes:', indexes.map(i => i.name));

        // Drop the old 'id_1' index if it exists
        try {
            await collection.dropIndex('id_1');
            console.log('✅ Dropped index: id_1');
        } catch (error) {
            if (error.code === 27) {
                console.log('⚠️  Index id_1 does not exist (already dropped or never created)');
            } else {
                throw error;
            }
        }

        // Create new compound unique index
        try {
            await collection.createIndex(
                { userId: 1, matchedUserId: 1, purpose: 1 }, 
                { unique: true, name: 'userId_matchedUserId_purpose_unique' }
            );
            console.log('✅ Created compound unique index: userId_matchedUserId_purpose_unique');
        } catch (error) {
            if (error.code === 85) {
                console.log('⚠️  Index already exists');
            } else {
                throw error;
            }
        }

        // List indexes after migration
        const newIndexes = await collection.indexes();
        console.log('\n📋 Indexes after migration:', newIndexes.map(i => i.name));

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
