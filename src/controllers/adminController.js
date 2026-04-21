const Contribution = require('../models/contribution');
const Group = require('../models/Group');
const Loan = require('../models/Loan');

exports.getAdminDashboard = async(req, res) => {
    try {
        const groups = await Group.find({ adminId: req.user._id });

        let totalMoney = 0;

        for (const g of groups) {
            const contributions = await Contribution.find({ groupId: g._id });
            totalMoney += contributions.reduce((sum, c) => sum + c.amount, 0);
        }

        const loans = await Loan.find({
            groupId: { $in: groups.map(g => g._id) },
            status: "approved"
        });

        const totalLoan = loans.reduce((sum, l) => sum + l.amount, 0);

        res.json({
            totalGroups: groups.length,
            totalMoney,
            totalLoan
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin dashboard data" });
    }
};