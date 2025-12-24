const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Helper functions
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Vietnamese names
const maleFirstNames = ['Minh', 'Tuấn', 'Hùng', 'Dũng', 'Nam', 'Khoa', 'Phúc', 'Tài', 'Đức', 'Long', 'Quân', 'Thành', 'Hoàng', 'Việt', 'Bảo'];
const femaleFirstNames = ['Linh', 'Hương', 'Mai', 'Lan', 'Thu', 'Hà', 'Trang', 'Thảo', 'Ngọc', 'Anh', 'Phương', 'Chi', 'My', 'Vy', 'Nhi'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];

// Data pools
const majors = ['Công nghệ thông tin', 'Kế toán', 'Quản trị kinh doanh', 'Ngôn ngữ Anh', 'Luật', 'Y khoa', 'Kiến trúc', 'Thiết kế đồ họa', 'Marketing', 'Tài chính ngân hàng', 'Sinh học', 'Hóa học', 'Vật lý', 'Toán học', 'Khoa học máy tính'];
const hometowns = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nghệ An', 'Thanh Hóa', 'Nam Định', 'Thái Bình', 'Quảng Ninh'];

// Password: 123456 for all
const hashedPassword = bcrypt.hashSync('123456', 10);

function generateUser(id, gender) {
    const firstName = gender === 'male' ? random(maleFirstNames) : random(femaleFirstNames);
    const lastName = random(lastNames);
    const fullName = `${lastName} ${firstName}`;
    const studentId = `2002${String(id).padStart(4, '0')}`;
    
    return {
        id: `100000${String(id).padStart(4, '0')}`,
        studentId,
        password: hashedPassword,
        email: `${studentId}@vnu.edu.vn`,
        phone: `090${randomInt(1000000, 9999999)}`,
        gender,
        birthYear: randomInt(2000, 2005),
        hometown: random(hometowns),
        major: random(majors),
        contact: {
            facebook: `facebook.com/${firstName.toLowerCase()}${id}`,
            instagram: `@${firstName.toLowerCase()}_${id}`,
            zalo: `090${randomInt(1000000, 9999999)}`
        },
        createdAt: new Date(2025, 11, randomInt(1, 24)).toISOString()
    };
}

function generateOrientation(userId, purpose) {
    const user = users.find(u => u.id === userId);
    const myGender = user.gender;
    
    let targetGender;
    if (purpose === 'love') {
        // Love: more specific gender targeting
        if (myGender === 'male') {
            targetGender = Math.random() > 0.8 ? 'both' : 'female';
        } else {
            targetGender = Math.random() > 0.8 ? 'both' : 'male';
        }
    } else {
        // Other purposes: more flexible
        targetGender = random(['male', 'female', 'both']);
    }
    
    return {
        userId,
        myGender,
        targetGender,
        relationshipGoal: random(['long-term', 'slow-serious', 'undefined']),
        readiness: random(['very-ready', 'quite-ready', 'need-time']),
        freeTime: random(['stay-home', 'go-out', 'depends']),
        conversationStyle: random(['talk-much', 'listen', 'talk-when-needed']),
        comfortZone: random(['talk-deep', 'keep-light', 'depends-mood']),
        lifestyle: random(['quiet', 'active', 'balanced']),
        stressResponse: random(['alone', 'share', 'depends']),
        createdAt: new Date().toISOString()
    };
}

function generateFriendProfile(userId) {
    return {
        userId,
        purpose: 'friend',
        answers: {
            friendPurpose: random(['chat', 'activities', 'support', 'other']),
            friendStyle: random(['friendly', 'calm', 'quiet']),
            contactFrequency: random(['often', 'whenNeeded', 'casual']),
            friendExpectation: random(['listening', 'respectPrivacy', 'sincere', 'other'])
        },
        createdAt: new Date().toISOString()
    };
}

function generateStudyProfile(userId) {
    return {
        userId,
        purpose: 'study',
        answers: {
            studyGoal: random(['groupStudy', 'homework', 'examPrep', 'project', 'other']),
            studyField: random(['socialScience', 'naturalScience', 'language', 'economics', 'technology', 'other']),
            punctuality: random(['always', 'often', 'sometimes', 'flexible']),
            studyEfficiency: random(['planned', 'focused', 'flexible', 'needMotivation']),
            groupRole: random(['leader', 'active', 'support', 'listener']),
            proactivity: random(['veryProactive', 'proactive', 'balanced', 'needGuidance']),
            studyFormat: random(['online', 'offline', 'hybrid']),
            studyFrequency: random(['daily', 'fewTimesWeek', 'weekly', 'flexible']),
            partnerExpectation: random(['serious', 'punctual', 'knowledgeable', 'patient', 'friendly', 'other'])
        },
        createdAt: new Date().toISOString()
    };
}

function generateLoveProfile(userId) {
    return {
        userId,
        purpose: 'love',
        answers: {
            height: random(['under160', '160-165', '165-170', '170-175', '175-180', 'over180']),
            selfAppearance: random(['confident', 'average', 'modest']),
            appearanceImportance: random(['veryImportant', 'important', 'notImportant']),
            idealAppearance: random(['neat', 'stylish', 'natural', 'notMatter']),
            personality: random(['extrovert', 'introvert', 'balanced']),
            freeTime: random(['outdoor', 'indoor', 'depends']),
            relationshipRole: random(['leading', 'following', 'equal']),
            datingAtmosphere: random(['quiet', 'lively', 'natural']),
            communicationStyle: random(['direct', 'gentle', 'balanced']),
            conflictStyle: random(['discuss', 'giveSpace', 'depends']),
            loveValues: random(['honesty', 'respect', 'loyalty', 'empathy', 'responsibility']),
            relationshipType: random(['serious', 'exploring', 'casual']),
            timeCommitment: random(['highCommitment', 'moderate', 'flexible']),
            meetingReadiness: random(['soon', 'afterChat', 'needTime'])
        },
        createdAt: new Date().toISOString()
    };
}

