const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    resendCount: {
        type: Number,
        default: 0
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
module.exports = mongoose.model('OTP', otpSchema);