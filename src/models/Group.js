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
    description: {
        type: String
    },
    village: String,
    taluka: String,
    district: String,
    state: String,
    formationDate: Date,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        roleInGroup: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }
]

}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);