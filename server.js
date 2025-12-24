const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { connectDB, User, Profile, Orientation, Connection, Premium, Transaction } = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'vnu-dating-secret-key-2024';

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
        if (err) return res.status(403).json({ error: 'Token hết hạn' });
        req.user = user;
        next();
    });
}

// Routes

// Đăng ký
app.post('/api/register', async (req, res) => {
    try {
        const { studentId, password, gender, birthYear, hometown, major, facebook, instagram } = req.body;

        if (!studentId || !password || !gender || !birthYear || !hometown || !major) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        const users = await User.find();
        
        // Kiểm tra mã sinh viên đã tồn tại
        if (users.find(u => u.studentId === studentId)) {
            return res.status(400).json({ error: 'Mã sinh viên đã được đăng ký' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = new User({
            studentId,
            password: hashedPassword,
            gender,
            birthYear,
            hometown,
            major,
            contact: {
                facebook: facebook || '',
                instagram: instagram || ''
            },
            createdAt: new Date()
        });

        await newUser.save();

        res.json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        const users = await User.find();
        const user = users.find(u => u.studentId === studentId);

        if (!user) {
            return res.status(401).json({ error: 'Mã sinh viên không tồn tại' });
        }

        // Kiểm tra password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user.id, studentId: user.studentId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                studentId: user.studentId
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// API lưu orientation (câu hỏi định hướng)
app.post('/api/orientation', authenticateToken, async (req, res) => {
    try {
        const { orientation } = req.body;
        // Xóa orientation cũ của user này nếu có
        await Orientation.deleteOne({ userId: req.user.id });
        // Tạo orientation mới
        const newOrientation = new Orientation({
            userId: req.user.id,
            answers: orientation.answers || {},
            completedAt: new Date()
        });
        await newOrientation.save();
        res.json({ success: true, message: 'Lưu định hướng kết nối thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// API kiểm tra user đã có orientation chưa
app.get('/api/orientation/check', authenticateToken, async (req, res) => {
    try {
        const orientation = await Orientation.findOne({ userId: req.user.id });
        res.json({
            success: true,
            hasOrientation: !!orientation,
            orientation: orientation || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// API lấy thông tin user (gender, birthYear, hometown, major)
app.get('/api/user-info', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        res.json({
            success: true,
            user: {
                gender: user.gender,
                birthYear: user.birthYear,
                hometown: user.hometown,
                major: user.major
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Lưu profile (mục đích và câu trả lời)
app.post('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { purpose, answers } = req.body;
        const profiles = await Profile.find();

        // Xóa profile cũ với cùng purpose nếu có (cho phép user update)
        await Profile.deleteMany({ userId: req.user.id, purpose });

        // Tạo profile mới
        const newProfile = new Profile({
            userId: req.user.id,
            studentId: req.user.studentId,
            purpose,
            answers,
            createdAt: new Date()
        });

        await newProfile.save();

        res.json({ success: true, message: 'Lưu thông tin thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Kiểm tra user có profile cho purpose này chưa
app.get('/api/profile/check/:purpose', authenticateToken, async (req, res) => {
    try {
        const { purpose } = req.params;
        const profile = await Profile.findOne({ userId: req.user.id, purpose });
        
        res.json({ hasProfile: !!profile });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Lấy profile của user
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const profiles = await Profile.find();
        const users = await User.find();
        
        // Lấy tất cả profiles của user này
        const userProfiles = profiles.filter(p => p.userId === req.user.id);
        const user = users.find(u => u.id === req.user.id);

        if (userProfiles.length > 0 && user) {
            res.json({ 
                profiles: userProfiles.map(profile => ({
                    ...profile,
                    userInfo: {
                        studentId: user.studentId,
                        contact: user.contact
                    }
                }))
            });
        } else {
            res.json({ profiles: [] });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Cập nhật profile (chỉnh sửa câu trả lời)
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { purpose, answers } = req.body;
        const profiles = await Profile.find();

        // Xóa profile cũ với cùng purpose nếu có
        await Profile.deleteMany({ userId: req.user.id, purpose });

        // Tạo profile mới
        const newProfile = new Profile({
            userId: req.user.id,
            studentId: req.user.studentId,
            purpose,
            answers,
            updatedAt: new Date(),
            createdAt: profiles.find(p => p.userId === req.user.id && p.purpose === purpose)?.createdAt || new Date()
        });

        await newProfile.save();

        res.json({ success: true, message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Lấy lịch sử log câu trả lời
app.get('/api/profile/history', authenticateToken, async (req, res) => {
    try {
        const profiles = await Profile.find();
        const userProfiles = profiles.filter(p => p.userId === req.user.id);

        if (userProfiles.length === 0) {
            return res.json({ history: [] });
        }

        res.json({ 
            history: userProfiles.map(profile => ({
                purpose: profile.purpose,
                answers: profile.answers,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt || profile.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Tìm matches
app.get('/api/matches', authenticateToken, async (req, res) => {
    try {
        const { purpose } = req.query;
        const profiles = await Profile.find();
        const users = await User.find();
        const connections = await Connection.find();
        const orientations = await Orientation.find({});
        
        // Lấy orientation của user hiện tại
        const myOrientation = orientations.find(o => o.userId === req.user.id);
        
        // Nếu có purpose trong query, lấy profile theo purpose đó
        // Nếu không có, lấy profile mới nhất của user
        let myProfile;
        if (purpose) {
            myProfile = profiles.find(p => p.userId === req.user.id && p.purpose === purpose);
        } else {
            myProfile = profiles.find(p => p.userId === req.user.id);
        }

        if (!myProfile) {
            return res.json({ matches: [] });
        }

        const myAnswers = myProfile.answers || {};
        
        // Lấy danh sách userIds đã từng có connection với user này (kể cả đã hủy)
        const connectedUserIds = new Set();
        connections.forEach(conn => {
            if (conn.purpose === myProfile.purpose) {
                // Nếu user1 là mình thì thêm user2, và ngược lại
                if (conn.user1Id === req.user.id) {
                    connectedUserIds.add(conn.user2Id);
                } else if (conn.user2Id === req.user.id) {
                    connectedUserIds.add(conn.user1Id);
                }
            }
        });

        // Lọc profiles cùng purpose (trừ profile của mình VÀ những người đã từng kết nối)
        let candidates = profiles.filter(
            p => p.purpose === myProfile.purpose && 
                 p.userId !== req.user.id &&
                 !connectedUserIds.has(p.userId)
        );

        // ===== ROOMMATE HARD CONSTRAINT: roomStatus MATCHING =====
        // Người chưa có phòng CHỈ được match với người đã có phòng, và ngược lại
        if (myProfile.purpose === 'roommate' && myAnswers.roomStatus) {
            candidates = candidates.filter(candidate => {
                const theirAnswers = candidate.answers || {};
                // Nếu tôi chưa có phòng → chỉ match với người ĐÃ có phòng
                if (myAnswers.roomStatus === 'noRoom') {
                    return theirAnswers.roomStatus === 'hasRoom';
                }
                // Nếu tôi ĐÃ có phòng → chỉ match với người CHƯA có phòng
                else if (myAnswers.roomStatus === 'hasRoom') {
                    return theirAnswers.roomStatus === 'noRoom';
                }
                return false; // Trường hợp không xác định → không match
            });
        }

        // Lọc theo targetGender từ orientation (nếu có)
        if (myOrientation && myOrientation.targetGender) {
            candidates = candidates.filter(candidate => {
                // Lấy orientation của candidate
                const candidateOrientation = orientations.find(o => o.userId === candidate.userId);
                if (!candidateOrientation || !candidateOrientation.myGender) return false;
                
                const targetGender = myOrientation.targetGender;
                const candidateGender = candidateOrientation.myGender;
                
                // Logic lọc:
                // - Nếu targetGender = 'male' → chỉ match với người có myGender = 'male'
                // - Nếu targetGender = 'female' → chỉ match với người có myGender = 'female'
                // - Nếu targetGender = 'both' → match với tất cả
                if (targetGender === 'both') {
                    return true;
                } else {
                    return candidateGender === targetGender;
                }
            });
        }

        // Tính điểm matching
        const matches = candidates.map(candidate => {
            let totalQuestions = 0;
            let matchingAnswers = 0;
            const theirAnswers = candidate.answers || {};

            // So sánh các câu trả lời với trọng số
            Object.keys(myAnswers).forEach(key => {
                if (theirAnswers.hasOwnProperty(key)) {
                    // Xác định trọng số cho câu hỏi
                    let weight = 1; // Mặc định trọng số = 1
                    
                    // Câu hỏi quan trọng với trọng số x2:
                    // - studyFormat cho purpose "study" (Hình thức học tập)
                    // - myStatus, partnerStatus, workFormat cho purpose "research" (Trạng thái đề tài & Hình thức làm việc)
                    if (myProfile.purpose === 'study' && key === 'studyFormat') {
                        weight = 2;
                    } else if (myProfile.purpose === 'research' && 
                              (key === 'myStatus' || key === 'partnerStatus' || key === 'workFormat')) {
                        weight = 2;
                    }
                    
                    totalQuestions += weight;
                    if (myAnswers[key] === theirAnswers[key]) {
                        matchingAnswers += weight;
                    }
                }
            });

            // Tính phần trăm phù hợp
            const matchPercent = totalQuestions > 0 
                ? Math.round((matchingAnswers / totalQuestions) * 100) 
                : 0;

            // KHÔNG trả về thông tin liên hệ - chỉ hiển thị sau khi kết nối
            return {
                ...candidate,
                matchPercent
            };
        });

        // Lọc chỉ những người có tỷ lệ >= 60%
        const qualifiedMatches = matches.filter(m => m.matchPercent >= 60);

        // Sắp xếp theo phần trăm phù hợp
        qualifiedMatches.sort((a, b) => b.matchPercent - a.matchPercent);

        res.json({ matches: qualifiedMatches });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Kiểm tra trạng thái cooldown của user
app.get('/api/connection-status', authenticateToken, async (req, res) => {
    try {
        const connections = await Connection.find();
        
        // Lấy tất cả connections của user
        const userConnections = connections.filter(c => 
            c.user1Id === req.user.id || c.user2Id === req.user.id
        );
        
        if (userConnections.length === 0) {
            return res.json({ 
                canConnect: true,
                message: 'Bạn có thể tạo kết nối mới'
            });
        }
        
        // Tìm connection gần nhất
        const latestConnection = userConnections.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        const timeSinceLastConnection = Date.now() - new Date(latestConnection.createdAt).getTime();
        const hoursLeft = 24 - (timeSinceLastConnection / (1000 * 60 * 60));
        
        if (timeSinceLastConnection < 24 * 60 * 60 * 1000) {
            return res.json({
                canConnect: false,
                cooldownActive: true,
                hoursLeft: Math.ceil(hoursLeft),
                minutesLeft: Math.ceil((hoursLeft * 60) % 60),
                nextConnectionTime: new Date(new Date(latestConnection.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
                message: `Bạn chỉ được kết nối 1 lần mỗi 24 giờ. Vui lòng thử lại sau ${Math.ceil(hoursLeft)} giờ nữa.`
            });
        }
        
        return res.json({
            canConnect: true,
            message: 'Bạn có thể tạo kết nối mới'
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Tạo connection (kết nối với người match)
app.post('/api/connection', authenticateToken, async (req, res) => {
    try {
        const { targetUserId, purpose } = req.body;
        const connections = await Connection.find();
        
        // CHECK 1: Kiểm tra xem 2 người này đã từng kết nối với nhau chưa (kể cả đã hủy)
        const hasConnectedBefore = connections.find(c => 
            c.purpose === purpose && (
                (c.user1Id === req.user.id && c.user2Id === targetUserId) ||
                (c.user1Id === targetUserId && c.user2Id === req.user.id)
            )
        );
        
        if (hasConnectedBefore) {
            return res.status(400).json({ 
                error: 'Bạn đã từng kết nối với người này rồi. Mỗi cặp chỉ có thể kết nối 1 lần duy nhất.',
                errorCode: 'ALREADY_CONNECTED_BEFORE'
            });
        }
        
        // CHECK 2: Kiểm tra xem user hoặc target có connection active với purpose này không
        const existingActiveConnection = connections.find(c => 
            c.purpose === purpose && 
            c.status !== 'cancelled' && (
                (c.user1Id === req.user.id || c.user2Id === req.user.id) ||
                (c.user1Id === targetUserId || c.user2Id === targetUserId)
            )
        );
        
        if (existingActiveConnection) {
            return res.status(400).json({ 
                error: 'Một trong hai người đã có kết nối active với purpose này rồi',
                errorCode: 'HAS_ACTIVE_CONNECTION'
            });
        }
        
        // CHECK 3: Kiểm tra giới hạn 24h - ĐANG TẮT ĐỂ TEST
        /* COMMENTED OUT FOR TESTING
        const userConnections = connections.filter(c => 
            c.user1Id === req.user.id || c.user2Id === req.user.id
        );
        
        if (userConnections.length > 0) {
            // Tìm connection gần nhất
            const latestConnection = userConnections.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            
            const timeSinceLastConnection = Date.now() - new Date(latestConnection.createdAt).getTime();
            const hoursLeft = 24 - (timeSinceLastConnection / (1000 * 60 * 60));
            
            if (timeSinceLastConnection < 24 * 60 * 60 * 1000) { // 24 giờ
                return res.status(400).json({ 
                    error: `Bạn chỉ được kết nối 1 lần mỗi 24 giờ. Vui lòng thử lại sau ${Math.ceil(hoursLeft)} giờ nữa.`,
                    errorCode: 'COOLDOWN_ACTIVE',
                    hoursLeft: Math.ceil(hoursLeft)
                });
            }
        }
        */
        
        // CHECK PREMIUM: Kiểm tra và trừ lượt match
        const premiums = await Premium.find();
        const userPremium = premiums.find(p => {
            // Kiểm tra có lượt match còn lại
            if (p.userId !== req.user.id || p.remainingMatches <= 0) {
                return false;
            }
            
            // Nếu có expiresAt (gói monthly), check hạn sử dụng
            if (p.expiresAt) {
                return new Date(p.expiresAt) > new Date();
            }
            
            // Gói 1 lần (không có expiresAt) thì luôn valid nếu còn lượt
            return true;
        });

        if (!userPremium) {
            // Không có premium hoặc hết lượt
            return res.status(403).json({ 
                error: 'Bạn cần mua premium để kết nối. Vui lòng nâng cấp tài khoản!',
                errorCode: 'NO_PREMIUM_MATCHES'
            });
        }

        // Trừ 1 lượt match
        userPremium.remainingMatches -= 1;
        await Premium.updateMany({ userId: req.user.id }, { remainingMatches: userPremium.remainingMatches });
        console.log(`✅ Đã trừ 1 lượt match của user ${req.user.id}. Còn lại: ${userPremium.remainingMatches}`);

        // Tạo connection mới
        const newConnection = new Connection({
            user1Id: req.user.id,
            user2Id: targetUserId,
            purpose,
            status: 'active',
            createdAt: new Date()
        });
        
        await newConnection.save();
        
        // Lấy thông tin liên hệ của partner để trả về
        const partnerUser = await User.findById(targetUserId);
        const partnerContact = partnerUser?.contact || {};
        
        res.json({ 
            success: true, 
            message: 'Kết nối thành công!', 
            connection: newConnection,
            partnerContact: {
                facebook: partnerContact.facebook || '',
                instagram: partnerContact.instagram || ''
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Xóa connection (hủy kết nối)
app.delete('/api/connection/:connectionId', authenticateToken, async (req, res) => {
    try {
        const { connectionId } = req.params;
        const connections = await Connection.find();
        
        // Tìm connection
        const connectionIndex = connections.findIndex(c => c.id === connectionId);
        
        if (connectionIndex === -1) {
            return res.status(404).json({ error: 'Không tìm thấy kết nối' });
        }
        
        const connection = connections[connectionIndex];
        
        // Kiểm tra xem user có phải là một trong hai người trong connection không
        if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'Bạn không có quyền hủy kết nối này' });
        }
        
        // Đánh dấu là cancelled thay vì xóa (để track lịch sử)
        await Connection.updateOne({ id: connectionId }, { status: 'cancelled', cancelledAt: new Date(), cancelledBy: req.user.id });
        
        res.json({ success: true, message: 'Đã hủy kết nối' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Lấy danh sách connections của user
app.get('/api/my-connections', authenticateToken, async (req, res) => {
    try {
        const connections = await Connection.find();
        const profiles = await Profile.find();
        const users = await User.find();
        
        // Lấy tất cả active connections của user này
        const myConnections = connections.filter(c => 
            c.status !== 'cancelled' && (
                c.user1Id === req.user.id || c.user2Id === req.user.id
            )
        );
        
        // Thêm thông tin chi tiết của partner
        const connectionsWithDetails = myConnections.map(conn => {
            const partnerId = conn.user1Id === req.user.id ? conn.user2Id : conn.user1Id;
            const partnerProfile = profiles.find(p => p.userId === partnerId && p.purpose === conn.purpose);
            const partnerUser = users.find(u => u.id === partnerId);
            
            return {
                ...conn,
                partner: {
                    userId: partnerId,
                    studentId: partnerUser?.studentId,
                    profile: partnerProfile,
                    contact: partnerUser?.contact
                }
            };
        });
        
        res.json({ connections: connectionsWithDetails });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// ===== PREMIUM SYSTEM =====

// Get premium packages
app.get('/api/premium/packages', (req, res) => {
    const packages = [
        {
            id: 'package_1',
            name: 'Gói 1 lượt',
            matches: 1,
            price: 5000,
            duration: null,
            description: 'Thêm 1 lượt match trong ngày'
        },
        {
            id: 'package_3',
            name: 'Gói 3 lượt',
            matches: 3,
            price: 12000,
            duration: null,
            description: 'Thêm 3 lượt match trong ngày',
            discount: '20%'
        },
        {
            id: 'package_5',
            name: 'Gói 5 lượt',
            matches: 5,
            price: 20000,
            duration: null,
            description: 'Thêm 5 lượt match trong ngày',
            discount: '33%'
        },
        {
            id: 'package_monthly',
            name: 'Premium Monthly',
            matches: 3,
            price: 149000,
            duration: 30,
            description: '3 lượt mỗi ngày + Ưu tiên tốc độ',
            badge: 'HOT'
        }
    ];
    res.json({ packages });
});

// Get user premium status
app.get('/api/premium/status', authenticateToken, async (req, res) => {
    try {
        const premiums = await Premium.find();
        const userPremium = premiums.find(p => p.userId === req.user.id);
        
        if (!userPremium) {
            return res.json({
                isPremium: false,
                remainingMatches: 0,
                package: null
            });
        }
        
        // Check if premium expired
        if (userPremium.expiresAt && new Date(userPremium.expiresAt) < new Date()) {
            return res.json({
                isPremium: false,
                remainingMatches: 0,
                package: null,
                expired: true
            });
        }
        
        // Check if daily matches need reset (for monthly package)
        if (userPremium.packageId === 'package_monthly') {
            const lastReset = new Date(userPremium.lastReset || userPremium.createdAt);
            const now = new Date();
            
            // Reset if it's a new day
            if (lastReset.getDate() !== now.getDate() || 
                lastReset.getMonth() !== now.getMonth() ||
                lastReset.getFullYear() !== now.getFullYear()) {
                userPremium.remainingMatches = 3;
                userPremium.lastReset = now.toISOString();
                await Premium.updateMany({ userId: req.user.id }, { remainingMatches: 3, lastReset: now.toISOString() });
            }
        }
        
        res.json({
            isPremium: true,
            remainingMatches: userPremium.remainingMatches,
            package: userPremium.packageId,
            expiresAt: userPremium.expiresAt,
            isMonthly: userPremium.packageId === 'package_monthly'
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Create payment (fake MoMo)
app.post('/api/premium/create-payment', authenticateToken, async (req, res) => {
    try {
        const { packageId } = req.body;
        
        const packages = {
            'package_1': { matches: 1, price: 5000, duration: null },
            'package_3': { matches: 3, price: 12000, duration: null },
            'package_5': { matches: 5, price: 20000, duration: null },
            'package_monthly': { matches: 3, price: 149000, duration: 30 }
        };
        
        if (!packages[packageId]) {
            return res.status(400).json({ error: 'Gói không hợp lệ' });
        }
        
        const pkg = packages[packageId];
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create transaction
        const transaction = new Transaction({
            id: orderId,
            userId: req.user.id,
            packageId,
            amount: pkg.price,
            status: 'pending',
            paymentMethod: 'momo',
            createdAt: new Date()
        });
        
        await transaction.save();
        
        // Generate fake MoMo payment URL
        const paymentUrl = `/momo-payment.html?orderId=${orderId}&amount=${pkg.price}`;
        
        res.json({
            success: true,
            orderId,
            paymentUrl,
            amount: pkg.price
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Process payment callback (fake MoMo)
app.post('/api/premium/payment-callback', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const transaction = await Transaction.findById(orderId);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        if (status === 'success') {
            transaction.status = 'success';
            transaction.completedAt = new Date();
            
            // Update user premium
            const premiums = await Premium.find();
            const packages = {
                'package_1': { matches: 1, duration: null },
                'package_3': { matches: 3, duration: null },
                'package_5': { matches: 5, duration: null },
                'package_monthly': { matches: 3, duration: 30 }
            };
            
            const pkg = packages[transaction.packageId];
            let userPremium = premiums.find(p => p.userId === transaction.userId);
            
            if (!userPremium) {
                userPremium = {
                    userId: transaction.userId,
                    packageId: transaction.packageId,
                    remainingMatches: pkg.matches,
                    createdAt: new Date()
                };
                
                if (pkg.duration) {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + pkg.duration);
                    userPremium.expiresAt = expiresAt;
                    userPremium.lastReset = new Date();
                }
                
                await new Premium(userPremium).save();
            } else {
                // Add matches to existing premium
                userPremium.remainingMatches += pkg.matches;
                
                // If buying monthly, extend expiration
                if (transaction.packageId === 'package_monthly') {
                    const expiresAt = new Date(userPremium.expiresAt || new Date());
                    expiresAt.setDate(expiresAt.getDate() + 30);
                    userPremium.expiresAt = expiresAt;
                    userPremium.packageId = 'package_monthly';
                }
                await Premium.updateMany({ userId: transaction.userId }, userPremium);
            }
            
            await Transaction.updateMany({ id: orderId }, { status: 'success', completedAt: new Date() });
            
            res.json({ success: true, message: 'Payment successful' });
        } else {
            transaction.status = 'failed';
            await Transaction.updateMany({ id: orderId }, { status: 'failed' });
            res.json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Use premium match (deduct 1 match)
app.post('/api/premium/use-match', authenticateToken, async (req, res) => {
    try {
        const premiums = await Premium.find();
        const userPremium = premiums.find(p => p.userId === req.user.id);
        
        if (!userPremium || userPremium.remainingMatches <= 0) {
            return res.status(403).json({ error: 'No premium matches available' });
        }
        
        userPremium.remainingMatches -= 1;
        await Premium.updateMany({ userId: req.user.id }, { remainingMatches: userPremium.remainingMatches });
        
        res.json({ 
            success: true, 
            remainingMatches: userPremium.remainingMatches 
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
