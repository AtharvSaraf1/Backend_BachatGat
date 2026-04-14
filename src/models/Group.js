const mongoose = require('mongoose');
const { off } = require('node:cluster');
const { type } = require('node:os');
const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true,
    },
    groupCode: {
        type: String,
        required: true,
        unique: true
    },
    monthlyContribution: {
        type: Number
    },
    groupDuration: {
        type: Number
    },
    startDate: {
        type: Date
    },
    description: {
        type: String
    },
    village: String,
    taluka: String,
    district: String,
    state: String,
    formationDate: Date,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);