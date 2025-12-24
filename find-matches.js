const fs = require('fs');
const path = require('path');

// Read databases
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'users.json'), 'utf8'));
const profiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'profiles.json'), 'utf8'));
const orientations = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'orientations.json'), 'utf8'));

// Calculate match percentage
function calculateMatch(profile1, profile2) {
    let totalQuestions = 0;
    let matchingAnswers = 0;
    const answers1 = profile1.answers || {};
    const answers2 = profile2.answers || {};

    Object.keys(answers1).forEach(key => {
        if (answers2.hasOwnProperty(key)) {
            let weight = 1;
            
            // Weighted questions
            if (profile1.purpose === 'study' && key === 'studyFormat') {
                weight = 2;
            } else if (profile1.purpose === 'research' && 
                      (key === 'myStatus' || key === 'partnerStatus' || key === 'workFormat')) {
                weight = 2;
            }
            
            totalQuestions += weight;
            if (answers1[key] === answers2[key]) {
                matchingAnswers += weight;
            }
        }
    });

    return totalQuestions > 0 ? Math.round((matchingAnswers / totalQuestions) * 100) : 0;
}

// Check gender compatibility
function isGenderCompatible(orientation1, orientation2) {
    const gender1 = orientation1.myGender;
    const gender2 = orientation2.myGender;
    const target1 = orientation1.targetGender;
    const target2 = orientation2.targetGender;
    
    // Check if person 1 wants person 2's gender
    const person1WantsPerson2 = target1 === 'both' || target1 === gender2;
    
    // Check if person 2 wants person 1's gender
    const person2WantsPerson1 = target2 === 'both' || target2 === gender1;
    
    return person1WantsPerson2 && person2WantsPerson1;
}

// Check roommate hard constraint
function isRoommateCompatible(profile1, profile2) {
    if (profile1.purpose !== 'roommate') return true;
    
    const roomStatus1 = profile1.answers?.roomStatus;
    const roomStatus2 = profile2.answers?.roomStatus;
    
    if (!roomStatus1 || !roomStatus2) return false;
    
    // hasRoom must match with noRoom and vice versa
    return (roomStatus1 === 'hasRoom' && roomStatus2 === 'noRoom') ||
           (roomStatus1 === 'noRoom' && roomStatus2 === 'hasRoom');
}

// Get user info
function getUserInfo(userId) {
    const user = users.find(u => u.id === userId);
    return user ? {
        studentId: user.studentId,
        gender: user.gender,
        major: user.major
    } : null;
}

// Find all matches
console.log('🔍 ĐANG TÌM TẤT CẢ CÁC CẶP MATCH...\n');

const matchResults = {};
let totalMatches = 0;

// Group profiles by purpose
const purposeGroups = {};
profiles.forEach(profile => {
    if (!purposeGroups[profile.purpose]) {
        purposeGroups[profile.purpose] = [];
    }
    purposeGroups[profile.purpose].push(profile);
});

