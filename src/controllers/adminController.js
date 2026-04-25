const Group = require('../models/Group');
const Loan = require('../models/Loan');
const Contribution = require('../models/contribution');

exports.getAdminDashboard = async(req, res) => {
    try {
        const groups = await Group.find({ adminId: req.user._id });

        let totalMembers = 0;
        let totalMoney = 0;
        let totalLoan = 0;

        const groupData = [];

        for (const group of groups) {
            const memberCount = group.members.length;
            totalMembers += memberCount;
            const contributions = await Contribution.find({
                groupId: group._id
            });

            const groupMoney = contributions.reduce(
                (sum, c) => sum + c.amount,
                0
            );

            totalMoney += groupMoney;
            const loans = await Loan.find({
                groupId: group._id,
                status: "approved"
            });

            const groupLoan = loans.reduce(
                (sum, l) => sum + l.amount,
                0
            );

            totalLoan += groupLoan;

            groupData.push({
                groupId: group._id,
                groupName: group.groupName,
                groupCode: group.groupCode,
                memberCount,
                totalMoney: groupMoney,
                totalLoan: groupLoan
            });
        }

        res.status(200).json({
            totalGroups: groups.length,
            totalMembers,
            totalMoney,
            totalLoan,
            groups: groupData
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};