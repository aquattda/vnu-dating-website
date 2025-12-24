const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vnu-dating');
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    faculty: { type: String, required: true },
    year: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

// Profile Schema
const profileSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    purpose: { type: String, required: true, index: true },
    answers: { type: Object, required: true },
    completedAt: { type: Date, default: Date.now }
});

// Compound unique index: userId + purpose (one profile per purpose per user)
profileSchema.index({ userId: 1, purpose: 1 }, { unique: true });

// Orientation Schema
const orientationSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    answers: { type: Object, required: true },
    completedAt: { type: Date, default: Date.now }
});

// Connection Schema
const connectionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    matchedUserId: { type: String, required: true, index: true },
    purpose: { type: String, required: true, index: true },
    compatibility: { type: Number, required: true },
    matchDetails: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

// Premium Schema
const premiumSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    packageName: { type: String, required: true },
    matches: { type: Number, required: true },
    remainingMatches: { type: Number, required: true },
    price: { type: Number, required: true },
    expiresAt: { type: Date },
    purchasedAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    packageName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['success', 'pending', 'failed'] },
    createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Orientation = mongoose.model('Orientation', orientationSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const Premium = mongoose.model('Premium', premiumSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    connectDB,
    User,
    Profile,
    Orientation,
    Connection,
    Premium,
    Transaction
};
