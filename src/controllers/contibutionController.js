const Contribution = require('../models/contribution');
const Group = require('../models/Group');

exports.payContribution = async(req, res) => {
    try {
        const { groupCode, month } = req.body;

        const group = await Group.findOne({ groupCode });

        const exists = await Contribution.findOne({
            userId: req.user._id,
            groupId: group._id,
            month
        });

        if (exists) {
            return res.status(400).json({ message: "Already paid" });
        }

        await Contribution.create({
            userId: req.user._id,
            groupId: group._id,
            amount: group.monthlyContribution,
            month
        });

        res.json({ message: "Payment done" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};