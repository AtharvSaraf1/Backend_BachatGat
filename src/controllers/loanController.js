const Loan = require('../models/Loan');
const Contribution = require('../models/Contribution');
const Group = require('../models/Group');

exports.requestLoan = async(req, res) => {
    const { groupCode, amount } = req.body;

    const group = await Group.findOne({ groupCode });

    const contributions = await Contribution.find({
        userId: req.user._id,
        groupId: group._id
    });

    const totalSaved = contributions.reduce((s, c) => s + c.amount, 0);

    if (amount > totalSaved) {
        return res.status(400).json({
            message: "Loan exceeds your savings"
        });
    }

    const loan = await Loan.create({
        userId: req.user._id,
        groupId: group._id,
        amount
    });

    res.json({ message: "Loan requested", loan });
};