const Group = require("../models/Group");
const Message = require("../models/Message");

const getGroupMessages = async(req, res) => {
    try {
        const { groupCode } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({ groupCode });

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const isApprovedMember = group.members.some(
            (m) =>
            m.userId.toString() === userId.toString() &&
            m.status === "approved"
        );

        if (!isApprovedMember) {
            return res.status(403).json({
                message: "You are not approved member of this group"
            });
        }

        const messages = await Message.find({
                groupId: group._id,
                isDeleted: false
            })
            .populate("senderId", "fullName mobileNumber roleSelection")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Messages fetched successfully",
            messages
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message
        });
    }
};

module.exports = {
    getGroupMessages
};