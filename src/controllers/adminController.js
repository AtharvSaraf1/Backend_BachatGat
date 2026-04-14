const Group = require('../models/Group');
exports.getAdminDashboard = async(req, res) => {
    try {
        const adminId = req.user._id;
        const groups = await Group.find({ adminId });
        const totalGroups = groups.length;
        let totalMembers = 0;
        let monthlyCollection = 0;
        const groupData = groups.map(group => {
            const memberCount = group.members.length;
            totalMembers += memberCount;
            const monthly = group.monthlyContribution || 0;
            monthlyCollection += memberCount * monthly;
            return {
                groupId: group._id,
                groupName: group.groupName,
                memberCount,
                monthlyContribution: monthly
            };
        });
        res.status(200).json({
            totalGroups,
            totalMembers,
            monthlyCollection,
            groups: groupData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};