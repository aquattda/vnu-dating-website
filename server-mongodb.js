const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
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

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vnu-dating-secret-key-2024';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token hết hạn hoặc không hợp lệ' });
        }
        req.user = user;
        next();
    });
}

// ============ AUTHENTICATION ROUTES ============

// Đăng ký
app.post('/api/register', async (req, res) => {
    try {
        const { studentId, password, name, faculty, year, email, phone, gender, birthYear, hometown, major, facebook, instagram } = req.body;

        // Validate required fields
        if (!studentId || !password || !email) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ studentId }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ error: 'MSSV hoặc email đã tồn tại' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with all fields
        const newUser = new User({
            id: 'user_' + Date.now(),
            studentId,
            password: hashedPassword,
            name: name || 'VNU Student',
            faculty: faculty || major,
            year: year ? parseInt(year) : null,
            email,
            phone: phone || null,
            gender: gender || null,
            birthYear: birthYear ? parseInt(birthYear) : null,
            hometown: hometown || null,
            major: major || faculty,
            contact: {
                facebook: facebook || null,
                instagram: instagram || null,
                zalo: phone || null
            }
        });

        await newUser.save();

        res.json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;

        // Find user
        const user = await User.findOne({ studentId });

        if (!user) {
            return res.status(400).json({ error: 'MSSV hoặc mật khẩu không đúng' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'MSSV hoặc mật khẩu không đúng' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.studentId, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.studentId,
                name: user.name,
                faculty: user.faculty,
                year: user.year,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ============ PROFILE ROUTES ============

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ studentId: req.user.id });
        
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // Get all profiles (questionnaire answers) for this user
        const profiles = await Profile.find({ userId: req.user.id });

        // Format profiles with user info
        const formattedProfiles = profiles.map(profile => ({
            purpose: profile.purpose,
            answers: profile.answers,
            completedAt: profile.completedAt,
            userInfo: {
                studentId: user.studentId,
                name: user.name,
                faculty: user.faculty,
                year: user.year,
                email: user.email,
                contact: user.contact
            }
        }));

        res.json({
            id: user.studentId,
            name: user.name,
            faculty: user.faculty,
            year: user.year,
            email: user.email,
            profiles: formattedProfiles  // Add profiles array
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ============ ORIENTATION ROUTES ============

// Submit orientation questionnaire
app.post('/api/orientation', authenticateToken, async (req, res) => {
    try {
        const { answers, orientation } = req.body;
        const orientationData = answers || orientation;

        if (!orientationData) {
            return res.status(400).json({ error: 'Dữ liệu định hướng không hợp lệ' });
        }

        console.log('🎯 Saving orientation for user:', req.user.id);
        console.log('Orientation data:', orientationData);

        // Update or create orientation
        const result = await Orientation.findOneAndUpdate(
            { userId: req.user.id },
            { userId: req.user.id, answers: orientationData },
            { upsert: true, new: true }
        );

        console.log('✅ Orientation saved:', result);

        res.json({ success: true, message: 'Đã lưu trắc nghiệm hướng nghiệp!' });
    } catch (error) {
        console.error('❌ Orientation error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get orientation results
app.get('/api/orientation', authenticateToken, async (req, res) => {
    try {
        const orientation = await Orientation.findOne({ userId: req.user.id });

        if (!orientation) {
            return res.json({ completed: false });
        }

        res.json({
            completed: true,
            answers: orientation.answers
        });
    } catch (error) {
        console.error('Get orientation error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Check if user has completed orientation
app.get('/api/orientation/check', authenticateToken, async (req, res) => {
    try {
        const orientation = await Orientation.findOne({ userId: req.user.id });
        
        res.json({
            success: true,
            hasOrientation: !!orientation,
            orientation: orientation ? orientation.answers : null
        });
    } catch (error) {
        console.error('Check orientation error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get user info (for questionnaire)
app.get('/api/user-info', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ studentId: req.user.id });
        
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                faculty: user.faculty,
                year: user.year,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ============ QUESTIONNAIRE ROUTES ============

// Submit questionnaire
app.post('/api/questionnaire', authenticateToken, async (req, res) => {
    try {
        const { purpose, answers } = req.body;

        // Update or create profile
        await Profile.findOneAndUpdate(
            { userId: req.user.id, purpose },
            { userId: req.user.id, purpose, answers },
            { upsert: true, new: true }
        );

        res.json({ message: 'Đã lưu câu trả lời!' });
    } catch (error) {
        console.error('Questionnaire error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Check if user has profile for a specific purpose
app.get('/api/profile/check/:purpose', authenticateToken, async (req, res) => {
    try {
        const { purpose } = req.params;
        
        const profile = await Profile.findOne({ 
            userId: req.user.id, 
            purpose 
        });
        
        res.json({ 
            hasProfile: !!profile,
            profile: profile ? profile.toObject() : null
        });
    } catch (error) {
        console.error('Profile check error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get profile for a specific purpose
app.get('/api/profile/:purpose', authenticateToken, async (req, res) => {
    try {
        const { purpose } = req.params;
        
        const profile = await Profile.findOne({ 
            userId: req.user.id, 
            purpose 
        });
        
        if (!profile) {
            return res.status(404).json({ error: 'Không tìm thấy profile' });
        }
        
        res.json({ 
            success: true,
            profile: profile.toObject()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Submit profile (POST)
app.post('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { purpose, answers } = req.body;

        // Update or create profile
        await Profile.findOneAndUpdate(
            { userId: req.user.id, purpose },
            { userId: req.user.id, purpose, answers },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Đã lưu câu trả lời!' });
    } catch (error) {
        console.error('Profile submit error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ============ MATCHING ALGORITHM ============

function calculateCompatibility(user1Answers, user2Answers, purpose) {
    const questionWeights = {
        love: {
            q1: 10, q2: 8, q3: 10, q4: 9, q5: 10,
            q6: 8, q7: 9, q8: 10, q9: 8, q10: 10,
            q11: 7, q12: 8, q13: 9, q14: 10
        },
        friend: { q1: 10, q2: 10, q3: 8, q4: 9 },
        study: {
            q1: 10, q2: 9, q3: 10, q4: 8, q5: 9,
            q6: 10, q7: 8, q8: 9, q9: 10
        },
        research: {
            q1: 10, q2: 9, q3: 10, q4: 8, q5: 10,
            q6: 9, q7: 10, q8: 9, q9: 10, q10: 8,
            q11: 9, q12: 10, q13: 9, q14: 10, q15: 8, q16: 10
        },
        roommate: {
            q1: 10, q2: 9, q3: 8, q4: 10, q5: 9, q6: 8, q7: 10
        }
    };

    const weights = questionWeights[purpose] || {};
    let totalScore = 0;
    let maxScore = 0;
    const matchDetails = {};

    for (const question in weights) {
        const weight = weights[question];
        maxScore += weight;

        const ans1 = user1Answers[question];
        const ans2 = user2Answers[question];

        if (ans1 === ans2) {
            totalScore += weight;
            matchDetails[question] = { match: true, weight };
        } else {
            matchDetails[question] = { match: false, weight };
        }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
        percentage,
        totalScore,
        maxScore,
        matchDetails
    };
}

// Find matches
app.post('/api/find-matches', authenticateToken, async (req, res) => {
    try {
        const { purpose } = req.body;

        // Get current user profile
        const userProfile = await Profile.findOne({ 
            userId: req.user.id, 
            purpose 
        });

        if (!userProfile) {
            return res.status(400).json({ error: 'Vui lòng hoàn thành bảng câu hỏi trước' });
        }

        // Get all other profiles for this purpose
        const allProfiles = await Profile.find({ 
            purpose,
            userId: { $ne: req.user.id }
        });

        // Calculate compatibility
        const matches = [];
        for (const profile of allProfiles) {
            const compatibility = calculateCompatibility(
                userProfile.answers,
                profile.answers,
                purpose
            );

            if (compatibility.percentage >= 60) {
                // Get user info
                const matchedUser = await User.findOne({ studentId: profile.userId });
                
                matches.push({
                    userId: profile.userId,
                    name: matchedUser ? matchedUser.name : 'Unknown',
                    faculty: matchedUser ? matchedUser.faculty : 'Unknown',
                    year: matchedUser ? matchedUser.year : 0,
                    compatibility: compatibility.percentage,
                    matchDetails: compatibility
                });
            }
        }

        // Sort by compatibility
        matches.sort((a, b) => b.compatibility - a.compatibility);

        res.json({ matches });
    } catch (error) {
        console.error('Find matches error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get matches (GET with query parameter)
app.get('/api/matches', authenticateToken, async (req, res) => {
    try {
        const { purpose } = req.query;

        if (!purpose) {
            return res.status(400).json({ error: 'Purpose is required' });
        }

        // Get current user profile
        const userProfile = await Profile.findOne({ 
            userId: req.user.id, 
            purpose 
        });

        if (!userProfile) {
            return res.json({ matches: [] });
        }

        // Get all other profiles for this purpose
        const allProfiles = await Profile.find({ 
            purpose,
            userId: { $ne: req.user.id }
        });

        // Calculate compatibility
        const matches = [];
        for (const profile of allProfiles) {
            const compatibility = calculateCompatibility(
                userProfile.answers,
                profile.answers,
                purpose
            );

            // Only include matches >= 70% (changed from 60%)
            if (compatibility.percentage >= 70) {
                // Get user info
                const matchedUser = await User.findOne({ studentId: profile.userId });
                
                // Check if already connected (bidirectional check)
                const existingConnection = await Connection.findOne({
                    $or: [
                        { userId: req.user.id, matchedUserId: profile.userId, purpose },
                        { userId: profile.userId, matchedUserId: req.user.id, purpose }
                    ]
                });
                
                console.log(`🔍 Checking ${profile.userId} for purpose ${purpose}: ${existingConnection ? 'CONNECTED' : 'NOT CONNECTED'}`);
                
                matches.push({
                    userId: profile.userId,
                    name: matchedUser ? matchedUser.name : 'Unknown',
                    faculty: matchedUser ? matchedUser.faculty : 'Unknown',
                    year: matchedUser ? matchedUser.year : 0,
                    purpose: purpose,
                    compatibility: compatibility.percentage,
                    matchDetails: compatibility,
                    isConnected: !!existingConnection
                });
            }
        }

        // Sort by compatibility
        matches.sort((a, b) => b.compatibility - a.compatibility);

        // LUỒNG ĐÚNG: Chỉ trả về 1 người phù hợp nhất chưa kết nối
        const bestMatch = matches.find(m => !m.isConnected);
        const result = bestMatch ? [bestMatch] : [];

        res.json({ matches: result });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ============ CONNECTION ROUTES ============

// Connect with a match
app.post('/api/connect', authenticateToken, async (req, res) => {
    try {
        const { matchedUserId, purpose, compatibility, matchDetails } = req.body;

        // CHECK PREMIUM: Kiểm tra và trừ lượt match
        const userPremiums = await Premium.find({ userId: req.user.id });
        
        // Find valid premium package
        const userPremium = userPremiums.find(p => {
            if (p.remainingMatches <= 0) return false;
            if (p.expiresAt) {
                return new Date(p.expiresAt) > new Date();
            }
            return true; // One-time packages without expiresAt
        });

        if (!userPremium) {
            return res.status(403).json({ 
                error: 'Bạn cần mua premium để kết nối',
                errorCode: 'NO_PREMIUM_MATCHES'
            });
        }

        // Check if already connected
        const existingConnection = await Connection.findOne({
            userId: req.user.id,
            matchedUserId,
            purpose
        });

        if (existingConnection) {
            return res.status(400).json({ error: 'Bạn đã kết nối với người này rồi' });
        }

        // Deduct match
        userPremium.remainingMatches -= 1;
        await userPremium.save();

        // Create connection
        const newConnection = new Connection({
            userId: req.user.id,
            matchedUserId,
            purpose,
            compatibility,
            matchDetails
        });

        await newConnection.save();

        // Get matched user email
        const matchedUser = await User.findOne({ studentId: matchedUserId });

        res.json({
            message: 'Kết nối thành công!',
            email: matchedUser ? matchedUser.email : null,
            remainingMatches: userPremium.remainingMatches
        });
    } catch (error) {
        console.error('Connect error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Create connection (POST)
app.post('/api/connection', authenticateToken, async (req, res) => {
    try {
        console.log('📥 Connection request received:', {
            userId: req.user.id,
            body: req.body,
            headers: req.headers['content-type']
        });

        const { matchedUserId, purpose, compatibility } = req.body;

        // Validate required fields
        if (!matchedUserId) {
            console.error('❌ matchedUserId is missing');
            return res.status(400).json({ error: 'matchedUserId is required' });
        }

        if (!purpose) {
            console.error('❌ purpose is missing');
            return res.status(400).json({ error: 'purpose is required' });
        }

        // CHECK PREMIUM: Verify and deduct match
        const userPremiums = await Premium.find({ userId: req.user.id });
        
        console.log('🔍 Found premiums for user:', {
            userId: req.user.id,
            premiumCount: userPremiums.length,
            premiums: userPremiums.map(p => ({
                id: p._id,
                remainingMatches: p.remainingMatches,
                expiresAt: p.expiresAt
            }))
        });
        
        // Find valid premium package
        const validPremium = userPremiums.find(p => {
            if (p.remainingMatches <= 0) return false;
            if (p.expiresAt) {
                return new Date(p.expiresAt) > new Date();
            }
            return true;
        });
        
        console.log('💎 Valid premium:', validPremium ? {
            id: validPremium._id,
            remainingMatches: validPremium.remainingMatches,
            expiresAt: validPremium.expiresAt
        } : 'NONE');

        let isFreeMatch = false;
        let remainingMatches = 0;

        if (!validPremium) {
            // No premium - check 24h cooldown for free match
            const user = await User.findOne({ studentId: req.user.id });
            
            if (!user) {
                console.error('❌ User not found with studentId:', req.user.id);
                return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
            }
            
            const now = new Date();
            const lastFreeMatch = user.lastFreeMatchTime;
            
            if (lastFreeMatch) {
                const hoursSinceLastMatch = (now - new Date(lastFreeMatch)) / (1000 * 60 * 60);
                if (hoursSinceLastMatch < 24) {
                    const hoursRemaining = Math.ceil(24 - hoursSinceLastMatch);
                    return res.status(403).json({ 
                        error: `Bạn cần đợi ${hoursRemaining} giờ nữa để match miễn phí hoặc mua premium`,
                        errorCode: 'COOLDOWN_ACTIVE',
                        hoursRemaining
                    });
                }
            }
            
            // Allow free match
            isFreeMatch = true;
            user.lastFreeMatchTime = now;
            await user.save();
            console.log('✅ Free match granted (24h cooldown starts)');
        } else {
            remainingMatches = validPremium.remainingMatches;
        }

        // Check if already connected (bidirectional check)
        const existingConnection = await Connection.findOne({
            $or: [
                { userId: req.user.id, matchedUserId, purpose },
                { userId: matchedUserId, matchedUserId: req.user.id, purpose }
            ]
        });

        if (existingConnection) {
            console.log('⚠️ Already connected:', existingConnection);
            return res.status(400).json({ error: 'Bạn đã kết nối với người này rồi' });
        }

        // Deduct premium match (only if not free match)
        if (!isFreeMatch) {
            validPremium.remainingMatches -= 1;
            await validPremium.save();
            remainingMatches = validPremium.remainingMatches;
            console.log(`💎 Premium deducted: ${remainingMatches} matches remaining`);
        }

        // Create connection
        const newConnection = new Connection({
            userId: req.user.id,
            matchedUserId,
            purpose,
            compatibility: compatibility || 0,
            matchDetails: {}
        });

        await newConnection.save();
        console.log('✅ Connection created:', newConnection);

        // Get matched user info
        const matchedUser = await User.findOne({ studentId: matchedUserId });

        res.json({
            success: true,
            message: 'Kết nối thành công!',
            isFreeMatch,
            remainingMatches,
            connection: {
                matchedUserId,
                name: matchedUser ? matchedUser.name : 'Unknown',
                email: matchedUser ? matchedUser.email : null
            },
            partnerContact: {
                email: matchedUser ? matchedUser.email : null,
                name: matchedUser ? matchedUser.name : 'Unknown',
                facebook: matchedUser?.contact?.facebook || null,
                instagram: matchedUser?.contact?.instagram || null,
                zalo: matchedUser?.contact?.zalo || null
            }
        });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Check connection status
app.get('/api/connection-status', authenticateToken, async (req, res) => {
    try {
        const { matchedUserId, purpose } = req.query;

        const connection = await Connection.findOne({
            userId: req.user.id,
            matchedUserId,
            purpose
        });

        res.json({
            isConnected: !!connection
        });
    } catch (error) {
        console.error('Connection status error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get user connections (my-connections)
app.get('/api/my-connections', authenticateToken, async (req, res) => {
    try {
        // FIX: Query both directions - where user is userId OR matchedUserId
        const connections = await Connection.find({
            $or: [
                { userId: req.user.id },
                { matchedUserId: req.user.id }
            ]
        });

        console.log(`📊 Found ${connections.length} connections for user ${req.user.id}`);

        // Get user details for each connection
        const connectionsWithDetails = await Promise.all(
            connections.map(async (conn) => {
                // Determine who is the "other" person
                const otherUserId = conn.userId === req.user.id ? conn.matchedUserId : conn.userId;
                const user = await User.findOne({ studentId: otherUserId });
                
                // Get profile for this purpose
                const profile = await Profile.findOne({ 
                    userId: otherUserId,
                    purpose: conn.purpose 
                });
                
                return {
                    id: conn._id,
                    matchedUserId: otherUserId,
                    purpose: conn.purpose,
                    compatibility: conn.compatibility,
                    createdAt: conn.createdAt,
                    partner: {
                        studentId: otherUserId,
                        name: user ? user.name : 'Unknown',
                        faculty: user ? user.faculty : 'Unknown',
                        year: user ? user.year : 0,
                        email: user ? user.email : null,
                        contact: user ? {
                            facebook: user.contact?.facebook || user.facebook,
                            instagram: user.contact?.instagram || user.instagram,
                            zalo: user.contact?.zalo || user.zalo
                        } : {},
                        profile: profile ? {
                            answers: profile.answers
                        } : null
                    }
                };
            })
        );

        res.json({ success: true, connections: connectionsWithDetails });
    } catch (error) {
        console.error('Get my connections error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Delete connection
app.delete('/api/connection/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await Connection.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!connection) {
            return res.status(404).json({ error: 'Không tìm thấy kết nối' });
        }

        res.json({ success: true, message: 'Đã xóa kết nối' });
    } catch (error) {
        console.error('Delete connection error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ============ PREMIUM ROUTES ============

// Get premium packages
app.get('/api/premium/packages', (req, res) => {
    const packages = [
        {
            id: 1,
            name: '1 Lượt Match',
            matches: 1,
            price: 5000,
            description: 'Phù hợp để thử nghiệm',
            type: 'one-time'
        },
        {
            id: 2,
            name: '3 Lượt Match',
            matches: 3,
            price: 12000,
            description: 'Tiết kiệm 20%',
            type: 'one-time'
        },
        {
            id: 3,
            name: '5 Lượt Match',
            matches: 5,
            price: 20000,
            description: 'Tiết kiệm 20%',
            type: 'one-time'
        },
        {
            id: 4,
            name: 'Monthly Premium',
            matches: 30,
            price: 149000,
            description: 'Không giới hạn trong 30 ngày',
            type: 'monthly'
        }
    ];

    res.json({ packages });
});

// Process premium payment (Fake MoMo)
// Premium payment endpoint
app.post('/api/premium/payment', authenticateToken, async (req, res) => {
    try {
        const { packageId } = req.body;

        const packages = {
            1: { name: '1 Lượt Match', matches: 1, price: 5000, type: 'one-time' },
            2: { name: '3 Lượt Match', matches: 3, price: 12000, type: 'one-time' },
            3: { name: '5 Lượt Match', matches: 5, price: 20000, type: 'one-time' },
            4: { name: 'Monthly Premium', matches: 30, price: 149000, type: 'monthly' }
        };

        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return res.status(400).json({ error: 'Gói không hợp lệ' });
        }

        // Create transaction
        const transactionId = 'MOMO' + Date.now();
        const newTransaction = new Transaction({
            transactionId,
            userId: req.user.id,
            packageName: selectedPackage.name,
            amount: selectedPackage.price,
            status: 'success'
        });

        await newTransaction.save();

        // Calculate expiry for monthly package
        let expiresAt = null;
        if (selectedPackage.type === 'monthly') {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
        }

        // Add premium
        const newPremium = new Premium({
            userId: req.user.id,
            packageName: selectedPackage.name,
            matches: selectedPackage.matches,
            remainingMatches: selectedPackage.matches,
            price: selectedPackage.price,
            expiresAt
        });

        await newPremium.save();

        res.json({
            success: true,
            message: 'Thanh toán thành công!',
            transactionId,
            package: selectedPackage
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
// Alias for backward compatibility
app.post('/api/premium/create-payment', authenticateToken, async (req, res) => {
    try {
        const { packageId } = req.body;

        const packages = {
            1: { name: '1 Lượt Match', matches: 1, price: 5000, type: 'one-time' },
            2: { name: '3 Lượt Match', matches: 3, price: 12000, type: 'one-time' },
            3: { name: '5 Lượt Match', matches: 5, price: 20000, type: 'one-time' },
            4: { name: 'Monthly Premium', matches: 30, price: 149000, type: 'monthly' }
        };

        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return res.status(400).json({ error: 'Gói không hợp lệ' });
        }

        // Create PENDING transaction (will be completed in MoMo page)
        const transactionId = 'MOMO' + Date.now();
        const orderId = 'ORDER_' + Date.now();
        
        const newTransaction = new Transaction({
            transactionId,
            userId: req.user.id,
            packageName: selectedPackage.name,
            amount: selectedPackage.price,
            status: 'pending'  // Changed to pending
        });

        await newTransaction.save();

        // Return payment URL for redirect
        const paymentUrl = `/momo-payment.html?orderId=${orderId}&amount=${selectedPackage.price}&packageId=${packageId}&transactionId=${transactionId}`;

        res.json({
            success: true,
            orderId,
            paymentUrl,
            amount: selectedPackage.price,
            transactionId
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// MoMo payment callback (complete payment)
app.post('/api/premium/payment-callback', authenticateToken, async (req, res) => {
    try {
        const { transactionId, packageId, status } = req.body;

        if (!transactionId || !packageId) {
            return res.status(400).json({ error: 'transactionId and packageId are required' });
        }

        // Find transaction
        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status === 'success') {
            return res.json({ success: true, message: 'Already processed' });
        }

        // Update transaction status
        transaction.status = status === 'success' ? 'success' : 'failed';
        await transaction.save();

        if (status === 'success') {
            // Create premium package
            const packages = {
                1: { name: '1 Lượt Match', matches: 1, price: 5000, type: 'one-time' },
                2: { name: '3 Lượt Match', matches: 3, price: 12000, type: 'one-time' },
                3: { name: '5 Lượt Match', matches: 5, price: 20000, type: 'one-time' },
                4: { name: 'Monthly Premium', matches: 30, price: 149000, type: 'monthly' }
            };

            const selectedPackage = packages[packageId];
            
            // Calculate expiry for monthly package
            let expiresAt = null;
            if (selectedPackage.type === 'monthly') {
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
            }

            // Add premium
            const newPremium = new Premium({
                userId: req.user.id,  // Use authenticated user
                packageName: selectedPackage.name,
                matches: selectedPackage.matches,
                remainingMatches: selectedPackage.matches,
                price: selectedPackage.price,
                expiresAt
            });

            await newPremium.save();

            res.json({
                success: true,
                message: 'Thanh toán thành công!',
                transactionId
            });
        } else {
            res.json({
                success: false,
                message: 'Thanh toán thất bại'
            });
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get user premium status
app.get('/api/premium/status', authenticateToken, async (req, res) => {
    try {
        const premiums = await Premium.find({ userId: req.user.id });

        // Filter valid premiums
        const validPremiums = premiums.filter(p => {
            if (p.remainingMatches <= 0) return false;
            if (p.expiresAt) {
                return new Date(p.expiresAt) > new Date();
            }
            return true;
        });

        const totalMatches = validPremiums.reduce((sum, p) => sum + p.remainingMatches, 0);

        res.json({
            hasPremium: validPremiums.length > 0,
            remainingMatches: totalMatches,
            premiums: validPremiums.map(p => ({
                packageName: p.packageName,
                remainingMatches: p.remainingMatches,
                expiresAt: p.expiresAt,
                purchasedAt: p.purchasedAt
            }))
        });
    } catch (error) {
        console.error('Premium status error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
