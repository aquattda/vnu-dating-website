// Script: Reset all user passwords to 'password123'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User, connectDB } = require('./db');

async function resetPasswords() {
    await connectDB();
    const hash = await bcrypt.hash('password123', 10);
    const result = await User.updateMany({}, { $set: { password: hash } });
    console.log(`✅ Đã reset mật khẩu cho ${result.modifiedCount} tài khoản về 'password123'`);
    await mongoose.connection.close();
}

resetPasswords();
