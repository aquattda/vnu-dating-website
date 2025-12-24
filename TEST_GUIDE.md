# 🧪 TEST DATA & FLOW GUIDE

## ✅ LUỒNG ĐÚNG BAN ĐẦU

### **Nguyên tắc cốt lõi:**
1. Mỗi lần xem matches, chỉ hiển thị **1 người phù hợp nhất** (tỷ lệ cao nhất ≥70%)
2. Sau khi kết nối với người đó, nếu muốn tìm tiếp → làm lại questionnaire
3. Premium giúp tăng số lần match (mỗi lần match = 1 kết nối)
4. Không show list nhiều người để chọn

### **User Flow:**
```
1. Đăng ký/Login
   ↓
2. Làm Orientation (9 câu hỏi định hướng)
   ↓
3. Chọn Purpose (love/friend/study/research/roommate)
   ↓
4. Làm Questionnaire chi tiết
   ↓
5. Xem Match → CHỈ 1 NGƯỜI PHÙ HỢP NHẤT
   ↓
6. Kết nối với người đó
   ↓
7. Hiển thị contact info (email, facebook, instagram, zalo)
   ↓
8. Muốn tìm thêm → Làm lại questionnaire
```

---

## 👥 TEST ACCOUNTS

**Password chung:** `123456`

### Matching Pairs (Purpose: friend)

#### Pair 1: 90% Match
- **User 001**: 
  - MSSV: `21020001`
  - Tên: Nguyễn Văn An
  - Gender: Male
  - Major: Công nghệ thông tin
  - Contact: facebook.com/nguyenvanan, @van_an_nguyen
  
- **User 002**: 
  - MSSV: `21020002`
  - Tên: Trần Thị Bình
  - Gender: Female
  - Major: Công nghệ thông tin
  - Contact: facebook.com/tranbinhthi, @binh_tran

#### Pair 2: 85% Match
- **User 003**: 
  - MSSV: `21020003`
  - Tên: Lê Văn Cường
  - Gender: Male
  - Major: Kinh tế
  
- **User 004**: 
  - MSSV: `21020004`
  - Tên: Phạm Thị Dung
  - Gender: Female
  - Major: Kinh tế

#### Pair 3: 88% Match
- **User 005**: 
  - MSSV: `21020005`
  - Tên: Hoàng Văn Em
  - Gender: Male
  - Major: Toán học
  
- **User 006**: 
  - MSSV: `21020006`
  - Tên: Vũ Thị Giang
  - Gender: Female
  - Major: Toán học

#### Pair 4: 92% Match (HIGHEST)
- **User 007**: 
  - MSSV: `21020007`
  - Tên: Đỗ Văn Hùng
  - Gender: Male
  - Major: Vật lý
  
- **User 008**: 
  - MSSV: `21020008`
  - Tên: Bùi Thị Hoa
  - Gender: Female
  - Major: Hóa học

#### Pair 5: 87% Match
- **User 009**: 
  - MSSV: `21020009`
  - Tên: Ngô Văn Khánh
  - Gender: Male
  - Major: Ngôn ngữ Anh
  
- **User 010**: 
  - MSSV: `21020010`
  - Tên: Đinh Thị Lan
  - Gender: Female
  - Major: Ngôn ngữ Anh

---

## 🧪 TEST SCENARIOS

### Scenario 1: Basic Flow
1. Login với `21020001` / `123456`
2. Đã có orientation sẵn → Chọn purpose "Tìm bạn"
3. Đã có profile sẵn → Xem matches
4. **KẾT QUẢ**: Chỉ thấy 1 người - Trần Thị Bình (90% match)
5. Click "Kết nối"
6. **KẾT QUẢ**: Hiển thị contact info của Trần Thị Bình

### Scenario 2: After Connection
1. User 001 đã kết nối với User 002
2. Muốn tìm người khác
3. **KHÔNG THỂ** vì đã match rồi với purpose này
4. Phải chọn purpose khác hoặc làm lại questionnaire

### Scenario 3: Test với User khác
1. Login với `21020007` / `123456`
2. Đã có profile sẵn (purpose: friend)
3. Xem matches
4. **KẾT QUẢ**: Chỉ thấy 1 người - Bùi Thị Hoa (92% match - HIGHEST)
5. Kết nối thành công

### Scenario 4: No Match
1. Login với user mới chưa có trong matching pairs
2. Làm questionnaire với answers khác hẳn
3. Xem matches
4. **KẾT QUẢ**: Không tìm thấy ai phù hợp (không có ai ≥70%)

---

## 📊 DATABASE STATUS

### Current Test Data:
- **Users**: 10 accounts (21020001 - 21020010)
- **Profiles**: 10 profiles (all purpose: friend)
- **Connections**: 0 (chưa ai kết nối)
- **Orientations**: 0 (users tự làm khi test)

### Data Generation:
```bash
# Tạo lại test data
node generate-test-users.js
```

---

## 🔧 KEY CHANGES

### 1. Matching Logic (server-mongodb.js)
```javascript
// OLD (SAI): Trả về tất cả matches ≥60%
if (compatibility.percentage >= 60) {
    matches.push(match);
}
res.json({ matches }); // Nhiều matches

// NEW (ĐÚNG): Chỉ trả về 1 best match ≥70%
if (compatibility.percentage >= 70) {
    matches.push(match);
}
matches.sort((a, b) => b.compatibility - a.compatibility);
const bestMatch = matches.find(m => !m.isConnected);
res.json({ matches: bestMatch ? [bestMatch] : [] }); // 0 hoặc 1 match
```

### 2. Schema Update (db.js)
- Added: `id`, `gender`, `birthYear`, `hometown`, `major`, `phone`
- Added: `contact { facebook, instagram, zalo }`
- Connection supports both `userId/matchedUserId` and `user1Id/user2Id`

### 3. Response Structure
```javascript
// Connection response
{
  success: true,
  message: 'Kết nối thành công!',
  connection: { ... },
  partnerContact: {
    email: "...",
    name: "...",
    facebook: "...",
    instagram: "...",
    zalo: "..."
  }
}
```

---

## ✅ CHECKLIST BEFORE TESTING

- [x] Render deployed latest code (commit: 52c24be)
- [x] MongoDB has 10 test users with profiles
- [x] Matching returns only 1 best match ≥70%
- [x] Connection shows full contact info
- [x] Profile.html displays user data correctly

---

## 🐛 KNOWN ISSUES & FIXES

### Issue: Profile.html không cập nhật
**Status**: Cần kiểm tra
**Debug**: Xem console logs, check API calls

### Issue: Nhiều người match
**Status**: ✅ FIXED - Chỉ còn 1 người best match

### Issue: Thiếu contact info
**Status**: ✅ FIXED - Đã thêm facebook, instagram, zalo

---

**Last Updated**: 2025-12-24  
**Current Commit**: 52c24be  
**Production URL**: https://vnu-dating-app.onrender.com