// Process each purpose
Object.entries(purposeGroups).forEach(([purpose, purposeProfiles]) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 PURPOSE: ${purpose.toUpperCase()}`);
    console.log(`${'='.repeat(80)}\n`);
    
    const matches = [];
    
    // Compare each pair
    for (let i = 0; i < purposeProfiles.length; i++) {
        for (let j = i + 1; j < purposeProfiles.length; j++) {
            const profile1 = purposeProfiles[i];
            const profile2 = purposeProfiles[j];
            
            // Get orientations
            const orientation1 = orientations.find(o => o.userId === profile1.userId);
            const orientation2 = orientations.find(o => o.userId === profile2.userId);
            
            if (!orientation1 || !orientation2) continue;
            
            // Check gender compatibility
            if (!isGenderCompatible(orientation1, orientation2)) continue;
            
            // Check roommate hard constraint
            if (purpose === 'roommate' && !isRoommateCompatible(profile1, profile2)) {
                continue;
            }
            
            // Calculate match percentage
            const matchPercent = calculateMatch(profile1, profile2);
            
            // Only include if >= 60%
            if (matchPercent >= 60) {
                const user1 = getUserInfo(profile1.userId);
                const user2 = getUserInfo(profile2.userId);
                
                matches.push({
                    user1: {
                        userId: profile1.userId,
                        studentId: user1?.studentId,
                        gender: orientation1.myGender,
                        targetGender: orientation1.targetGender,
                        major: user1?.major
                    },
                    user2: {
                        userId: profile2.userId,
                        studentId: user2?.studentId,
                        gender: orientation2.myGender,
                        targetGender: orientation2.targetGender,
                        major: user2?.major
                    },
                    matchPercent,
                    profile1Answers: profile1.answers,
                    profile2Answers: profile2.answers
                });
            }
        }
    }
    
    // Sort by match percentage
    matches.sort((a, b) => b.matchPercent - a.matchPercent);
    
    // Display results
    if (matches.length > 0) {
        matches.forEach((match, index) => {
            console.log(`${index + 1}. ${match.user1.studentId} (${match.user1.gender} → ${match.user1.targetGender}) ⟷ ${match.user2.studentId} (${match.user2.gender} → ${match.user2.targetGender})`);
            console.log(`   Match: ${match.matchPercent}%`);
            console.log(`   ${match.user1.major} ⟷ ${match.user2.major}`);
            
            // Show key matching answers
            const keys = Object.keys(match.profile1Answers);
            const matchingKeys = keys.filter(k => match.profile1Answers[k] === match.profile2Answers[k]);
            const differentKeys = keys.filter(k => match.profile1Answers[k] !== match.profile2Answers[k]);
            
            console.log(`   ✅ Matching: ${matchingKeys.length}/${keys.length} questions`);
            if (differentKeys.length > 0 && differentKeys.length <= 3) {
                console.log(`   ❌ Different: ${differentKeys.join(', ')}`);
            }
            console.log('');
        });
        
        console.log(`📊 Total matches for ${purpose}: ${matches.length}\n`);
        totalMatches += matches.length;
    } else {
        console.log(`❌ No matches found for ${purpose}\n`);
    }
    
    matchResults[purpose] = matches;
});

// Summary
console.log(`\n${'='.repeat(80)}`);
console.log(`📊 TỔNG KẾT`);
console.log(`${'='.repeat(80)}\n`);

Object.entries(matchResults).forEach(([purpose, matches]) => {
    console.log(`${purpose.padEnd(15)} : ${matches.length} matches`);
});

console.log(`\nTổng cộng: ${totalMatches} cặp match\n`);

// Export to JSON
const output = {
    timestamp: new Date().toISOString(),
    totalMatches,
    byPurpose: matchResults
};

fs.writeFileSync(
    path.join(__dirname, 'match-results.json'),
    JSON.stringify(output, null, 2)
);

console.log('✅ Đã xuất kết quả ra file: match-results.json\n');

// Show best matches
console.log(`\n${'='.repeat(80)}`);
console.log(`⭐ TOP MATCHES (>=80%)`);
console.log(`${'='.repeat(80)}\n`);

let topMatches = [];
Object.entries(matchResults).forEach(([purpose, matches]) => {
    matches.forEach(match => {
        if (match.matchPercent >= 80) {
            topMatches.push({ purpose, ...match });
        }
    });
});

topMatches.sort((a, b) => b.matchPercent - a.matchPercent);

if (topMatches.length > 0) {
    topMatches.forEach((match, index) => {
        console.log(`${index + 1}. [${match.purpose.toUpperCase()}] ${match.matchPercent}%`);
        console.log(`   ${match.user1.studentId} ⟷ ${match.user2.studentId}`);
        console.log('');
    });
} else {
    console.log('Không có cặp nào match >= 80%\n');
}
