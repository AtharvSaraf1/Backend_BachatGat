const Contribution = require('../models/contribution');
const Group = require('../models/Group');

exports.makeContribution = async(req, res) => {
    try {
        const { groupId, amount, month } = req.body;
        if (!groupId || !amount || !month) {
            return res.status(400).json({
                message: "groupId, amount and month are required"
            });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({
                message: "You are not a member of this group"
            });
        }
        const existingContribution = await Contribution.findOne({ userId: req.user._id, groupId, month });
        if (existingContribution) {
            return res.status(400).json({
                message: "Contribution for this month already exists"
            });
        }
        await Contribution.create({
            userId: req.user._id,
            groupId,
            amount: group.monthlyContribution,
            month,
            status: "paid"
        });
        res.status(201).json({
            message: "Contribution made successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getGroupContributions = async(req, res) => {
    try {
        const transactions = await Contribution.find({
            userId: req.user._id
        }).sort({ paidAt: -1 });

        res.status(200).json(transactions);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};