const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },

    amount: Number,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date
});

module.exports = mongoose.model("Loan", loanSchema);