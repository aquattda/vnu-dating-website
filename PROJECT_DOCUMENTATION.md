# VNU DATING - TÀI LIỆU DỰ ÁN

## 📋 TỔNG QUAN DỰ ÁN

**Tên dự án:** VNU Dating - Website kết nối sinh viên VNU  
**Ngày tạo:** Tháng 12/2024  
**Công nghệ:** 
- Backend: Node.js, Express.js v4.18.2
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Authentication: JWT (jsonwebtoken v9.0.2)
- Database: JSON file-based storage
- Security: bcryptjs v2.4.3

---

## 🎯 MỤC ĐÍCH DỰ ÁN

Website giúp sinh viên VNU kết nối với nhau theo 4 mục đích:
1. **Tìm người yêu** ❤️ - Kết nối lãng mạn, nghiêm túc
2. **Tìm bạn** 🤝 - Mở rộng quan hệ xã hội
3. **Tìm đồng nghiệp nghiên cứu** 📚 - Cộng tác học thuật
4. **Tìm Roommate** 🏠 - Chia sẻ chỗ ở

---

## 🏗️ CẤU TRÚC DỰ ÁN

```
c:\test\
├── database/
│   ├── users.json           # Thông tin tài khoản người dùng
│   ├── profiles.json        # Câu trả lời questionnaire
│   ├── connections.json     # Lịch sử kết nối
│   └── orientations.json    # Định hướng kết nối
├── public/
│   ├── css/
│   │   └── style.css        # CSS chính (1000+ lines)
│   ├── js/
│   │   ├── auth.js          # Đăng ký/đăng nhập
│   │   ├── orientation.js   # Câu hỏi định hướng
│   │   ├── purpose.js       # Chọn mục đích
│   │   ├── questionnaire.js # Xử lý questionnaire
│   │   ├── matches.js       # Tìm kiếm & kết nối
│   │   ├── profile.js       # Quản lý hồ sơ
│   │   └── modal.js         # Custom modal system
│   ├── index.html           # Trang đăng ký/đăng nhập
│   ├── questionnaire-orientation.html  # 9 câu định hướng
│   ├── purpose.html         # Chọn 4 mục đích
│   ├── questionnaire-love.html        # 13 câu tìm người yêu
│   ├── questionnaire-friend.html      # 9 câu tìm bạn
│   ├── questionnaire-research.html    # 12 câu nghiên cứu
│   ├── questionnaire-roommate.html    # 10 câu tìm roommate
│   ├── matches.html         # Hiển thị kết quả phù hợp
│   └── profile.html         # Hồ sơ cá nhân
├── server.js                # Express server (643 lines)
├── package.json
└── PROJECT_DOCUMENTATION.md
```

---

## 📱 LUỒNG NGƯỜI DÙNG (USER FLOW)

### 1. Đăng ký & Đăng nhập
```
index.html → Đăng ký
  ↓
Nhập thông tin cơ bản:
  - Mã sinh viên
  - Giới tính
  - Năm sinh
  - Quê quán
  - Ngành học
  - Facebook
  - Instagram
  - Mật khẩu
  ↓
Tạo tài khoản → Login
```

### 2. Định hướng kết nối (MỚI)
```
questionnaire-orientation.html
  ↓
9 câu hỏi định hướng:
  1. Giới tính của bạn
  2. Muốn kết nối với ai (Nam/Nữ/Cả hai)
  3. Mục tiêu mối quan hệ
  4. Mức độ sẵn sàng
  5. Thời gian rảnh
  6. Phong cách trò chuyện
  7. Vùng thoải mái
  8. Phong cách sống
  9. Phản ứng với áp lực
  ↓
Lưu vào orientations.json
  ↓
purpose.html
```

### 3. Chọn mục đích & Câu hỏi chi tiết
```
purpose.html → Chọn 1 trong 4 mục đích
  ↓
questionnaire-[purpose].html
  ↓
Trả lời câu hỏi chi tiết → Lưu vào profiles.json
  ↓
matches.html
```

### 4. Xem kết quả & Kết nối
```
matches.html
  ↓
Hiển thị người ≥70% phù hợp
  ↓
Nhấn "Kết nối" → Custom modal confirm
  ↓
Kiểm tra 3 điều kiện:
  - Chưa từng kết nối (one-time rule)
  - Không có active connection
  - [TẮT] Cooldown 24h
  ↓
Thành công → Hiển thị Facebook & Instagram
```

---

## 🔐 HỆ THỐNG XÁC THỰC

### Authentication Flow
```javascript
// Đăng ký
POST /api/register
Body: { studentId, gender, birthYear, hometown, major, facebook, instagram, password }
→ Hash password với bcrypt
→ Tạo userId unique
→ Lưu vào users.json
→ Response: { success: true }

// Đăng nhập
POST /api/login
Body: { studentId, password }
→ Kiểm tra user tồn tại
→ Verify password
→ Tạo JWT token (expires: 7 days)
→ Check orientation → Redirect
  - Có orientation: purpose.html
  - Chưa có: questionnaire-orientation.html
```