function generateResearchProfile(userId) {
    return {
        userId,
        purpose: 'research',
        answers: {
            researchGoal: random(['studentResearch', 'conference', 'findPartner']),
            myStatus: random(['hasTopic', 'noTopic']),
            partnerStatus: random(['hasTopic', 'noTopic']),
            researchField: random(['socialHumanities', 'naturalScience', 'languageEducation', 'businessManagement', 'technology']),
            researchExperience: random(['never', 'once']),
            preferredRole: random(['ideaProposer', 'dataCollector', 'dataAnalyst', 'writer', 'flexible']),
            workStyle: random(['detailed', 'flexible', 'creative']),
            problemSolving: random(['proactive', 'collaborative', 'needSupport']),
            commitment: random(['verySerious', 'serious', 'learning']),
            independence: random(['veryGood', 'good', 'needGuidance']),
            weeklyHours: random(['under5', '5to10', 'over10']),
            workFormat: random(['online', 'offline', 'hybrid']),
            projectDuration: random(['short', 'medium', 'long']),
            partnerExpectation: random(['responsible', 'logical', 'proactive', 'academic', 'experienced']),
            partnerPreference: random(['sameMajor', 'complementary', 'attitudeMatters']),
            expectedResult: random(['meetRequirements', 'highQuality', 'publish', 'learning'])
        },
        createdAt: new Date().toISOString()
    };
}

function generateRoommateProfile(userId, roomStatus) {
    return {
        userId,
        purpose: 'roommate',
        answers: {
            roomStatus,
            lifestyle: random(['neat', 'flexible']),
            bedtime: random(['9-10pm', 'after-12am', 'after-1-2am', 'varies-early', 'varies-late']),
            wakeTime: random(['early-6-7am', 'after-9am', 'noon', 'varies-early', 'varies-late']),
            lightSleeper: random(['yes', 'no', 'depends']),
            roommateExpectation: random(['respectPrivacy', 'friendly']),
            dealbreakers: random(['unhygienic', 'noisy', 'unclearCosts', 'other'])
        },
        createdAt: new Date().toISOString()
    };
}

// Generate data
const users = [];
const orientations = [];
const profiles = [];

let idCounter = 1;

// 5 Friend
for (let i = 0; i < 5; i++) {
    const gender = random(['male', 'female']);
    const user = generateUser(idCounter, gender);
    users.push(user);
    orientations.push(generateOrientation(user.id, 'friend'));
    profiles.push(generateFriendProfile(user.id));
    idCounter++;
}

// 10 Study
for (let i = 0; i < 10; i++) {
    const gender = random(['male', 'female']);
    const user = generateUser(idCounter, gender);
    users.push(user);
    orientations.push(generateOrientation(user.id, 'study'));
    profiles.push(generateStudyProfile(user.id));
    idCounter++;
}

// 15 Love
for (let i = 0; i < 15; i++) {
    const gender = i < 8 ? 'male' : 'female'; // 8 male, 7 female for variety
    const user = generateUser(idCounter, gender);
    users.push(user);
    orientations.push(generateOrientation(user.id, 'love'));
    profiles.push(generateLoveProfile(user.id));
    idCounter++;
}

// 5 Research
for (let i = 0; i < 5; i++) {
    const gender = random(['male', 'female']);
    const user = generateUser(idCounter, gender);
    users.push(user);
    orientations.push(generateOrientation(user.id, 'research'));
    profiles.push(generateResearchProfile(user.id));
    idCounter++;
}

// 5 Roommate (ensure half have room, half don't)
for (let i = 0; i < 5; i++) {
    const gender = random(['male', 'female']);
    const roomStatus = i < 3 ? 'hasRoom' : 'noRoom'; // 3 with room, 2 without
    const user = generateUser(idCounter, gender);
    users.push(user);
    orientations.push(generateOrientation(user.id, 'roommate'));
    profiles.push(generateRoommateProfile(user.id, roomStatus));
    idCounter++;
}

// Write to files
const dbPath = path.join(__dirname, 'database');

fs.writeFileSync(
    path.join(dbPath, 'users.json'),
    JSON.stringify(users, null, 2),
    'utf8'
);

fs.writeFileSync(
    path.join(dbPath, 'orientations.json'),
    JSON.stringify(orientations, null, 2),
    'utf8'
);

fs.writeFileSync(
    path.join(dbPath, 'profiles.json'),
    JSON.stringify(profiles, null, 2),
    'utf8'
);

// Clear connections
fs.writeFileSync(
    path.join(dbPath, 'connections.json'),
    JSON.stringify([], null, 2),
    'utf8'
);

console.log('✅ Generated 40 users successfully!');
console.log('\n📊 Breakdown:');
console.log('- Friend: 5 users');
console.log('- Study: 10 users');
console.log('- Love: 15 users (8 male, 7 female)');
console.log('- Research: 5 users');
console.log('- Roommate: 5 users (3 hasRoom, 2 noRoom)');
console.log('\n🔑 All passwords: 123456');
console.log('\n📧 Student IDs: 20020001 - 20020040');
console.log('📧 Email format: [studentId]@vnu.edu.vn');
