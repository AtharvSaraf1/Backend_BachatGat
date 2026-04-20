const Contribution = require('../models/contribution');
const Group = require('../models/Group');

exports.getAdminDashboard = async(req, res) => {

    const groups = await Group.find({ adminId: req.user._id });

    let totalMoney = 0;

    for (let g of groups) {
        const contributions = await Contribution.find({ groupId: g._id });

        totalMoney += contributions.reduce((sum, c) => sum + c.amount, 0);
    }

    res.json({
        totalGroups: groups.length,
        totalMoney
    });
};