### JWT Token
- Secret Key: `vnu-dating-secret-key-2024`
- Payload: `{ id, studentId }`
- Thời hạn: 7 ngày
- Lưu ở: localStorage

---

## 📊 DATABASE SCHEMA

### 1. users.json
```json
{
  "id": "1000000001",
  "studentId": "20020001",
  "password": "$2a$10$...", // bcrypt hash
  "gender": "male",
  "birthYear": 2002,
  "hometown": "Hà Nội",
  "major": "Công nghệ thông tin",
  "contact": {
    "facebook": "facebook.com/user",
    "instagram": "@username"
  },
  "createdAt": "2025-12-02T10:00:00.000Z"
}
```

### 2. orientations.json (MỚI)
```json
{
  "userId": "1000000001",
  "studentId": "20020001",
  "myGender": "male",
  "targetGender": "female", // male | female | both
  "relationshipGoal": "long-term",
  "readiness": "very-ready",
  "freeTime": "go-out",
  "conversationStyle": "talk-much",
  "comfortZone": "with-others",
  "lifestyle": "balanced",
  "stressResponse": "share",
  "createdAt": "2025-12-24T00:00:00.000Z"
}
```

### 3. profiles.json
```json
{
  "userId": "1000000001",
  "studentId": "20020001",
  "purpose": "love", // love | friend | research | roommate
  "answers": {
    "name": "Nguyễn Văn A",
    "height": "175",
    "appearance": "attractive",
    "lifestyle": "active",
    // ... các câu trả lời khác
  },
  "createdAt": "2025-12-02T11:00:00.000Z"
}
```

### 4. connections.json
```json
{
  "id": "conn_1735059000000",
  "user1Id": "1000000001",
  "user2Id": "1000000002",
  "purpose": "love",
  "status": "active", // active | cancelled
  "createdAt": "2025-12-23T10:00:00.000Z",
  "cancelledAt": null, // ISO timestamp nếu bị hủy
  "cancelledBy": null  // userId người hủy
}
```

---

## 🚀 API ENDPOINTS

### Authentication APIs
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/register` | ❌ | Đăng ký tài khoản mới |
| POST | `/api/login` | ❌ | Đăng nhập |
| GET | `/api/user-info` | ✅ | Lấy thông tin user (gender, birthYear, etc.) |

### Orientation APIs (MỚI)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/orientation` | ✅ | Lưu định hướng kết nối (9 câu hỏi) |
| GET | `/api/orientation/check` | ✅ | Kiểm tra đã có orientation chưa |

### Profile APIs
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/profile` | ✅ | Lưu/cập nhật profile theo purpose |
| GET | `/api/profile` | ✅ | Lấy tất cả profiles của user |
| GET | `/api/profile/check/:purpose` | ✅ | Kiểm tra có profile cho purpose này không |
| PUT | `/api/profile/:purpose` | ✅ | Cập nhật profile |
| GET | `/api/profile/history` | ✅ | Lấy lịch sử log câu trả lời |

### Matching & Connection APIs
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/matches?purpose=` | ✅ | Tìm người phù hợp ≥70% |
| POST | `/api/connection` | ✅ | Tạo kết nối mới |
| GET | `/api/my-connections` | ✅ | Lấy danh sách kết nối active |
| DELETE | `/api/connection/:id` | ✅ | Hủy kết nối (mark as cancelled) |
| GET | `/api/connection-status` | ✅ | Check cooldown status |

---

## 🎨 TÍNH NĂNG CHI TIẾT

### 1️⃣ Hệ thống đăng ký/đăng nhập

**Hạng mục:** Authentication  
**File liên quan:** 
- `index.html` - UI form
- `js/auth.js` - Logic xử lý
- `server.js` - API backend

**Chi tiết:**
- Form đăng ký với 9 trường thông tin
- Validation client-side & server-side
- Hash password với bcrypt (salt rounds: 10)
- JWT token authentication
- localStorage để lưu token & studentId
- Auto-redirect sau login (check orientation)

**Đặc điểm:**
- CSS custom với gradient đẹp
- Placeholder có emoji
- Error/success message animation
- Toggle giữa login/register form

---

### 2️⃣ Câu hỏi định hướng kết nối (MỚI)

**Hạng mục:** Orientation Survey  
**File liên quan:**
- `questionnaire-orientation.html`
- `js/orientation.js`
- `database/orientations.json`

