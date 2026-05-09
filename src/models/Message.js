const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    messageType: {
        type: String,
        enum: ["text", "image", "file", "audio"],
        default: "text"
    },

    message: {
        type: String,
        required: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports =
    mongoose.models.Message || mongoose.model("Message", messageSchema);