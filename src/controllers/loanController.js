const Loan = require('../models/Loan');
const Contribution = require('../models/contribution');
const Group = require('../models/Group');

exports.requestLoan = async(req, res) => {
    const { groupCode, amount } = req.body;
    if (!groupCode || !amount) {
        return res.status(400).json({
            message: "groupCode and amount are required"
        });
    }
    const group = await Group.findOne({ groupCode });

    if (!group) {
        return res.status(404).json({
            message: "Group not found"
        });
    }
    const contributions = await Contribution.find({
        userId: req.user._id,
        groupId: group._id
    });

    const totalSaved = contributions.reduce((s, c) => s + c.amount, 0);


    const loan = await Loan.create({
        userId: req.user._id,
        groupId: group._id,
        amount,
        reason,
        status: "pending"
    });

    res.json({ message: "Loan requested", loan });
};