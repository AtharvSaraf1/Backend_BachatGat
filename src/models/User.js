const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
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
    dateOfBirth: { type: Date },
    prefferredLanguage: { type: String },
    upiId: {
        type: String,
        default: null
    },

    bankAccountDetails: {
        accountHolderName: {
            type: String,
            default: null
        },

        accountNumber: {
            type: String,
            default: null
        },

        ifscCode: {
            type: String,
            default: null
        },

        bankName: {
            type: String,
            default: null
        }
    },
    groupIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }]
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);