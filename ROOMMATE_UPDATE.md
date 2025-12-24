# CẬP NHẬT BỘ CÂU HỎI ROOMMATE

## 📋 TỔNG QUAN
- **Ngày cập nhật:** 24/12/2025
- **File cập nhật:** 
  - `public/questionnaire-roommate.html`
  - `server.js` (matching algorithm)

## 🔥 THAY ĐỔI QUAN TRỌNG

### 1. Cấu trúc câu hỏi mới (7 câu)
**Thay thế hoàn toàn 10 câu cũ:**

#### ❗ **Câu 1: Room Status (BẮT BUỘC MATCHING)**
- **Field:** `roomStatus`
- **Lựa chọn:**
  - `hasRoom`: Đã có phòng 🏠
  - `noRoom`: Chưa có phòng 🔍
- **Vai trò:** HARD CONSTRAINT cho matching

#### Câu 2: Lifestyle Habits
- **Field:** `lifestyle`
- **Lựa chọn:**
  - `neat`: Gọn gàng, ngăn nắp ✨
  - `flexible`: Thoải mái, như nào cũng được 🤷

#### Câu 3: Bedtime
- **Field:** `bedtime`
- **Lựa chọn:**
  - `9-10pm`: 9-10 giờ 🌙
  - `after-12am`: Sau 12 giờ 🌃
  - `after-1-2am`: Sau 1-2 giờ sáng 🌌
  - `varies-early`: Lúc này lúc kia nhưng thường là sớm ⏰
  - `varies-late`: Lúc này lúc kia nhưng thường là muộn ⏰

#### Câu 4: Wake Time
- **Field:** `wakeTime`
- **Lựa chọn:**
  - `early-6-7am`: Sớm (6-7 giờ) 🌅
  - `after-9am`: Sau 9 giờ ☀️
  - `noon`: Trưa 🕛
  - `varies-early`: Lúc này lúc kia nhưng thường là sớm ⏰
  - `varies-late`: Lúc này lúc kia nhưng thường là muộn ⏰

#### Câu 5: Light Sleeper
- **Field:** `lightSleeper`
- **Lựa chọn:**
  - `yes`: Có 😴
  - `no`: Không 😌
  - `depends`: Tuỳ lúc 🤔

#### Câu 6: Roommate Expectation
- **Field:** `roommateExpectation`
- **Lựa chọn:**
  - `respectPrivacy`: Tôn trọng không gian riêng 🤫
  - `friendly`: Hoà đồng, dễ trao đổi 😊

#### Câu 7: Dealbreakers
- **Field:** `dealbreakers`
- **Lựa chọn:**
  - `unhygienic`: Thiếu vệ sinh 🚫
  - `noisy`: Ồn ào 🔇
  - `unclearCosts`: Không rõ ràng chi phí 💸
  - `other`: Khác 📝

---

## 🔒 MATCHING ALGORITHM - HARD CONSTRAINT

### Logic bắt buộc:
```javascript
// Trong server.js - GET /api/matches

// Người CHƯA có phòng CHỈ match với người ĐÃ có phòng
if (myAnswers.roomStatus === 'noRoom') {
    return theirAnswers.roomStatus === 'hasRoom';
}

// Người ĐÃ có phòng CHỈ match với người CHƯA có phòng
else if (myAnswers.roomStatus === 'hasRoom') {
    return theirAnswers.roomStatus === 'noRoom';
}
```

### Ví dụ:
| Người dùng A | Người dùng B | Kết quả |
|--------------|--------------|---------|
| hasRoom | noRoom | ✅ Match |
| noRoom | hasRoom | ✅ Match |
| hasRoom | hasRoom | ❌ Không match |
| noRoom | noRoom | ❌ Không match |

---

## 📊 SO SÁNH TRƯỚC/SAU

### Trước (10 câu):
1. name (text input)
2. location (5 options)
3. budget (4 options)
4. roommates (3 options)
5. schedule (3 options)
6. cleanliness (3 options)
7. parties (3 options)
8. smoking (3 options)
9. roommateType (3 options)
10. sharing (3 options)

**Vấn đề:** 
- Không phân biệt người có phòng/chưa có phòng
- Matching không phù hợp với nhu cầu thực tế
- Người chưa có phòng có thể match với người chưa có phòng (vô nghĩa)

### Sau (7 câu):
1. **roomStatus** - HARD CONSTRAINT ⚠️
2. lifestyle
3. bedtime
4. wakeTime
5. lightSleeper
6. roommateExpectation
7. dealbreakers

**Cải tiến:**
- ✅ Câu hỏi đầu tiên phân loại rõ ràng
- ✅ Matching logic chính xác: noRoom ↔ hasRoom
- ✅ Tập trung vào tính cách và thói quen sống chung
- ✅ Loại bỏ câu hỏi không cần thiết (location, budget, roommates count)

---

## 🎯 LUỒNG DỮ LIỆU

### User Journey:
1. User chọn purpose "roommate" trên [purpose.html](purpose.html)
2. Chuyển đến [questionnaire-roommate.html](questionnaire-roommate.html)
3. **Câu 1:** User chọn hasRoom hoặc noRoom
4. Trả lời 6 câu còn lại về thói quen và mong muốn
5. Submit → Lưu vào `profiles.json` với field `roomStatus`
6. Chuyển đến [matches.html](matches.html)