**Chi tiết:**
- **9 câu hỏi** để xác định định hướng:
  1. **Giới tính của bạn**: Nam / Nữ / Khác
  2. **Muốn kết nối với ai**: Nam / Nữ / Cả hai
  3. **Mục tiêu mối quan hệ**: Lâu dài / Tìm hiểu chậm / Chưa xác định
  4. **Mức độ sẵn sàng**: Rất sẵn sàng / Khá sẵn sàng / Cần thời gian
  5. **Thời gian rảnh**: Ở nhà / Ra ngoài / Tùy thời điểm
  6. **Phong cách trò chuyện**: Nói nhiều / Lắng nghe / Nói khi cần
  7. **Vùng thoải mái**: Một mình / Cùng người khác / Linh hoạt
  8. **Phong cách sống**: Vui vẻ / Nghiêm túc / Cân bằng
  9. **Phản ứng áp lực**: Chia sẻ / Tự giải quyết / Tránh tiếp xúc

**Luồng hoạt động:**
```
Login → Check orientation
  - Chưa có → questionnaire-orientation.html
  - Đã có → purpose.html
```

**Chức năng chỉnh sửa:**
- Xem orientation trong profile.html
- Nút "Chỉnh sửa định hướng"
- Auto-fill form với giá trị cũ
- Lưu lại và quay về profile

**Tác động đến Matching:**
- `targetGender` dùng để lọc đối tượng match
- `both` → match với tất cả giới tính
- `male` / `female` → chỉ match với giới tính đó

---

### 3️⃣ Chọn mục đích kết nối

**Hạng mục:** Purpose Selection  
**File liên quan:**
- `purpose.html`
- `js/purpose.js`

**Chi tiết:**
- **4 purpose cards** ngang 1 hàng:
  - ❤️ Tìm người yêu
  - 🤝 Tìm bạn
  - 📚 Tìm đồng nghiệp nghiên cứu
  - 🏠 Tìm Roommate (MỚI)
  
**CSS:** 
- Cards 200x240px
- Gap 20px
- Gradient background
- Hover effect: translateY + scale + shadow

**Logic:**
- Check profile tồn tại cho purpose
- Có profile → matches.html
- Chưa có → questionnaire-[purpose].html

---

### 4️⃣ Bộ câu hỏi theo mục đích

**Hạng mục:** Questionnaires  

#### A. Tìm người yêu (questionnaire-love.html)
- **13 câu hỏi:**
  1. Tên/biệt danh (text input)
  2. Chiều cao (text input)
  3. Ngoại hình tự đánh giá (3 options)
  4. Lối sống (3 options)
  5. Thái độ du lịch (3 options)
  6. Tính cách (3 options)
  7. Sáng tạo (3 options)
  8. Phong cách hẹn hò (3 options)
  9. Tính cách lý tưởng (2 options)
  10. Ưu tiên trong tình yêu (3 options)
  11. Mục tiêu quan hệ (2 options)
  12. Tầm quan trọng sở thích chung (3 options)
  13. Sẵn sàng thử mới (3 options)

#### B. Tìm bạn (questionnaire-friend.html)
- **9 câu hỏi:**
  1. Tên/biệt danh
  2. Tính cách (hướng ngoại/nội)
  3. Sở thích (5 options)
  4. Gặp bạn bè (online/offline/cả hai)
  5. Quy mô nhóm (2-3 / 4-6 / lớn hơn)
  6. Hoạt động (động / tĩnh)
  7. Tính cách bạn lý tưởng (4 options)
  8. Chia sẻ (3 mức độ)
  9. Mục tiêu (dài hạn/ngắn hạn)

#### C. Tìm nghiên cứu (questionnaire-research.html)
- **12 câu hỏi:**
  1. Tên/biệt danh
  2. Lĩnh vực (4 options)
  3. Trình độ (3 options)
  4. Kinh nghiệm (3 options)
  5. Mục đích (4 options)
  6. Thời gian (3 options)
  7. Phong cách làm việc (2 options)
  8. Địa điểm (3 options)
  9. Khung giờ (3 options)
  10. Kỹ năng cần (3 options)
  11. Làm việc nhóm (có/không)
  12. Giá trị nhóm (3 options)

#### D. Tìm Roommate (questionnaire-roommate.html) - MỚI
- **10 câu hỏi:**
  1. Tên/biệt danh
  2. Khu vực ở (5 quận Hà Nội)
  3. Ngân sách (4 mức)
  4. Số người ở chung (3 options)
  5. Thời gian sinh hoạt (sớm/muộn/linh hoạt)
  6. Mức độ sạch sẽ (3 options)
  7. Tiệc tùng (thường/thỉnh thoảng/hiếm)
  8. Hút thuốc (có/không/OK cả hai)
  9. Kiểu roommate (thân thiện/yên tĩnh/cân bằng)
  10. Chia sẻ đồ dùng (có/tùy/không)

**Đặc điểm chung:**
- Navigation: Next/Back buttons
- Progress bar động
- Validation từng câu
- Disable inputs khi không active
- Auto-merge thông tin user (gender, birthYear, hometown, major)
- Custom CSS cho text input với gradient focus

---

### 5️⃣ Thuật toán Matching

