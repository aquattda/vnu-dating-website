# VNU Dating Website

Website hẹn hò và kết nối dành cho sinh viên Đại học Quốc gia Hà Nội.

## 🌟 Tính năng

- **Đăng ký/Đăng nhập**: Xác thực bằng MSSV
- **Trắc nghiệm hướng nghiệp**: Khám phá sở thích nghề nghiệp
- **5 mục đích kết nối**:
  - Tình yêu (Love)
  - Bạn bè (Friend)
  - Học tập (Study)
  - Nghiên cứu (Research)
  - Ở ghép (Roommate)
- **Thuật toán matching**: Tìm người phù hợp với độ tương thích cao
- **Premium**: Gói lượt match (MoMo payment)
- **Quảng cáo**: Popup và banner 2 bên

## 🛠️ Công nghệ

- **Backend**: Express.js + MongoDB + Mongoose
- **Frontend**: HTML/CSS/JavaScript
- **Database**: MongoDB Atlas (production) / JSON files (development)
- **Authentication**: JWT
- **Deployment**: Render.com (backend) + MongoDB Atlas (database)

## 📦 Cài đặt (Development)

```bash
# Clone repository
git clone <your-repo-url>
cd vnu-dating-website

# Cài đặt dependencies
npm install

# Tạo file .env
powershell -ExecutionPolicy Bypass -File setup-env.ps1

# Chạy server (JSON mode - development)
npm run old-server

# Hoặc chạy server MongoDB (production mode)
npm start
```

Mở trình duyệt: http://localhost:3000

## 🚀 Deployment

Xem hướng dẫn chi tiết trong [DEPLOYMENT.md](DEPLOYMENT.md)

### Các bước chính:

1. **Tạo MongoDB Atlas**:
   - Đăng ký tại https://www.mongodb.com/cloud/atlas
   - Tạo free cluster (M0)
   - Lấy connection string

2. **Cấu hình .env**:
   ```env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   ```

3. **Migrate data**:
   ```bash
   npm run migrate
   ```

4. **Deploy to Render.com**:
   - Push code lên GitHub
   - Connect GitHub repo với Render
   - Add environment variables
   - Deploy!

## 📂 Cấu trúc thư mục

```
vnu-dating-website/
├── public/              # Frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── images/         # Images + advertisements
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   ├── register.html   # Registration
│   ├── purpose.html    # Purpose selection
│   └── ...             # Other pages
├── database/           # JSON files (development)
├── db.js              # MongoDB schemas & connection
├── server.js          # Original JSON-based server
├── server-mongodb.js  # MongoDB-based server (production)
├── migrate-to-mongodb.js  # Migration script
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── DEPLOYMENT.md      # Deployment guide
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | JWT secret key | Random 32+ chars |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://...` |

## 📊 Database Schema

### Collections:
- **users**: User accounts (MSSV, password, profile)
- **profiles**: Questionnaire answers by purpose
- **orientations**: Career orientation test results
- **connections**: User matches and connections
- **premiums**: Premium package purchases
- **transactions**: Payment history

## 🎨 Premium Packages

| Package | Matches | Price | Type |
|---------|---------|-------|------|
| 1 Lượt Match | 1 | 15,000₫ | One-time |
| 3 Lượt Match | 3 | 39,000₫ | One-time |
| 5 Lượt Match | 5 | 59,000₫ | One-time |
| Monthly Premium | 30 | 99,000₫ | Monthly |

## 🧪 Testing

Test accounts có sẵn trong `database/users.json`:
- **MSSV**: 20020001 - 20020040
- **Password**: password123 (cho tất cả)

## 📝 Scripts

```bash
npm start          # Chạy MongoDB server (production)
npm run dev        # Development với nodemon
npm run migrate    # Migrate JSON → MongoDB
npm run old-server # Chạy JSON-based server (development)
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Kiểm tra MONGODB_URI trong .env
- Verify IP whitelist (0.0.0.0/0) trong MongoDB Atlas
- Check username/password

### Server không start
- Kiểm tra PORT đã được sử dụng chưa
- Verify .env file tồn tại
- Check dependencies: `npm install`

### Render deployment failed
- Check build logs trong Render dashboard
- Verify environment variables
- Test locally: `npm start`

## 💰 Chi phí

- **Development**: Miễn phí (local)
- **Production**: 
  - Render.com Free tier: $0/tháng (có sleep after 15 phút)
  - MongoDB Atlas M0: $0/tháng (512MB)
  - **Tổng: $0/tháng**

## 📄 License

MIT License

## 👥 Contributors

- Development: AI Assistant
- Design: VNU Dating Team

## 📞 Support

Nếu gặp vấn đề:
1. Đọc [DEPLOYMENT.md](DEPLOYMENT.md)
2. Check server logs
3. Verify .env configuration

---

**Version**: 1.0.0  
**Last Updated**: December 2024
