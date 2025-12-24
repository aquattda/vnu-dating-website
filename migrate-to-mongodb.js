/**
 * Migration Script: JSON to MongoDB
 * 
 * This script migrates data from local JSON files to MongoDB
 * 
 * Usage:
 * 1. Set MONGODB_URI in .env file
 * 2. Run: node migrate-to-mongodb.js
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const { 
    connectDB, 
    User, 
    Profile, 
    Orientation, 
    Connection, 
    Premium, 
    Transaction 
} = require('./db');

// JSON file paths
const DB_PATH = {
    users: path.join(__dirname, 'database', 'users.json'),
    profiles: path.join(__dirname, 'database', 'profiles.json'),
    connections: path.join(__dirname, 'database', 'connections.json'),
    orientations: path.join(__dirname, 'database', 'orientations.json'),
    premiums: path.join(__dirname, 'database', 'premiums.json'),
    transactions: path.join(__dirname, 'database', 'transactions.json')
};

// Read JSON file
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log(`⚠️  File not found or empty: ${path.basename(filePath)}`);
        return [];
    }
}

// Migration functions
async function migrateUsers() {
    console.log('\n📦 Migrating Users...');
    const users = await readJSON(DB_PATH.users);
    
    if (users.length === 0) {
        console.log('   No users to migrate');
        return;
    }

    for (const user of users) {
        // Tạo các trường bắt buộc nếu thiếu
        const migratedUser = {
            studentId: user.studentId,
            password: user.password,
            name: user.name || `User ${user.studentId}`,
            faculty: user.faculty || user.major || 'VNU',
            year: user.year || 1,
            email: user.email || `${user.studentId}@vnu.edu.vn`,
            createdAt: user.createdAt || new Date()
        };
        await User.findOneAndUpdate(
            { studentId: migratedUser.studentId },
            migratedUser,
            { upsert: true, new: true }
        );
    }
    
    console.log(`✅ Migrated ${users.length} users`);
}

async function migrateProfiles() {
    console.log('\n📦 Migrating Profiles...');
    const profiles = await readJSON(DB_PATH.profiles);
    
    if (profiles.length === 0) {
        console.log('   No profiles to migrate');
        return;
    }

    for (const profile of profiles) {
        // Convert answers object to Map for MongoDB
        const answersMap = new Map(Object.entries(profile.answers || {}));
        
        await Profile.findOneAndUpdate(
            { userId: profile.userId, purpose: profile.purpose },
            { ...profile, answers: answersMap },
            { upsert: true, new: true }
        );
    }
    
    console.log(`✅ Migrated ${profiles.length} profiles`);
}

async function migrateOrientations() {
    console.log('\n📦 Migrating Orientations...');
    const orientations = await readJSON(DB_PATH.orientations);
    
    if (orientations.length === 0) {
        console.log('   No orientations to migrate');
        return;
    }

    for (const orientation of orientations) {
        const answersMap = new Map(Object.entries(orientation.answers || {}));
        
        await Orientation.findOneAndUpdate(
            { userId: orientation.userId },
            { ...orientation, answers: answersMap },
            { upsert: true, new: true }
        );
    }
    
    console.log(`✅ Migrated ${orientations.length} orientations`);
}

async function migrateConnections() {
    console.log('\n📦 Migrating Connections...');
    const connections = await readJSON(DB_PATH.connections);
    
    if (connections.length === 0) {
        console.log('   No connections to migrate');
        return;
    }

    for (const connection of connections) {
        // Skip invalid connections (missing required fields)
        if (!connection.userId && !connection.user1Id) {
            console.log('   ⚠️  Skipping invalid connection (missing userId)');
            continue;
        }
        
        // Convert old format to new format if needed
        const connectionData = {
            userId: connection.userId || connection.user1Id,
            matchedUserId: connection.matchedUserId || connection.user2Id,
            purpose: connection.purpose || 'friend',
            compatibility: connection.compatibility || 100,
            matchDetails: connection.matchDetails || {},
            createdAt: connection.createdAt || new Date()
        };
        
        // Validate required fields
        if (!connectionData.userId || !connectionData.matchedUserId) {
            console.log('   ⚠️  Skipping invalid connection');
            continue;
        }
        
        const newConnection = new Connection(connectionData);
        await newConnection.save();
    }
    
    console.log(`✅ Migrated ${connections.length} connections`);
}

async function migratePremiums() {
    console.log('\n📦 Migrating Premiums...');
    const premiums = await readJSON(DB_PATH.premiums);
    
    if (premiums.length === 0) {
        console.log('   No premiums to migrate');
        return;
    }

    // Package mapping for old packageId format
    const packageMap = {
        'package_monthly': { name: 'Monthly Premium', matches: 30, price: 99000 },
        'package_5': { name: '5 Lượt Match', matches: 5, price: 59000 },
        'package_3': { name: '3 Lượt Match', matches: 3, price: 39000 },
        'package_1': { name: '1 Lượt Match', matches: 1, price: 15000 }
    };

    for (const premium of premiums) {
        // Skip invalid premiums
        if (!premium.userId) {
            console.log('   ⚠️  Skipping invalid premium (missing userId)');
            continue;
        }
        
        // Get package info from packageId or use defaults
        const packageInfo = packageMap[premium.packageId] || { 
            name: premium.packageName || 'Unknown Package', 
            matches: premium.matches || 1, 
            price: premium.price || 15000 
        };
        
        const premiumData = {
            userId: premium.userId,
            packageName: premium.packageName || packageInfo.name,
            matches: premium.matches || packageInfo.matches,
            remainingMatches: premium.remainingMatches || packageInfo.matches,
            price: premium.price || packageInfo.price,
            expiresAt: premium.expiresAt || null,
            purchasedAt: premium.createdAt || new Date()
        };
        
        const newPremium = new Premium(premiumData);
        await newPremium.save();
    }
    
    console.log(`✅ Migrated ${premiums.length} premiums`);
}

async function migrateTransactions() {
    console.log('\n📦 Migrating Transactions...');
    const transactions = await readJSON(DB_PATH.transactions);
    
    if (transactions.length === 0) {
        console.log('   No transactions to migrate');
        return;
    }

    for (const transaction of transactions) {
        await Transaction.findOneAndUpdate(
            { transactionId: transaction.transactionId },
            transaction,
            { upsert: true, new: true }
        );
    }
    
    console.log(`✅ Migrated ${transactions.length} transactions`);
}

// Main migration function
async function migrate() {
    try {
        console.log('🚀 Starting migration from JSON to MongoDB...');
        console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗');
        
        if (!process.env.MONGODB_URI) {
            console.error('\n❌ Error: MONGODB_URI not set in .env file');
            console.log('\nPlease:');
            console.log('1. Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas');
            console.log('2. Create a cluster (free tier available)');
            console.log('3. Get connection string');
            console.log('4. Add to .env file: MONGODB_URI=mongodb+srv://...');
            process.exit(1);
        }

        // Connect to MongoDB
        await connectDB();

        // Clear existing data (optional)
        const clearData = process.argv.includes('--clear');
        if (clearData) {
            console.log('\n🗑️  Clearing existing MongoDB data...');
            // Drop collections completely to remove old indexes
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            
            for (const collection of collections) {
                await db.dropCollection(collection.name);
                console.log(`   Dropped collection: ${collection.name}`);
            }
            
            console.log('✅ Data cleared (including indexes)');
        }

        // Run migrations
        await migrateUsers();
        await migrateProfiles();
        await migrateOrientations();
        await migrateConnections();
        await migratePremiums();
        await migrateTransactions();

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📊 Database Statistics:');
        console.log(`   Users: ${await User.countDocuments()}`);
        console.log(`   Profiles: ${await Profile.countDocuments()}`);
        console.log(`   Orientations: ${await Orientation.countDocuments()}`);
        console.log(`   Connections: ${await Connection.countDocuments()}`);
        console.log(`   Premiums: ${await Premium.countDocuments()}`);
        console.log(`   Transactions: ${await Transaction.countDocuments()}`);

        console.log('\n✨ Next steps:');
        console.log('1. Test the application: node server-mongodb.js');
        console.log('2. If everything works, backup JSON files and switch to MongoDB permanently');
        console.log('3. Deploy to Render.com');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Connection closed');
    }
}

// Run migration
if (require.main === module) {
    migrate();
}

module.exports = { migrate };