**Hạng mục:** Matching Algorithm  
**File:** `server.js` - `/api/matches`

**Chi tiết thuật toán:**

```javascript
// BƯỚC 1: Lọc candidates
1. Cùng purpose
2. Không phải chính mình
3. Chưa từng kết nối (kể cả cancelled)

// BƯỚC 2: Lọc theo orientation (MỚI)
if (myOrientation.targetGender) {
  if (targetGender === 'both') {
    // Match tất cả
  } else {
    // Chỉ match với candidateOrientation.myGender === targetGender
  }
}

// BƯỚC 3: Tính điểm matching
for each candidate:
  totalQuestions = 0
  matchingAnswers = 0
  
  for each answer in myAnswers:
    if (theirAnswers có answer này):
      totalQuestions++
      if (myAnswers[key] === theirAnswers[key]):
        matchingAnswers++
  
  matchPercent = (matchingAnswers / totalQuestions) * 100

// BƯỚC 4: Lọc ≥70%
qualifiedMatches = matches.filter(m => m.matchPercent >= 70)

// BƯỚC 5: Sắp xếp giảm dần
qualifiedMatches.sort((a, b) => b.matchPercent - a.matchPercent)
```

**Privacy:**
- KHÔNG trả về contact (facebook, instagram) trong matches
- Chỉ hiển thị sau khi connect thành công

---

### 6️⃣ Hệ thống kết nối (Connection System)

**Hạng mục:** Connection Management  
**File:** `server.js`, `js/matches.js`

**3 Rules kiểm tra khi kết nối:**

#### ✅ CHECK 1: One-Time Rule (ACTIVE)
```javascript
// Mỗi cặp chỉ kết nối được 1 lần DUY NHẤT
// Tìm trong TẤT CẢ connections (kể cả cancelled)
const hasConnectedBefore = connections.find(conn => 
  conn.purpose === purpose &&
  ((conn.user1Id === myId && conn.user2Id === targetId) ||
   (conn.user1Id === targetId && conn.user2Id === myId))
);

if (hasConnectedBefore) {
  return ERROR: ALREADY_CONNECTED_BEFORE
}
```

#### ✅ CHECK 2: Active Connection (ACTIVE)
```javascript
// Không được có active connection với cùng purpose
const existingActive = connections.find(conn =>
  conn.status === 'active' &&
  conn.purpose === purpose &&
  (conn.user1Id === myId || conn.user2Id === myId ||
   conn.user1Id === targetId || conn.user2Id === targetId)
);

if (existingActive) {
  return ERROR: HAS_ACTIVE_CONNECTION
}
```

#### ❌ CHECK 3: 24h Cooldown (DISABLED FOR TESTING)
```javascript
// ĐANG TẮT ĐỂ TEST
/* COMMENTED OUT FOR TESTING
const timeSinceLastConnection = Date.now() - lastConnection.createdAt
if (timeSinceLastConnection < 24 * 60 * 60 * 1000) {
  const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - timeSinceLastConnection) / (1000 * 60 * 60))
  return ERROR: COOLDOWN_ACTIVE, hoursLeft
}
*/
```

**Kết nối thành công:**
```javascript
// Tạo connection mới
const connection = {
  id: `conn_${Date.now()}`,
  user1Id: myId,
  user2Id: targetUserId,
  purpose: purpose,
  status: 'active',
  createdAt: new Date().toISOString()
}

// Lấy contact của partner
const partnerUser = users.find(u => u.id === targetUserId)
const partnerContact = {
  facebook: partnerUser.contact.facebook,
  instagram: partnerUser.contact.instagram
}

// Response
return {
  success: true,
  message: 'Kết nối thành công!',
  partnerContact: partnerContact
}
```

**Hiển thị contact:**
- Replace `.match-actions` div
- Show Facebook & Instagram links
- Không có nút "Kết nối" nữa

---

### 7️⃣ Custom Modal System

**Hạng mục:** UI Components  
**File:** `js/modal.js`, `css/style.css`

**Chi tiết:**
- **5 loại modal:**
  1. `customAlert()` - Thông báo thông thường
  2. `customConfirm()` - Xác nhận với Promise
  3. `customSuccess()` - Thông báo thành công (✅)
  4. `customError()` - Thông báo lỗi (❌)
  5. `customWarning()` - Cảnh báo (⚠️)

**CSS Features:**
- Backdrop blur effect
- FadeIn + SlideUp animation
- Gradient buttons
- Warning box với border màu
- Responsive mobile
- Close on backdrop click

**Ví dụ sử dụng:**
```javascript
// Confirm với warning list
const confirmed = await customConfirm(
  'Bạn có chắc muốn kết nối với người này?',
  'Xác nhận kết nối',
  {
    icon: '🤝',
    showWarning: true,
    warningTitle: 'LƯU Ý:',
    warningList: [
      'Mỗi cặp chỉ có thể kết nối 1 lần duy nhất',
      'Bạn chỉ được tạo 1 kết nối mỗi 24 giờ',
      'Sau khi kết nối, cả hai sẽ chỉ thấy nhau'
    ],
    confirmText: 'OK',
    cancelText: 'Cancel'
  }
);
```

