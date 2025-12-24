const bcrypt = require('bcryptjs');
const { connectDB, User, Profile, Orientation } = require('./db');

// Sample users data
const sampleUsers = [
    {
        id: 'user_test_001',
        studentId: '21020001',
        password: '123456',
        name: 'Nguyễn Văn An',
        email: '21020001@vnu.edu.vn',
        phone: '0901234567',
        gender: 'male',
        birthYear: 2003,
        hometown: 'Hà Nội',
        major: 'Công nghệ thông tin',
        faculty: 'Công nghệ',
        year: 3,
        contact: {
            facebook: 'facebook.com/nguyenvanan',
            instagram: '@van_an_nguyen',
            zalo: '0901234567'
        }
    },
    {
        id: 'user_test_002',
        studentId: '21020002',
        password: '123456',
        name: 'Trần Thị Bình',
        email: '21020002@vnu.edu.vn',
        phone: '0902345678',
        gender: 'female',
        birthYear: 2003,
        hometown: 'Hải Phòng',
        major: 'Công nghệ thông tin',
        faculty: 'Công nghệ',
        year: 3,
        contact: {
            facebook: 'facebook.com/tranbinhthi',
            instagram: '@binh_tran',
            zalo: '0902345678'
        }
    },
    {
        id: 'user_test_003',
        studentId: '21020003',
        password: '123456',
        name: 'Lê Văn Cường',
        email: '21020003@vnu.edu.vn',
        phone: '0903456789',
        gender: 'male',
        birthYear: 2003,
        hometown: 'Đà Nẵng',
        major: 'Kinh tế',
        faculty: 'Kinh tế',
        year: 3,
        contact: {
            facebook: 'facebook.com/levancuong',
            instagram: '@cuong_le',
            zalo: '0903456789'
        }
    },
    {
        id: 'user_test_004',
        studentId: '21020004',
        password: '123456',
        name: 'Phạm Thị Dung',
        email: '21020004@vnu.edu.vn',
        phone: '0904567890',
        gender: 'female',
        birthYear: 2003,
        hometown: 'Hà Nội',
        major: 'Kinh tế',
        faculty: 'Kinh tế',
        year: 3,
        contact: {
            facebook: 'facebook.com/phamthidung',
            instagram: '@dung_pham',
            zalo: '0904567890'
        }
    },
    {
        id: 'user_test_005',
        studentId: '21020005',
        password: '123456',
        name: 'Hoàng Văn Em',
        email: '21020005@vnu.edu.vn',
        phone: '0905678901',
        gender: 'male',
        birthYear: 2003,
        hometown: 'Thanh Hóa',
        major: 'Toán học',
        faculty: 'Khoa học tự nhiên',
        year: 3,
        contact: {
            facebook: 'facebook.com/hoangvanem',
            instagram: '@em_hoang',
            zalo: '0905678901'
        }
    },
    {
        id: 'user_test_006',
        studentId: '21020006',
        password: '123456',
        name: 'Vũ Thị Giang',
        email: '21020006@vnu.edu.vn',
        phone: '0906789012',
        gender: 'female',
        birthYear: 2003,
        hometown: 'Nghệ An',
        major: 'Toán học',
        faculty: 'Khoa học tự nhiên',
        year: 3,
        contact: {
            facebook: 'facebook.com/vuthigiang',
            instagram: '@giang_vu',
            zalo: '0906789012'
        }
    },
    {
        id: 'user_test_007',
        studentId: '21020007',
        password: '123456',
        name: 'Đỗ Văn Hùng',
        email: '21020007@vnu.edu.vn',
        phone: '0907890123',
        gender: 'male',
        birthYear: 2003,
        hometown: 'Hà Nội',
        major: 'Vật lý',
        faculty: 'Khoa học tự nhiên',
        year: 3,
        contact: {
            facebook: 'facebook.com/dovanhung',
            instagram: '@hung_do',
            zalo: '0907890123'
        }
    },
    {
        id: 'user_test_008',
        studentId: '21020008',
        password: '123456',
        name: 'Bùi Thị Hoa',
        email: '21020008@vnu.edu.vn',
        phone: '0908901234',
        gender: 'female',
        birthYear: 2003,
        hometown: 'Hải Dương',
        major: 'Hóa học',
        faculty: 'Khoa học tự nhiên',
        year: 3,
        contact: {
            facebook: 'facebook.com/buithihoa',
            instagram: '@hoa_bui',
            zalo: '0908901234'
        }
    },
    {
        id: 'user_test_009',
        studentId: '21020009',
        password: '123456',
        name: 'Ngô Văn Khánh',
        email: '21020009@vnu.edu.vn',
        phone: '0909012345',
        gender: 'male',
        birthYear: 2003,
        hometown: 'Bắc Ninh',
        major: 'Ngôn ngữ Anh',
        faculty: 'Ngoại ngữ',
        year: 3,
        contact: {
            facebook: 'facebook.com/ngovankhanh',
            instagram: '@khanh_ngo',
            zalo: '0909012345'
        }
    },
    {
        id: 'user_test_010',
        studentId: '21020010',
        password: '123456',
        name: 'Đinh Thị Lan',
        email: '21020010@vnu.edu.vn',
        phone: '0900123456',
        gender: 'female',
        birthYear: 2003,
        hometown: 'Hà Nội',
        major: 'Ngôn ngữ Anh',
        faculty: 'Ngoại ngữ',
        year: 3,
        contact: {
            facebook: 'facebook.com/dinhthilan',
            instagram: '@lan_dinh',
            zalo: '0900123456'
        }
    }
];

