const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["paid", "pending"],
        default: "paid"
    },
    paidAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Contribution", contributionSchema);