### Matching Flow:
1. GET `/api/matches` với purpose = 'roommate'
2. **BƯỚC 1:** Lọc cùng purpose
3. **BƯỚC 2:** Loại trừ đã kết nối trước đó
4. **BƯỚC 3:** **HARD FILTER theo roomStatus:**
   - Nếu user = noRoom → chỉ giữ lại candidates = hasRoom
   - Nếu user = hasRoom → chỉ giữ lại candidates = noRoom
5. **BƯỚC 4:** Lọc theo targetGender (orientation)
6. **BƯỚC 5:** Tính điểm matching các câu hỏi còn lại (6 câu)
7. **BƯỚC 6:** Chỉ trả về match ≥ 70%

### Scoring Example:
**Scenario:** User A (hasRoom) vs User B (noRoom)

| Câu hỏi | User A | User B | Match? | Weight |
|---------|--------|--------|--------|--------|
| roomStatus | hasRoom | noRoom | PASS FILTER | - |
| lifestyle | neat | neat | ✅ Yes | 1 |
| bedtime | 9-10pm | 9-10pm | ✅ Yes | 1 |
| wakeTime | early-6-7am | early-6-7am | ✅ Yes | 1 |
| lightSleeper | yes | no | ❌ No | 1 |
| roommateExpectation | respectPrivacy | respectPrivacy | ✅ Yes | 1 |
| dealbreakers | unhygienic | unhygienic | ✅ Yes | 1 |

**Kết quả:** 5/6 = 83% → ✅ Match

**Nếu roomStatus không phù hợp:**
- User A (hasRoom) vs User C (hasRoom) → ❌ BỊ LOẠI NGAY (không đến bước tính điểm)

---

## 🚀 TRẠNG THÁI HIỆN TẠI

### ✅ Đã hoàn thành:
1. Cập nhật `questionnaire-roommate.html` với 7 câu hỏi mới
2. Đánh dấu câu hỏi roomStatus là câu quan trọng (màu đỏ)
3. Cập nhật server.js với hard constraint logic
4. Test logic: noRoom chỉ match với hasRoom

### 📝 Cần test:
1. Tạo 2 profiles: 1 hasRoom, 1 noRoom → xem có match không
2. Tạo 2 profiles: cả 2 hasRoom → xác nhận KHÔNG match
3. Tạo 2 profiles: cả 2 noRoom → xác nhận KHÔNG match
4. Kiểm tra scoring với các câu hỏi còn lại (6 câu)

### 🔮 Cân nhắc thêm:
- **Có nên weight câu nào không?**
  - bedtime/wakeTime: Quan trọng cho sự tương thích về sinh hoạt
  - dealbreakers: Có thể là deal-breaker thật sự
  - **Đề xuất:** Giữ nguyên weight = 1 cho tất cả (roomStatus đã là hard constraint rồi)

---

## 📌 GHI CHÚ KỸ THUẬT

### Field Names:
```javascript
{
  roomStatus: 'hasRoom' | 'noRoom',        // Hard constraint
  lifestyle: 'neat' | 'flexible',
  bedtime: '9-10pm' | 'after-12am' | 'after-1-2am' | 'varies-early' | 'varies-late',
  wakeTime: 'early-6-7am' | 'after-9am' | 'noon' | 'varies-early' | 'varies-late',
  lightSleeper: 'yes' | 'no' | 'depends',
  roommateExpectation: 'respectPrivacy' | 'friendly',
  dealbreakers: 'unhygienic' | 'noisy' | 'unclearCosts' | 'other'
}
```

### Server.js Location:
- **File:** `c:\test\server.js`
- **Section:** GET `/api/matches` endpoint
- **Lines:** ~370-390 (hard constraint logic)

---

## 🎓 ĐỒNG BỘ VỚI CÁC PURPOSE KHÁC

### Current Status:
| Purpose | Questions | Weighted Questions | Hard Constraints |
|---------|-----------|-------------------|------------------|
| love | 14 | 0 | gender only |
| friend | 4 | 0 | gender only |
| study | 9 | 1 (studyFormat x2) | gender only |
| research | 16 | 3 (myStatus, partnerStatus, workFormat x2) | gender only |
| **roommate** | **7** | **0** | **gender + roomStatus** |

### Key Difference:
- Roommate là purpose DUY NHẤT có **hard constraint ngoài gender**
- roomStatus không phải weighted (x2) mà là **absolute filter**
- Logic: hasRoom ⟺ noRoom (matching tuyệt đối, không có option "cả hai đều OK")

---

## ✅ KẾT LUẬN

**Cập nhật hoàn tất:**
- ✅ Questionnaire mới: 7 câu hỏi tập trung vào thói quen và tính cách
- ✅ Hard constraint: Người chưa có phòng BẮT BUỘC match với người đã có phòng
- ✅ Matching algorithm đã được cập nhật và đồng bộ
- ✅ Ready for testing

**Lưu ý khi test:**
- Tạo ít nhất 4 test cases: hasRoom-hasRoom, noRoom-noRoom, hasRoom-noRoom, noRoom-hasRoom
- Verify chỉ 2 cases cuối được match
- Kiểm tra scoring với 6 câu hỏi còn lại
