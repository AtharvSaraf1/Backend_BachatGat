const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    emailAddress: { type: String },
    address: {
        type: String
    },
    loginType: {
        type: String,
        enum: ["password", "otp"],
        default: "otp"
    },
    password: {
        type: String
    },
    roleSelection: { type: String, enum: ['admin', 'user'], required: true },
    gender: { type: String },
    dateOfBirth: { type: Date, required: true },
    prefferredLanguage: { type: String },
    groupIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }]
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);