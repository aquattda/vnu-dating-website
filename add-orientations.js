const { connectDB, Orientation } = require('./db');

// Sample orientations for test users
const sampleOrientations = [
    {
        userId: '21020001',
        answers: {
            myGender: 'male',
            targetGender: 'female',
            relationshipGoal: 'long-term',
            readiness: 'very-ready',
            freeTime: 'go-out',
            conversationStyle: 'talk-much',
            comfortZone: 'with-others',
            lifestyle: 'balanced',
            stressResponse: 'share'
        }
    },
    {
        userId: '21020002',
        answers: {
            myGender: 'female',
            targetGender: 'male',
            relationshipGoal: 'long-term',
            readiness: 'very-ready',
            freeTime: 'go-out',
            conversationStyle: 'talk-much',
            comfortZone: 'with-others',
            lifestyle: 'balanced',
            stressResponse: 'share'
        }
    },
    {
        userId: '21020003',
        answers: {
            myGender: 'male',
            targetGender: 'female',
            relationshipGoal: 'slow-serious',
            readiness: 'quite-ready',
            freeTime: 'depends',
            conversationStyle: 'listen',
            comfortZone: 'with-others',
            lifestyle: 'balanced',
            stressResponse: 'handle-alone'
        }
    },
    {
        userId: '21020004',
        answers: {
            myGender: 'female',
            targetGender: 'male',
            relationshipGoal: 'slow-serious',
            readiness: 'quite-ready',
            freeTime: 'depends',
            conversationStyle: 'listen',
            comfortZone: 'with-others',
            lifestyle: 'balanced',
            stressResponse: 'handle-alone'
        }
    },
    {
        userId: '21020005',
        answers: {
            myGender: 'male',
            targetGender: 'female',
            relationshipGoal: 'long-term',
            readiness: 'very-ready',
            freeTime: 'stay-home',
            conversationStyle: 'talk-when-needed',
            comfortZone: 'alone',
            lifestyle: 'calm',
            stressResponse: 'share'
        }
    },
    {
        userId: '21020006',
        answers: {
            myGender: 'female',
            targetGender: 'male',
            relationshipGoal: 'long-term',
            readiness: 'very-ready',
            freeTime: 'stay-home',
            conversationStyle: 'talk-when-needed',
            comfortZone: 'alone',
            lifestyle: 'calm',
            stressResponse: 'share'
        }
    },
    {
        userId: '21020007',
        answers: {
            myGender: 'male',
            targetGender: 'female',
            relationshipGoal: 'long-term',
            readiness: 'very-ready',
            freeTime: 'go-out',
            conversationStyle: 'talk-much',
            comfortZone: 'with-others',
            lifestyle: 'active',
            stressResponse: 'share'
        }
    },
    {
        userId: '21020008',
        answers: {
            myGender: 'female',
            targetGender: 'male',
            relationshipGoal: 'long-term',
            readiness: 'very-ready',
            freeTime: 'go-out',
            conversationStyle: 'talk-much',
            comfortZone: 'with-others',
            lifestyle: 'active',
            stressResponse: 'share'
        }
    },
    {
        userId: '21020009',
        answers: {
            myGender: 'male',
            targetGender: 'female',
            relationshipGoal: 'slow-serious',
            readiness: 'quite-ready',
            freeTime: 'depends',
            conversationStyle: 'listen',
            comfortZone: 'with-others',
            lifestyle: 'balanced',
            stressResponse: 'handle-alone'
        }
    },
    {
        userId: '21020010',
        answers: {
            myGender: 'female',
            targetGender: 'male',
            relationshipGoal: 'slow-serious',
            readiness: 'quite-ready',
            freeTime: 'depends',
            conversationStyle: 'listen',
            comfortZone: 'with-others',
            lifestyle: 'balanced',
            stressResponse: 'handle-alone'
        }
    }
];

async function addOrientations() {
    try {
        await connectDB();
        console.log('🔗 Connected to MongoDB');

        // Clear existing orientations for test users
        await Orientation.deleteMany({ userId: { $regex: /^21020/ } });
        console.log('🗑️  Cleared existing orientations');

        // Insert new orientations
        await Orientation.insertMany(sampleOrientations);
        console.log(`✅ Created ${sampleOrientations.length} orientations`);

        console.log('\n📊 Orientations Summary:');
        console.log('='.repeat(50));
        sampleOrientations.forEach((o, i) => {
            console.log(`${i + 1}. User ${o.userId} - ${o.answers.myGender} → ${o.answers.targetGender}`);
        });
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding orientations:', error);
        process.exit(1);
    }
}

addOrientations();
