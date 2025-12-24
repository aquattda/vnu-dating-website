const { connectDB, Premium, User } = require('./db');

async function checkPremium() {
    try {
        await connectDB();
        console.log('🔗 Connected to MongoDB\n');

        // Get all premiums
        const allPremiums = await Premium.find({});
        console.log(`📊 Total premiums in database: ${allPremiums.length}\n`);

        if (allPremiums.length === 0) {
            console.log('❌ NO PREMIUMS FOUND!\n');
            console.log('Create test premium? Run: node create-test-premium.js\n');
        } else {
            console.log('✅ Premiums exist. Details:\n');
            console.log('='.repeat(80));
            
            for (const premium of allPremiums) {
                const user = await User.findOne({ studentId: premium.userId });
                
                console.log(`\nPremium ID: ${premium._id}`);
                console.log(`  User: ${premium.userId} (${user ? user.name : 'Unknown'})`);
                console.log(`  Package: ${premium.packageName}`);
                console.log(`  Total Matches: ${premium.matches}`);
                console.log(`  Remaining: ${premium.remainingMatches}`);
                console.log(`  Price: ${premium.price.toLocaleString('vi-VN')} VND`);
                console.log(`  Purchased: ${premium.purchasedAt}`);
                if (premium.expiresAt) {
                    const expired = new Date(premium.expiresAt) < new Date();
                    console.log(`  Expires: ${premium.expiresAt} ${expired ? '❌ EXPIRED' : '✅ VALID'}`);
                } else {
                    console.log(`  Expires: Never (one-time)`);
                }
                console.log('-'.repeat(80));
            }
        }

        // Check for test users
        console.log('\n\n🔍 Checking test users premium (21020001-21020010):\n');
        for (let i = 1; i <= 10; i++) {
            const userId = `2102000${i}`;
            const premiums = await Premium.find({ userId });
            
            if (premiums.length > 0) {
                const validPremiums = premiums.filter(p => {
                    if (p.remainingMatches <= 0) return false;
                    if (p.expiresAt) {
                        return new Date(p.expiresAt) > new Date();
                    }
                    return true;
                });
                const totalMatches = validPremiums.reduce((sum, p) => sum + p.remainingMatches, 0);
                console.log(`${validPremiums.length > 0 ? '✅' : '❌'} ${userId}: ${premiums.length} premium(s), ${totalMatches} remaining matches`);
            } else {
                console.log(`❌ ${userId}: No premium`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPremium();