**Thay thế cho:**
- ❌ `alert()` → ✅ `customAlert()`
- ❌ `confirm()` → ✅ `customConfirm()`

---

### 8️⃣ Trang hồ sơ cá nhân

**Hạng mục:** Profile Management  
**File:** `profile.html`, `js/profile.js`

**Các section:**

#### A. Thông tin tài khoản
- Mã sinh viên
- Contact info (Facebook, Instagram)

#### B. Định hướng kết nối (MỚI)
- Hiển thị 9 câu trả lời orientation
- Format với emoji đẹp
- Nút "Chỉnh sửa định hướng"
- Auto-fill form khi edit

#### C. Thông tin kết nối (Multi-purpose)
- Hiển thị tất cả profiles theo purpose
- Mỗi purpose có card riêng
- Nút "Chỉnh sửa" cho từng purpose
- Nút "Xem matches" cho từng purpose
- Log chi tiết câu trả lời
- Ngày tạo / cập nhật

#### D. Kết nối hiện tại
- List các active connections
- Avatar emoji theo gender
- Tên, Match %, Purpose
- Contact info (Facebook, Instagram)
- Nút "Hủy kết nối" (custom modal confirm)

**Chức năng:**
- Load orientation + profiles + connections
- Edit orientation → auto-fill form
- Edit profile → auto-fill questionnaire
- View matches theo purpose
- Disconnect với confirm modal

---

### 9️⃣ Trang Matches & Kết nối

**Hạng mục:** Matching & Connection  
**File:** `matches.html`, `js/matches.js`

**Chi tiết:**

#### A. Hiển thị Matches
- Grid layout responsive
- Match cards với:
  - Avatar emoji
  - Tên
  - Match % với gradient màu
  - Các câu trả lời quan trọng
  - Nút "Xem hồ sơ" (placeholder)
  - Nút "Kết nối với người này"

#### B. Cooldown Banner
```javascript
checkConnectionStatus() {
  // Hiển thị banner nếu trong cooldown
  "⏰ Bạn đã tạo kết nối trong vòng 24h gần đây"
  "Có thể kết nối tiếp sau: X giờ Y phút"
  // HIỆN TẠI: Không hiển thị vì cooldown đã tắt
}
```

#### C. Kết nối
- Click button → Custom modal confirm
- Warning list 3 điểm
- OK → Gọi API
- Success → Show contact info
- Error → Custom error modal

#### D. Không có matches
- Empty state với icon 😔
- Message hướng dẫn
- Nút "Chọn lại mục đích"

---

## 🎨 THIẾT KẾ UI/UX

### Color Palette
```css
--primary: #FF6B9D;        /* Pink chính */
--secondary: #4FACFE;      /* Blue phụ */
--danger: #EF476F;         /* Đỏ cảnh báo */
--success: #06D6A0;        /* Xanh thành công */
--dark: #1A202C;           /* Text tối */
--gray-dark: #4A5568;      /* Text phụ */
--gray: #718096;           /* Text nhạt */
--gray-light: #CBD5E0;     /* Border */
--gray-lighter: #E2E8F0;   /* Background nhạt */
--white: #FFFFFF;
```

### Gradients
```css
/* Primary gradient */
background: linear-gradient(135deg, #FF6B9D 0%, #4FACFE 100%);

/* Card gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Hover gradient */
background: linear-gradient(90deg, rgba(255,107,157,0.05) 0%, rgba(79,172,254,0.05) 100%);
```

### Animations
```css
@keyframes fadeIn { opacity: 0 → 1 }
@keyframes slideUp { translateY(50px) → 0 }
@keyframes fadeInUp { opacity: 0, translateY(20px) → 1, 0 }
```

### Responsive
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px
- Breakpoints: 480px, 768px

---

## 🔧 CẤU HÌNH & SETUP

### Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5"
  }
}
```

### Server Configuration
```javascript
PORT = 3000
JWT_SECRET = 'vnu-dating-secret-key-2024'
JWT_EXPIRES = '7d'
BCRYPT_SALT_ROUNDS = 10
```

### Chạy server
```bash
npm install
npm start
# Server: http://localhost:3000
```

---

## 📋 DANH SÁCH TÍNH NĂNG

### ✅ Đã hoàn thành

1. **Authentication System**
   - [x] Đăng ký với validation
   - [x] Đăng nhập JWT
   - [x] Password hashing với bcrypt
   - [x] Auto-redirect sau login
   - [x] Logout & clear localStorage

2. **Orientation Survey (MỚI)**
   - [x] 9 câu hỏi định hướng kết nối
   - [x] Lưu vào database riêng
   - [x] Check orientation sau login
   - [x] Hiển thị trong profile
   - [x] Chức năng chỉnh sửa với auto-fill
   - [x] Dùng targetGender để lọc matches

3. **Purpose Selection**
   - [x] 4 purpose cards (Love, Friend, Research, Roommate)
   - [x] CSS responsive 1 hàng ngang
   - [x] Hover effects
   - [x] Auto-redirect dựa vào profile tồn tại

4. **Questionnaire System**
   - [x] 4 bộ câu hỏi riêng biệt
   - [x] Progress bar động
   - [x] Navigation Next/Back
   - [x] Validation từng câu
   - [x] Text input với CSS đẹp
   - [x] Radio options với emoji
   - [x] Auto-merge user info
   - [x] Edit mode với auto-fill

5. **Matching Algorithm**
   - [x] Tính % phù hợp
   - [x] Lọc theo orientation (targetGender)
   - [x] Lọc ≥70%
   - [x] Loại bỏ người đã kết nối
   - [x] Sắp xếp theo điểm
   - [x] Privacy: không show contact

6. **Connection System**
   - [x] One-time connection rule
   - [x] Active connection blocking
   - [x] 24h cooldown (đã tắt để test)
   - [x] Cooldown status API
   - [x] Connection history tracking
   - [x] Cancel connection (soft delete)
   - [x] Show contact sau khi connect

7. **Profile Management**
   - [x] Multi-purpose profiles display
   - [x] Orientation section (MỚI)
   - [x] Edit orientation (MỚI)
   - [x] Edit profile per purpose
   - [x] View matches per purpose
   - [x] Active connections list
   - [x] Contact info display
   - [x] Disconnect functionality

8. **Custom Modal System**
   - [x] 5 loại modal (alert, confirm, success, error, warning)
   - [x] Backdrop blur
   - [x] Animations
   - [x] Warning box
   - [x] Promise-based confirm
   - [x] Thay thế browser alert/confirm

9. **UI/UX Enhancements**
   - [x] Gradient color scheme
   - [x] Smooth animations
   - [x] Emoji icons
   - [x] Responsive design
   - [x] Loading states
   - [x] Empty states
   - [x] Error handling

### 🚧 Tính năng đang phát triển

1. **Xem hồ sơ chi tiết**
   - [ ] Modal xem full profile
   - [ ] Tất cả câu trả lời
   - [ ] Avatar/ảnh đại diện

2. **Chat System**
   - [ ] Real-time chat
   - [ ] Notification
   - [ ] Message history

3. **Recommendation System**
   - [ ] AI-based suggestions
   - [ ] Collaborative filtering
   - [ ] User behavior tracking

### 💡 Ý tưởng tương lai

1. **Advanced Features**
   - [ ] Upload ảnh profile
   - [ ] Video giới thiệu
   - [ ] Verify danh tính
   - [ ] Premium membership
   - [ ] Advanced search filters

2. **Social Features**
   - [ ] Events & activities
   - [ ] Group matching
   - [ ] Community forums
   - [ ] Success stories

3. **Analytics**
   - [ ] Admin dashboard
   - [ ] User statistics
   - [ ] Matching success rate
   - [ ] System reports

---

## 🐛 BUGS & ISSUES

### Known Issues

1. **Cooldown hiện tắt**
   - Status: ĐANG TẮT ĐỂ TEST
   - Location: server.js CHECK 3
   - Fix: Uncomment code block để enable lại

2. **Empty orientation check**
   - Nếu user tạo từ trước update này
   - Chưa có orientation → cần làm lại

### Bug Fixes History

1. ✅ Navigation error trong questionnaire → Fixed bằng visible sections array
2. ✅ CSS syntax errors → Fixed và redesign hoàn toàn
3. ✅ Connection path undefined → Added connections.json vào DB_PATH
4. ✅ Multi-profile không hiển thị → Đổi API return array
5. ✅ Gender filtering không đúng → Thay bằng orientation system
6. ✅ Browser alert xấu → Tạo custom modal system

---

## 📝 NOTES & TIPS

### Development Tips

1. **Testing Connection Flow:**
   - Cooldown đang tắt → có thể test unlimited
   - CHECK 1 và CHECK 2 vẫn active
   - Dùng 2 accounts để test matching

2. **Database Management:**
   - JSON files auto-save
   - Backup trước khi test
   - Use Date.now() cho unique IDs

3. **Debugging:**
   - Check browser console
   - Network tab cho API calls
   - localStorage inspection

### Best Practices

1. **Code Organization:**
   - 1 file JS per HTML page
   - Shared utilities trong modal.js
   - CSS organized theo sections

2. **Security:**
   - Never expose JWT_SECRET
   - Hash passwords với bcrypt
   - Validate tất cả inputs
   - Sanitize user data

3. **Performance:**
   - Minimize API calls
   - Cache localStorage data
   - Lazy load images (future)
   - Optimize matching algorithm

---

## 📧 CONTACT & CREDITS

**Developer:** AI Assistant (GitHub Copilot)  
**Project Type:** Student Dating Platform  
**Technology Stack:** MERN-lite (Node.js + Vanilla JS)  
**License:** Private/Educational Use  
**Version:** 2.0 (với Orientation System)  

---

## � BÁO GIÁ DỰ ÁN

| Hạng mục | Chi tiết công việc | Tính năng liên quan | Tiến độ công việc | Đơn giá ước tính (VNĐ) |
|----------|-------------------|---------------------|-------------------|------------------------|
| **UX/UI DESIGNER** | **Thiết kế trải nghiệm & Giao diện người dùng** | | | **12.000.000** |
| Visual Design Core | Thiết kế giao diện đăng ký/đăng nhập, Purpose selection cards, Profile page | Authentication & Navigation | Hoàn thành | 3.000.000 |
| Questionnaire UI | Thiết kế 4 bộ câu hỏi với progress bar, radio options với emoji, text input styling | Orientation & Purpose Surveys | Hoàn thành | 2.500.000 |
| Match Cards Design | Thiết kế Match cards với gradient, percentage display, contact info section | Matching System | Hoàn thành | 2.000.000 |
| Custom Modal System | Thiết kế modal với backdrop blur, warning box, animation effects | UI Components | Hoàn thành | 1.500.000 |
| Responsive Design | Mobile-first design cho tất cả trang, breakpoints 480px/768px | Cross-device Support | Hoàn thành | 3.000.000 |
| **FRONTEND** | **Lập trình giao diện & Tương tác (Client-side)** | | | **28.000.000** |
| Authentication System | Form đăng ký/đăng nhập, JWT localStorage, auto-redirect logic | Auth Flow | Hoàn thành | 4.000.000 |
| Orientation Survey | 9 câu hỏi định hướng kết nối, validation, progress tracking, edit mode với auto-fill | User Profiling | Hoàn thành | 5.000.000 |
| Purpose Selection | 4 purpose cards (Love/Friend/Research/Roommate), check existing profile logic | Purpose Module | Hoàn thành | 2.000.000 |
| Questionnaire Module | 4 bộ questionnaire động (13+9+12+10 câu), navigation, disable/enable inputs logic | Dynamic Forms | Hoàn thành | 6.000.000 |
| Matching Display | Render match cards với filtering, show contact info sau connect, empty states | Match Results | Hoàn thành | 4.000.000 |
| Connection Flow | Custom modal confirm với warning list, error handling cho 3 rules, instant contact reveal | Connection Logic | Hoàn thành | 3.000.000 |
| Profile Management | Multi-purpose profiles display, orientation section, active connections list, edit functions | User Dashboard | Hoàn thành | 4.000.000 |
| **BACKEND** | **Lập trình hệ thống & Cơ sở dữ liệu (Server-side)** | | | **32.000.000** |
| Database Architecture | 4 JSON collections (users, profiles, orientations, connections), schema design | Data Structure | Hoàn thành | 5.000.000 |
| Authentication APIs | Register/Login endpoints, JWT generation, bcrypt password hashing | Security Layer | Hoàn thành | 4.000.000 |
| Orientation APIs | POST/GET orientation, check existence, merge với user data | Orientation System | Hoàn thành | 3.000.000 |
| Profile APIs | Save/Update/Get profiles, check by purpose, multi-profile support, history logging | Profile Management | Hoàn thành | 5.000.000 |
| Matching Algorithm | 70% threshold calculation, orientation-based filtering (targetGender), exclude connected users | Smart Matching | Hoàn thành | 8.000.000 |
| Connection System | 3-rule validation (one-time/active/cooldown), create/cancel connections, soft delete | Connection Logic | Hoàn thành | 5.000.000 |
| Cooldown & Status | 24h cooldown tracking (tắt để test), connection status API, countdown calculation | Rate Limiting | Hoàn thành | 2.000.000 |
| **TESTING & DEPLOYMENT** | **Kiểm thử & Triển khai** | | | **8.000.000** |
| Manual Testing | Test toàn bộ luồng: Auth → Orientation → Purpose → Questionnaire → Matching → Connection | Quality Assurance | Hoàn thành | 3.000.000 |
| Bug Fixes | Sửa lỗi navigation, CSS syntax, connection path, multi-profile display, gender filtering | Bug Resolution | Hoàn thành | 2.500.000 |
| Server Setup | Cấu hình Node.js server, Express routing, CORS, body-parser, port 3000 | Infrastructure | Hoàn thành | 1.500.000 |
| Documentation | Tài liệu dự án 500+ dòng markdown, API docs, database schema, user flow | Project Handover | Hoàn thành | 1.000.000 |
| | | | **TỔNG CỘNG** | **80.000.000** |

### Chi tiết phân bổ ngân sách

**1. UX/UI Design (12.000.000 VNĐ - 15%)**
- **Visual Design Core (3tr):** Giao diện 8 pages (index, orientation, purpose, 4 questionnaires, matches, profile)
- **Questionnaire UI (2.5tr):** Custom progress bar, radio với emoji, text input với gradient focus effect
- **Match Cards (2tr):** Card layout với gradient percentage, avatar emoji, answer display
- **Custom Modal (1.5tr):** 5 loại modal thay browser alert/confirm, backdrop blur, animations
- **Responsive (3tr):** Mobile-first cho tất cả components, 3 breakpoints

**2. Frontend Development (28.000.000 VNĐ - 35%)**
- **Authentication (4tr):** JWT auth flow, form validation, redirect logic based on orientation
- **Orientation Survey (5tr):** 9 câu hỏi định hướng, edit mode với auto-fill từ database
- **Purpose Selection (2tr):** 4 cards với check profile logic, auto-navigate
- **Questionnaire Module (6tr):** 4 bộ questionnaire với tổng 44 câu, dynamic navigation, validation
- **Matching Display (4tr):** Filter ≥70%, orientation filtering, show/hide contact logic
- **Connection Flow (3tr):** Modal confirm, 3-rule error handling, instant contact reveal
- **Profile Management (4tr):** Show multi-purpose profiles, orientation section, connections list

**3. Backend Development (32.000.000 VNĐ - 40%)**
- **Database (5tr):** 4 JSON collections với schema design, CRUD operations
- **Auth APIs (4tr):** Register/Login, JWT generation (7 days), bcrypt hashing
- **Orientation APIs (3tr):** Save/update orientation, check existence, one-per-user
- **Profile APIs (5tr):** Multi-purpose profiles, update/create, history tracking
- **Matching Algorithm (8tr):** Calculate percentage, orientation filtering, exclude connected
- **Connection System (5tr):** 3 validation rules, create/cancel, history tracking
- **Cooldown System (2tr):** 24h tracking, status API, countdown calculation

**4. Testing & Deployment (8.000.000 VNĐ - 10%)**
- **Manual Testing (3tr):** Full user flow testing, edge cases, multi-user scenarios
- **Bug Fixes (2.5tr):** 6+ critical bugs resolved (navigation, CSS, connection logic)
- **Server Setup (1.5tr):** Express server config, dependencies, localhost:3000
- **Documentation (1tr):** PROJECT_DOCUMENTATION.md với 500+ dòng, chi tiết đầy đủ

### 💎 Tính năng nổi bật đã phát triển

✅ **Orientation-Based Matching** - Lọc đối tượng dựa vào định hướng (Nam/Nữ/Cả hai)  
✅ **Multi-Purpose Profiles** - 1 user có thể có 4 profiles khác nhau  
✅ **One-Time Connection Rule** - Mỗi cặp chỉ kết nối 1 lần duy nhất  
✅ **Instant Contact Reveal** - Hiển thị Facebook/Instagram ngay sau kết nối  
✅ **Custom Modal System** - UI/UX hiện đại thay alert/confirm mặc định  
✅ **Progress Tracking** - Progress bar động cho questionnaire  
✅ **Smart Filtering** - Loại bỏ người đã kết nối khỏi kết quả match  
✅ **Edit Functionality** - Chỉnh sửa orientation & profiles với auto-fill  

### 🛠️ Công nghệ & Thư viện sử dụng

- **Backend:** Node.js, Express v4.18.2, bcryptjs v2.4.3, jsonwebtoken v9.0.2
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 với Custom Properties
- **Database:** JSON file-based storage (4 collections)
- **Security:** JWT authentication, password hashing, input validation
- **UI/UX:** Custom animations, gradients, responsive design, emoji icons

---

## �📜 CHANGELOG

### Version 2.0 (December 24, 2025)
- ✨ Thêm Orientation Survey với 9 câu hỏi
- ✨ Orientation-based matching filter
- ✨ Edit orientation trong profile
- ✨ Custom Modal System thay browser alert/confirm
- ✨ Thêm mục đích "Tìm Roommate" với 10 câu hỏi
- 🎨 CSS cho text input trong questionnaire
- 🎨 Purpose cards responsive 4 cards/row

### Version 1.5 (December 23, 2025)
- ✅ One-time connection rule
- ✅ 24h cooldown system
- ✅ Connection history tracking
- ✅ Soft delete connections
- ⚠️ Tắt cooldown để test

### Version 1.0 (December 22, 2025)
- 🎉 Ra mắt dự án
- ✅ Basic authentication
- ✅ 3 questionnaires (love, friend, research)
- ✅ Matching algorithm 70%
- ✅ Gender filtering
- ✅ Multi-profile system
- ✅ Connection management
- ✅ Profile page

---

**Last Updated:** December 24, 2025  
**Status:** ✅ Production Ready (with testing mode)
