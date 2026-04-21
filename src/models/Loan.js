const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    remainingAmount: {
        type: Number,
        default: 0
    },
    amount: Number,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reason: {
        type: String
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: {
        type: Date
    },
    remainingAmount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Loan", loanSchema);