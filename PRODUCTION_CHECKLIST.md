# 🔍 PRODUCTION CHECKLIST - VNU Dating Website

## ✅ DANH SÁCH KIỂM TRA HỆ THỐNG

### 1️⃣ ENVIRONMENT & DEPLOYMENT
- [x] **Server File**: Production chạy `server-mongodb.js` (kiểm tra package.json)
- [x] **Environment Variables**: 
  - MONGODB_URI đã set trên Render
  - JWT_SECRET đã set trên Render
  - NODE_ENV=production
- [ ] **Database Connection**: MongoDB Atlas cluster accessible từ Render IP
- [x] **Git Repository**: Code đã push lên GitHub

### 2️⃣ DATABASE SCHEMA CONSISTENCY
- [x] **Connection Model (db.js)**:
  ```javascript
  userId: String (required)
  matchedUserId: String (required)  
  purpose: String (required)
  compatibility: Number
  matchDetails: Object
  createdAt: Date
  ```
- [x] **User Model**: studentId, name, password, faculty, year, email
- [x] **Profile Model**: userId, purpose, answers
- [x] **Orientation Model**: userId, purpose, answers
- [x] **Premium Model**: userId, packageName, matches, remainingMatches

### 3️⃣ API ENDPOINTS CONSISTENCY

#### Authentication
- [x] POST `/api/register` - Tạo user mới
- [x] POST `/api/login` - Login và return JWT token

#### Orientation & Profile
- [x] POST `/api/orientation` - Lưu answers orientation
- [x] GET `/api/orientation/check` - Kiểm tra đã làm orientation chưa
- [x] POST `/api/questionnaire` - Lưu profile answers

#### Matches
- [x] GET `/api/matches?purpose=love` - Lấy danh sách matches
- [x] Response phải có `purpose` field trong mỗi match object

#### Connection **⚠️ ĐANG DEBUG**
- [x] POST `/api/connection` - Body: `{ matchedUserId, purpose, compatibility? }`
- [ ] Validate request body có đầy đủ field
- [x] Check authentication token
- [x] Response: `{ success, message, connection }`

### 4️⃣ FRONTEND API CALLS

#### API URL Configuration ✅
- [x] `public/js/auth.js` - Dùng dynamic API_URL
- [x] `public/js/matches.js` - Dùng dynamic API_URL
- [x] `public/js/orientation.js` - Dùng dynamic API_URL
- [x] `public/js/profile.js` - Dùng dynamic API_URL
- [x] `public/js/questionnaire.js` - Dùng dynamic API_URL
- [x] `public/premium.html` - Dùng dynamic API_URL
- [x] `public/momo-payment.html` - Dùng dynamic API_URL

#### Connection Request Format **⚠️ CRITICAL**
```javascript
// Frontend gửi (matches.js line 238):
{
  matchedUserId: string,  // userId của người được chọn
  purpose: string         // 'love', 'friend', 'research'
}

// Backend expect (server-mongodb.js):
{
  matchedUserId: string (required),
  purpose: string (required),
  compatibility: number (optional)
}
```

### 5️⃣ LOCAL VS PRODUCTION DIFFERENCES

#### Local (nếu chạy npm run old-server):
- ❌ Dùng `server.js` - Schema sai (user1Id/user2Id thay vì userId/matchedUserId)
- ❌ Endpoint expect `targetUserId` thay vì `matchedUserId`

#### Production (Render):
- ✅ Dùng `server-mongodb.js` - Schema đúng
- ✅ Endpoint expect `matchedUserId`

**⚠️ WARNING**: Nếu local test với `npm start`, sẽ giống production. Nếu test với `npm run old-server`, sẽ khác!

### 6️⃣ COMMON ERRORS & SOLUTIONS

#### Error 400 at /api/connection
**Possible Causes:**
1. ❌ `matchedUserId` is null/undefined → Check: match.userId có tồn tại không
2. ❌ `purpose` is null/undefined → Check: localStorage.getItem('purpose') hoặc match.purpose
3. ❌ Request body format sai → Check: Content-Type = application/json
4. ❌ Authentication token invalid → Check: localStorage.getItem('token')

**Debug Steps:**
```bash
# Check Render logs
1. Vào Render Dashboard → vnu-dating-app → Logs
2. Tìm dòng "📥 Connection request received:"
3. Xem body có đầy đủ matchedUserId và purpose không
```

#### CORS Errors
- ✅ Đã fix: All frontend files dùng relative path '/api' thay vì 'http://localhost:3000/api'

#### MongoDB Connection Errors
- [ ] Check: MongoDB Atlas Network Access có allow Render IP không (0.0.0.0/0 để allow all)
- [ ] Check: MONGODB_URI env variable format đúng: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### 7️⃣ TEST FLOW (Phải test theo thứ tự)

1. **Register**
   - POST /api/register với đầy đủ thông tin
   - Response: `{ success: true, message }`

2. **Login**
   - POST /api/login với studentId + password
   - Response: `{ token, studentId, name }`
   - Save token vào localStorage

3. **Orientation**
   - GET /api/orientation/check?purpose=love
   - Nếu chưa làm → làm orientation
   - POST /api/orientation với answers

4. **Questionnaire**
   - POST /api/questionnaire với purpose + answers

5. **Get Matches**
   - GET /api/matches?purpose=love
   - Response: `{ matches: [{ userId, name, purpose, compatibility }] }`
   - Verify mỗi match có field `purpose`

6. **Connect** ⚠️
   - Click button "Kết nối với người này"
   - POST /api/connection với `{ matchedUserId, purpose }`
   - Check Render logs xem request body có gì
   - Nếu 400 → xem error message exact là gì

### 8️⃣ CURRENT STATUS

**Đã Fix:**
✅ All localhost:3000 URLs replaced
✅ server.js vs server-mongodb.js field naming identified
✅ Added purpose field to match objects in backend
✅ Debug logging added to /api/connection endpoint

**Đang Debug:**
⏳ Connection endpoint vẫn trả 400
⏳ Chờ Render deploy version mới với debug logs
⏳ Cần xem logs để biết exact error

**Next Steps:**
1. Đợi Render deploy xong (2-3 phút)
2. Test kết nối lại
3. Vào Render Logs xem output từ console.log
4. Dựa vào logs để fix chính xác

### 9️⃣ RENDER DEPLOYMENT INFO

- **GitHub Repo**: https://github.com/aquattda/vnu-dating-website
- **Deploy Branch**: main
- **Auto Deploy**: Enabled (mỗi lần push sẽ tự động deploy)
- **Build Command**: (none - Node.js auto detect)
- **Start Command**: `npm start` (chạy server-mongodb.js)

---

## 📝 DEBUGGING GUIDE

Khi gặp lỗi 400 at /api/connection:

1. **Mở Developer Console** (F12) → Network tab
2. **Click nút "Kết nối"**
3. **Xem request**:
   - URL: https://vnu-dating-app.onrender.com/api/connection
   - Method: POST
   - Headers: Content-Type = application/json?
   - Payload: matchedUserId và purpose có giá trị không?
4. **Xem response**:
   - Status: 400
   - Body: `{ error: "..." }` → error message là gì?
5. **Vào Render Logs**:
   - Tìm dòng "📥 Connection request received"
   - Xem body exact là gì
6. **Fix based on logs**

---

**Last Updated**: 2025-12-24
**Current Commit**: ee7f2e6 (Added debug logging)
