const fs = require('fs');
const path = require('path');

const profiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'profiles.json'), 'utf8'));
const orientations = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'orientations.json'), 'utf8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'users.json'), 'utf8'));

console.log('🔍 DEBUG MATCHING ANALYSIS\n');

// Check friend purpose
const friendProfiles = profiles.filter(p => p.purpose === 'friend');
console.log(`Friend profiles: ${friendProfiles.length}`);

if (friendProfiles.length >= 2) {
    const p1 = friendProfiles[0];
    const p2 = friendProfiles[1];
    
    const o1 = orientations.find(o => o.userId === p1.userId);
    const o2 = orientations.find(o => o.userId === p2.userId);
    
    console.log(`\nPair 1 vs 2:`);
    console.log(`User 1: ${p1.userId}`);
    console.log(`  Gender: ${o1.myGender} → ${o1.targetGender}`);
    console.log(`  Answers:`, p1.answers);
    
    console.log(`\nUser 2: ${p2.userId}`);
    console.log(`  Gender: ${o2.myGender} → ${o2.targetGender}`);
    console.log(`  Answers:`, p2.answers);
    
    // Check gender compatibility
    const person1WantsPerson2 = o1.targetGender === 'both' || o1.targetGender === o2.myGender;
    const person2WantsPerson1 = o2.targetGender === 'both' || o2.targetGender === o1.myGender;
    
    console.log(`\nGender compatibility:`);
    console.log(`  Person 1 wants Person 2? ${person1WantsPerson2}`);
    console.log(`  Person 2 wants Person 1? ${person2WantsPerson1}`);
    console.log(`  Compatible? ${person1WantsPerson2 && person2WantsPerson1}`);
    
    // Calculate match
    let totalQuestions = 0;
    let matchingAnswers = 0;
    
    Object.keys(p1.answers).forEach(key => {
        if (p2.answers.hasOwnProperty(key)) {
            totalQuestions++;
            if (p1.answers[key] === p2.answers[key]) {
                matchingAnswers++;
                console.log(`  ✅ ${key}: ${p1.answers[key]} = ${p2.answers[key]}`);
            } else {
                console.log(`  ❌ ${key}: ${p1.answers[key]} ≠ ${p2.answers[key]}`);
            }
        }
    });
    
    const matchPercent = Math.round((matchingAnswers / totalQuestions) * 100);
    console.log(`\nMatch: ${matchingAnswers}/${totalQuestions} = ${matchPercent}%`);
}

// Check study purpose
console.log(`\n${'='.repeat(60)}\n`);
const studyProfiles = profiles.filter(p => p.purpose === 'study');
console.log(`Study profiles: ${studyProfiles.length}`);

if (studyProfiles.length >= 2) {
    const p1 = studyProfiles[0];
    const p2 = studyProfiles[1];
    
    const o1 = orientations.find(o => o.userId === p1.userId);
    const o2 = orientations.find(o => o.userId === p2.userId);
    
    const u1 = users.find(u => u.id === p1.userId);
    const u2 = users.find(u => u.id === p2.userId);
    
    console.log(`\nPair: ${u1.studentId} vs ${u2.studentId}`);
    console.log(`User 1: ${o1.myGender} → ${o1.targetGender}`);
    console.log(`User 2: ${o2.myGender} → ${o2.targetGender}`);
    
    const person1WantsPerson2 = o1.targetGender === 'both' || o1.targetGender === o2.myGender;
    const person2WantsPerson1 = o2.targetGender === 'both' || o2.targetGender === o1.myGender;
    
    console.log(`Gender compatible? ${person1WantsPerson2 && person2WantsPerson1}`);
    
    if (person1WantsPerson2 && person2WantsPerson1) {
        let totalQuestions = 0;
        let matchingAnswers = 0;
        
        Object.keys(p1.answers).forEach(key => {
            if (p2.answers.hasOwnProperty(key)) {
                let weight = key === 'studyFormat' ? 2 : 1;
                totalQuestions += weight;
                if (p1.answers[key] === p2.answers[key]) {
                    matchingAnswers += weight;
                    console.log(`  ✅ ${key}: ${p1.answers[key]} (weight: ${weight})`);
                } else {
                    console.log(`  ❌ ${key}: ${p1.answers[key]} ≠ ${p2.answers[key]} (weight: ${weight})`);
                }
            }
        });
        
        const matchPercent = Math.round((matchingAnswers / totalQuestions) * 100);
        console.log(`\nMatch: ${matchingAnswers}/${totalQuestions} = ${matchPercent}%`);
    }
}

// Check roommate
console.log(`\n${'='.repeat(60)}\n`);
const roommateProfiles = profiles.filter(p => p.purpose === 'roommate');
console.log(`Roommate profiles: ${roommateProfiles.length}`);

if (roommateProfiles.length >= 2) {
    roommateProfiles.forEach((p, i) => {
        const u = users.find(u => u.id === p.userId);
        const o = orientations.find(o => o.userId === p.userId);
        console.log(`${i+1}. ${u.studentId} - ${o.myGender} → ${o.targetGender} - roomStatus: ${p.answers.roomStatus}`);
    });
    
    // Check first pair
    const p1 = roommateProfiles[0];
    const p2 = roommateProfiles[1];
    const o1 = orientations.find(o => o.userId === p1.userId);
    const o2 = orientations.find(o => o.userId === p2.userId);
    
    console.log(`\nChecking first pair:`);
    console.log(`  roomStatus: ${p1.answers.roomStatus} vs ${p2.answers.roomStatus}`);
    
    const isRoomCompatible = 
        (p1.answers.roomStatus === 'hasRoom' && p2.answers.roomStatus === 'noRoom') ||
        (p1.answers.roomStatus === 'noRoom' && p2.answers.roomStatus === 'hasRoom');
    
    console.log(`  Roommate compatible? ${isRoomCompatible}`);
    
    const person1WantsPerson2 = o1.targetGender === 'both' || o1.targetGender === o2.myGender;
    const person2WantsPerson1 = o2.targetGender === 'both' || o2.targetGender === o1.myGender;
    console.log(`  Gender compatible? ${person1WantsPerson2 && person2WantsPerson1}`);
}
