const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    emailAddress: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roleSelection: { type: String, enum: ['admin', 'user'], required: true },
    gender: { type: String },
    dateofBirth: { type: Date, required: true },
    profilePicture: { type: String },
    alternateMobileNumber: { type: String },
    emergencyContact: { type: String },
    bankAccountDetails: { type: String },
    prefferredLanguage: { type: String },
    groupIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }]
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);