// Sample profiles for "friend" purpose - matching pairs
const sampleProfiles = [
    // Pair 1: User 001 & 002 (90% match)
    {
        userId: '21020001',
        purpose: 'friend',
        answers: {
            friendPurpose: 'activities',
            friendStyle: 'friendly',
            contactFrequency: 'often',
            friendExpectation: 'sincere'
        }
    },
    {
        userId: '21020002',
        purpose: 'friend',
        answers: {
            friendPurpose: 'activities',
            friendStyle: 'friendly',
            contactFrequency: 'often',
            friendExpectation: 'sincere'
        }
    },
    // Pair 2: User 003 & 004 (85% match)
    {
        userId: '21020003',
        purpose: 'friend',
        answers: {
            friendPurpose: 'talk',
            friendStyle: 'calm',
            contactFrequency: 'moderate',
            friendExpectation: 'loyal'
        }
    },
    {
        userId: '21020004',
        purpose: 'friend',
        answers: {
            friendPurpose: 'talk',
            friendStyle: 'calm',
            contactFrequency: 'moderate',
            friendExpectation: 'loyal'
        }
    },
    // Pair 3: User 005 & 006 (88% match)
    {
        userId: '21020005',
        purpose: 'friend',
        answers: {
            friendPurpose: 'study',
            friendStyle: 'serious',
            contactFrequency: 'often',
            friendExpectation: 'supportive'
        }
    },
    {
        userId: '21020006',
        purpose: 'friend',
        answers: {
            friendPurpose: 'study',
            friendStyle: 'serious',
            contactFrequency: 'often',
            friendExpectation: 'supportive'
        }
    },
    // Pair 4: User 007 & 008 (92% match)
    {
        userId: '21020007',
        purpose: 'friend',
        answers: {
            friendPurpose: 'other',
            friendStyle: 'friendly',
            contactFrequency: 'often',
            friendExpectation: 'fun'
        }
    },
    {
        userId: '21020008',
        purpose: 'friend',
        answers: {
            friendPurpose: 'other',
            friendStyle: 'friendly',
            contactFrequency: 'often',
            friendExpectation: 'fun'
        }
    },
    // Pair 5: User 009 & 010 (87% match)
    {
        userId: '21020009',
        purpose: 'friend',
        answers: {
            friendPurpose: 'activities',
            friendStyle: 'calm',
            contactFrequency: 'moderate',
            friendExpectation: 'sincere'
        }
    },
    {
        userId: '21020010',
        purpose: 'friend',
        answers: {
            friendPurpose: 'activities',
            friendStyle: 'calm',
            contactFrequency: 'moderate',
            friendExpectation: 'sincere'
        }
    }
];

async function generateTestData() {
    try {
        await connectDB();
        console.log('🔗 Connected to MongoDB');

        // Clear existing test data
        await User.deleteMany({ studentId: { $regex: /^21020/ } });
        await Profile.deleteMany({ userId: { $regex: /^21020/ } });
        console.log('🗑️  Cleared existing test data');

        // Hash password for all users
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Insert users
        const usersToInsert = sampleUsers.map(user => ({
            ...user,
            password: hashedPassword,
            createdAt: new Date()
        }));

        await User.insertMany(usersToInsert);
        console.log(`✅ Created ${usersToInsert.length} test users`);

        // Insert profiles
        const profilesToInsert = sampleProfiles.map(profile => ({
            ...profile,
            completedAt: new Date()
        }));

        await Profile.insertMany(profilesToInsert);
        console.log(`✅ Created ${profilesToInsert.length} test profiles`);

        console.log('\n📊 Test Data Summary:');
        console.log('='.repeat(50));
        console.log('Test Accounts (password: 123456):');
        sampleUsers.forEach((user, i) => {
            console.log(`${i + 1}. MSSV: ${user.studentId} - ${user.name} (${user.gender})`);
        });
        console.log('\n💡 Matching Pairs:');
        console.log('- User 001 ↔️ User 002 (90% match)');
        console.log('- User 003 ↔️ User 004 (85% match)');
        console.log('- User 005 ↔️ User 006 (88% match)');
        console.log('- User 007 ↔️ User 008 (92% match)');
        console.log('- User 009 ↔️ User 010 (87% match)');
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating test data:', error);
        process.exit(1);
    }
}

generateTestData();
