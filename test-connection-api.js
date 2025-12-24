const { connectDB, User } = require('./db');

async function testConnectionAPI() {
    try {
        await connectDB();
        console.log('🔗 Connected to MongoDB\n');

        // Get JWT token for user 21020001
        const user = await User.findOne({ studentId: '21020001' });
        if (!user) {
            console.error('❌ User 21020001 not found!');
            process.exit(1);
        }

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: user.studentId, name: user.name },
            process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
        );

        console.log('✅ Generated JWT token for user 21020001');
        console.log(`Token: ${token.substring(0, 50)}...`);
        console.log('\n📡 Testing API endpoint: GET /api/my-connections\n');

        // Test API call
        const API_URL = 'http://localhost:3000/api';
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

        const response = await fetch(`${API_URL}/my-connections`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(data, null, 2));

        if (data.success && data.connections) {
            console.log(`\n✅ SUCCESS! Found ${data.connections.length} connections:`);
            data.connections.forEach((conn, i) => {
                console.log(`\n${i + 1}. ${conn.name} (${conn.matchedUserId})`);
                console.log(`   Faculty: ${conn.faculty}`);
                console.log(`   Purpose: ${conn.purpose}`);
                console.log(`   Compatibility: ${conn.compatibility}%`);
                console.log(`   Email: ${conn.email}`);
            });
        } else {
            console.log('\n❌ FAILED! No connections returned');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testConnectionAPI();
