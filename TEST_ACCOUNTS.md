# Hướng dẫn test với dữ liệu giả

## 👤 Tài khoản đã tạo sẵn

Tất cả tài khoản đều có mật khẩu: **123456**

### Tìm người yêu ❤️

1. **Nguyễn Văn A** (20020001)
   - Nam, 175cm, ngoại hình ưu nhìn
   - Hướng ngoại, thích hoạt động sôi nổi, du lịch
   - Ưu tiên: Vui vẻ, hài hước
   - 📱 0901234567 | 📘 facebook.com/nguyenvana | 📷 @vana_official

2. **Trần Thị B** (20020002) - **Match 93% với Nguyễn Văn A**
   - Nữ, 160cm, ngoại hình ưu nhìn
   - Hướng ngoại, thích hoạt động sôi nổi, du lịch
   - Ưu tiên: Vui vẻ, hài hước
   - 📱 0902345678 | 📘 facebook.com/tranthib | 📷 @thib_cute

3. **Lê Văn C** (20020003) - **Match thấp < 70%**
   - Nam, 170cm, ngoại hình bình thường
   - Hướng nội, thích yên tĩnh, ở nhà
   - Ưu tiên: Trí tuệ
   - 📱 0903456789

4. **Phạm Thị D** (20020004) - **Match 73% với Nguyễn Văn A**
   - Nữ, 162cm, ngoại hình ưu nhìn
   - Ambivert, cân bằng
   - Ưu tiên: Sự quan tâm
   - 📱 0904567890 | 📘 facebook.com/phamthid

### Tìm đồng nghiệp nghiên cứu 📚

5. **Hoàng Văn E** (20020005)
   - Công nghệ thông tin
   - Làm việc có kế hoạch, sáng sớm, lab
   - 📱 0905678901 | 📘 facebook.com/hoangvane | 📷 @vane_tech

6. **Nguyễn Thị F** (20020006) - **Match 83% với Hoàng Văn E**
   - Công nghệ thông tin
   - Làm việc có kế hoạch, chiều, thư viện
   - 📱 0906789012 | 📘 facebook.com/nguyenthif

### Tìm bạn 🤝

7. **Trần Văn G** (20020007)
   - Nam, hướng ngoại
   - Thích thể thao, hoạt động nhóm
   - 📱 0907890123 | 📘 facebook.com/tranvang | 📷 @vang_explorer

8. **Lê Thị H** (20020008) - **Match thấp < 70%**
   - Nữ, hướng nội
   - Thích đọc sách, hoạt động cá nhân
   - 📱 0908901234 | 📘 facebook.com/lethih

## 🧪 Cách test

### Test 1: Đăng nhập với tài khoản có nhiều match
```
Tài khoản: 20020001
Mật khẩu: 123456
```
- Vào mục "Tìm người yêu"
- Sẽ thấy 2 người match (Trần Thị B: 93%, Phạm Thị D: 73%)
- Xem được thông tin liên hệ đầy đủ

### Test 2: Đăng nhập với tài khoản ít match
```
Tài khoản: 20020003
Mật khẩu: 123456
```
- Vào mục "Tìm người yêu"
- Sẽ thấy ít hoặc không có ai vì tỷ lệ < 70%

### Test 3: Tạo tài khoản mới
- Đăng ký với mã sinh viên mới
- Chọn "Tìm người yêu"
- Trả lời giống Nguyễn Văn A để có match cao
- Sẽ thấy Nguyễn Văn A và Trần Thị B trong kết quả

## 💡 Tips

- Để có match cao (>= 90%), trả lời câu hỏi giống nhau
- Để test ngưỡng 70%, thay đổi một vài câu trả lời
- Mật khẩu mặc định cho tất cả: **123456**
- Thông tin liên hệ chỉ hiển thị khi match >= 70%
