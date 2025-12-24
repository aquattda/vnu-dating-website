# HỆ THỐNG PREMIUM - VNU DATING

## 📋 TỔNG QUAN

Hệ thống Premium cho phép người dùng mua thêm lượt match khi đã hết lượt miễn phí trong ngày.

## 💎 CÁC GÓI PREMIUM

### 1. Gói 1 lượt
- **Giá:** 5,000đ
- **Lợi ích:** Thêm 1 lượt match trong ngày
- **Thời hạn:** Sử dụng trong ngày

### 2. Gói 3 lượt
- **Giá:** 12,000đ (Tiết kiệm 20%)
- **Lợi ích:** Thêm 3 lượt match trong ngày
- **Thời hạn:** Sử dụng trong ngày

### 3. Gói 5 lượt
- **Giá:** 20,000đ (Tiết kiệm 33%)
- **Lợi ích:** Thêm 5 lượt match trong ngày
- **Thời hạn:** Sử dụng trong ngày

### 4. Gói Premium Monthly 🔥
- **Giá:** 149,000đ/tháng
- **Lợi ích:** 
  - 3 lượt match mỗi ngày
  - Ưu tiên tốc độ matching
  - Hỗ trợ ưu tiên 24/7
- **Thời hạn:** 30 ngày
- **Đặc biệt:** Lượt match tự động reset mỗi ngày

## 🗂️ CẤU TRÚC DATABASE

### premiums.json
```json
[
  {
    "userId": "string",
    "packageId": "package_1|package_3|package_5|package_monthly",
    "remainingMatches": number,
    "createdAt": "ISO date",
    "expiresAt": "ISO date (for monthly)",
    "lastReset": "ISO date (for monthly)"
  }
]
```

### transactions.json
```json
[
  {
    "id": "ORDER_timestamp_randomstring",
    "userId": "string",
    "packageId": "string",
    "amount": number,
    "status": "pending|success|failed",
    "paymentMethod": "momo",
    "createdAt": "ISO date",
    "completedAt": "ISO date"
  }
]
```

## 🔌 API ENDPOINTS

### GET /api/premium/packages
Lấy danh sách các gói premium

**Response:**
```json
{
  "packages": [
    {
      "id": "package_1",
      "name": "Gói 1 lượt",
      "matches": 1,
      "price": 5000,
      "duration": null,
      "description": "Thêm 1 lượt match trong ngày"
    }
  ]
}
```

### GET /api/premium/status
Kiểm tra trạng thái premium của user (Requires auth)

**Response:**
```json
{
  "isPremium": true,
  "remainingMatches": 3,
  "package": "package_monthly",
  "expiresAt": "2025-01-24T...",
  "isMonthly": true
}
```

### POST /api/premium/create-payment
Tạo đơn hàng thanh toán (Requires auth)

**Request:**
```json
{
  "packageId": "package_1"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORDER_1234567890_abc123",
  "paymentUrl": "http://localhost:3000/momo-payment.html?orderId=...",
  "amount": 5000
}
```

### POST /api/premium/payment-callback
Callback từ MoMo sau khi thanh toán (Internal)

**Request:**
```json
{
  "orderId": "ORDER_...",
  "status": "success|failed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment successful"
}
```

### POST /api/premium/use-match
Sử dụng 1 lượt premium match (Requires auth)

**Response:**
```json
{
  "success": true,
  "remainingMatches": 2
}
```

## 🎨 UI/UX FLOW

### 1. Trang Premium (premium.html)
- Hiển thị 4 gói premium dạng card
- Hiển thị trạng thái premium hiện tại (nếu có)
- Button "Mua ngay" cho mỗi gói

### 2. Trang Thanh toán MoMo (momo-payment.html)
- Giao diện giả lập MoMo
- Form nhập số điện thoại và mã PIN
- Xử lý thanh toán (giả lập - không thật)
- Animation success khi thanh toán thành công

### 3. Profile Page
- Badge hiển thị Premium status
- Số lượt match còn lại
- Link đến trang Premium

## 💳 THANH TOÁN GIẢ LẬP (MOMO)

### Test Credentials:
- **Số điện thoại:** Bất kỳ (mặc định: 0901234567)
- **Mã PIN:** 123456

### Flow:
1. User chọn gói trên premium.html
2. Backend tạo transaction và trả về paymentUrl
3. Redirect đến momo-payment.html
4. User nhập thông tin và click "Thanh toán"
5. Giả lập processing 2 giây
6. Gọi callback API để confirm payment
7. Hiển thị animation success
8. Redirect về profile.html sau 3 giây

## 🔄 LOGIC XỬ LÝ

### Daily Reset (Premium Monthly)
```javascript
// Check trong GET /api/premium/status
if (packageId === 'package_monthly') {
  const lastReset = new Date(lastReset);
  const now = new Date();
  
  // Nếu khác ngày → reset về 3 lượt
  if (lastReset.getDate() !== now.getDate()) {
    remainingMatches = 3;
    lastReset = now;
  }
}
```

### Expiration Check
```javascript
if (expiresAt && new Date(expiresAt) < new Date()) {
  return { isPremium: false, expired: true };
}
```

### Add Matches Logic
```javascript
// Mua gói một lần → cộng trực tiếp
if (!pkg.duration) {
  userPremium.remainingMatches += pkg.matches;
}

// Mua gói monthly → set expiration + reset system
if (pkg.duration) {
  expiresAt.setDate(expiresAt.getDate() + 30);
  remainingMatches = 3;
  lastReset = now;
}
```

## 📊 INTEGRATION VỚI MATCHING

### Kiểm tra premium khi match:
```javascript
// Trong matches.html/js
const premiumStatus = await fetch('/api/premium/status');

if (premiumStatus.isPremium && premiumStatus.remainingMatches > 0) {
  // Cho phép xem thêm matches
  // Khi user connect → gọi /api/premium/use-match
}
```

## ✅ TESTING

### Test Cases:
1. **Mua gói 1 lượt:**
   - Mua gói → Check remainingMatches = 1
   - Sử dụng 1 lượt → remainingMatches = 0
   
2. **Mua gói monthly:**
   - Mua gói → Check remainingMatches = 3, expiresAt = +30 days
   - Dùng hết 3 lượt trong ngày
   - Ngày hôm sau → Check remainingMatches = 3 (auto reset)
   
3. **Expiration:**
   - Set expiresAt = yesterday
   - Check status → isPremium = false, expired = true

4. **Multiple purchases:**
   - Mua gói 3 lượt → remainingMatches = 3
   - Mua thêm gói 5 lượt → remainingMatches = 8

## 🚀 FILES CREATED

### Backend:
- `database/premiums.json` - Premium user records
- `database/transactions.json` - Payment transactions
- `server.js` - Premium APIs added

### Frontend:
- `public/premium.html` - Premium packages page
- `public/momo-payment.html` - Fake MoMo payment gateway
- `public/profile.html` - Updated with premium status
- `public/js/profile.js` - Added premium status loading

## 🔮 FUTURE ENHANCEMENTS

1. **Real Payment Integration:**
   - Integrate MoMo API
   - Add VNPay, ZaloPay
   
2. **Premium Features:**
   - See who liked you
   - Unlimited rewind
   - Advanced filters
   - Read receipts
   
3. **Analytics:**
   - Track conversion rate
   - Most popular package
   - Revenue dashboard

## 📝 NOTES

- Tất cả thanh toán hiện tại là GIẢ LẬP
- Không có tích hợp payment gateway thật
- Dùng cho DEMO/TESTING only
- Cần implement real payment khi deploy production
