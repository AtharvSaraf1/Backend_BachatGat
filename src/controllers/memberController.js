const Group = require("../models/Group");

const getMemberGroupRequests = async(req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({
            members: {
                $elemMatch: {
                    userId: userId,
                    roleInGroup: "member",
                    status: "pending"
                }
            }
        });

        const requests = groups.map((group) => {
            const memberData = group.members.find(
                (member) => member.userId.toString() === userId.toString()
            );

            return {
                groupId: group._id,
                groupName: group.groupName,
                groupCode: group.groupCode,
                formationDate: group.formationDate,
                note: memberData.note || "",
                status: memberData.status
            };
        });

        res.status(200).json({
            message: "Pending group requests fetched successfully",
            requests
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch group requests",
            error: error.message
        });
    }
};

const acceptGroupRequest = async(req, res) => {
    try {
        const { groupCode } = req.body;
        const userId = req.user._id;

        if (!groupCode) {
            return res.status(400).json({
                message: "Group code is required"
            });
        }

        const group = await Group.findOne({ groupCode });

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const member = group.members.find(
            (member) => member.userId.toString() === userId.toString()
        );

        if (!member) {
            return res.status(404).json({
                message: "No request found for this group"
            });
        }

        if (member.status !== "pending") {
            return res.status(400).json({
                message: `Request is already ${member.status}`
            });
        }

        member.status = "approved";
        member.joinedAt = new Date();

        await group.save();

        res.status(200).json({
            message: "Group request accepted successfully",
            groupCode,
            status: "approved"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to accept group request",
            error: error.message
        });
    }
};

const rejectGroupRequest = async(req, res) => {
    try {
        const { groupCode } = req.body;
        const userId = req.user._id;

        if (!groupCode) {
            return res.status(400).json({
                message: "Group code is required"
            });
        }

        const group = await Group.findOne({ groupCode });

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const member = group.members.find(
            (member) => member.userId.toString() === userId.toString()
        );

        if (!member) {
            return res.status(404).json({
                message: "No request found for this group"
            });
        }

        if (member.status !== "pending") {
            return res.status(400).json({
                message: `Request is already ${member.status}`
            });
        }

        member.status = "rejected";

        await group.save();

        res.status(200).json({
            message: "Group request rejected successfully",
            groupCode,
            status: "rejected"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reject group request",
            error: error.message
        });
    }
};

const getMemberGroups = async(req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({
            members: {
                $elemMatch: {
                    userId: userId,
                    status: "approved"
                }
            }
        });

        const formattedGroups = groups.map((group) => ({
            groupId: group._id,
            groupName: group.groupName,
            groupCode: group.groupCode,
            totalMembers: group.members.filter(
                (member) => member.status === "approved"
            ).length,
            totalSaving: group.totalSaving || 0,
            formationDate: group.formationDate
        }));

        res.status(200).json({
            message: "Member groups fetched successfully",
            groups: formattedGroups
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch member groups",
            error: error.message
        });
    }
};

const getMemberGroupDetails = async(req, res) => {
    try {
        const { groupCode } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({ groupCode }).populate(
            "members.userId",
            "fullName mobileNumber gender role"
        );

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const member = group.members.find(
            (member) => member.userId._id.toString() === userId.toString()
        );

        if (!member || member.status !== "approved") {
            return res.status(403).json({
                message: "You are not approved member of this group"
            });
        }

        res.status(200).json({
            message: "Member group details fetched successfully",
            group: {
                groupId: group._id,
                groupName: group.groupName,
                groupCode: group.groupCode,
                description: group.description,
                formationDate: group.formationDate,
                totalSaving: group.totalSaving || 0,
                totalLoanGiven: group.totalLoanGiven || 0,
                totalMembers: group.members.filter(
                    (member) => member.status === "approved"
                ).length
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch member group details",
            error: error.message
        });
    }
};

module.exports = {
    getMemberGroupRequests,
    acceptGroupRequest,
    rejectGroupRequest,
    getMemberGroups,
    getMemberGroupDetails
};