const mongoose = require('mongoose');
const User = require('./User');
const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    occupation: {
        type: String,
        required: true
    },
    incomeRange: {
        type: String,
        required: true
    },
    membershipId: {
        type: String,
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);