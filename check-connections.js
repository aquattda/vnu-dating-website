const { connectDB, Connection, User } = require('./db');

async function checkConnections() {
    try {
        await connectDB();
        console.log('🔗 Connected to MongoDB\n');

        // Get all connections
        const allConnections = await Connection.find({});
        console.log(`📊 Total connections in database: ${allConnections.length}\n`);

        if (allConnections.length === 0) {
            console.log('❌ NO CONNECTIONS FOUND!\n');
            console.log('This means POST /api/connection is NOT saving to database!\n');
        } else {
            console.log('✅ Connections exist. Details:\n');
            console.log('='.repeat(80));
            
            for (const conn of allConnections) {
                const user1 = await User.findOne({ studentId: conn.userId });
                const user2 = await User.findOne({ studentId: conn.matchedUserId });
                
                console.log(`\nConnection ID: ${conn._id}`);
                console.log(`  User 1: ${conn.userId} (${user1 ? user1.name : 'Unknown'})`);
                console.log(`  User 2: ${conn.matchedUserId} (${user2 ? user2.name : 'Unknown'})`);
                console.log(`  Purpose: ${conn.purpose}`);
                console.log(`  Compatibility: ${conn.compatibility}%`);
                console.log(`  Status: ${conn.status || 'active'}`);
                console.log(`  Created: ${conn.createdAt}`);
                console.log('-'.repeat(80));
            }
        }

        // Check for test users specifically
        console.log('\n\n🔍 Checking test users (21020001-21020010):\n');
        for (let i = 1; i <= 10; i++) {
            const userId = `2102000${i}`;
            const connections = await Connection.find({
                $or: [
                    { userId: userId },
                    { matchedUserId: userId }
                ]
            });
            
            if (connections.length > 0) {
                console.log(`✅ ${userId}: ${connections.length} connection(s)`);
                connections.forEach(c => {
                    console.log(`   → ${c.userId} ↔ ${c.matchedUserId} (${c.purpose})`);
                });
            } else {
                console.log(`❌ ${userId}: No connections`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkConnections();
