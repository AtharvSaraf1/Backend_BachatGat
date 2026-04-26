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
    if (!group.members.some(m => m.userId.toString() === req.user._id.toString())) {
        return res.status(403).json({
            message: "You are not part of this group"
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
exports.getLoanRequests = async(req, res) => {
    try {
        if (req.user.roleSelection !== "admin") {
            return res.status(403).json({
                message: "Only admin can view loan requests"
            });
        }

        const loans = await Loan.find({ status: "pending" })
            .populate("userId", "fullName mobileNumber")
            .populate("groupId", "groupName groupCode");

        res.status(200).json(loans);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.updateLoanStatus = async(req, res) => {
    try {
        if (req.user.roleSelection !== "admin") {
            return res.status(403).json({
                message: "Only admin can update loan status"
            });
        }

        const { loanId, status } = req.body;

        if (!loanId || !status) {
            return res.status(400).json({
                message: "loanId and status are required"
            });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const loan = await Loan.findById(loanId).populate("groupId");

        if (!loan) {
            return res.status(404).json({
                message: "Loan not found"
            });
        }

        // admin can only manage loans of own groups
        if (!req.user.groupIds.some(id => id.toString() === loan.groupId._id.toString())) {
            return res.status(403).json({
                message: "Not allowed to manage this loan"
            });
        }

        loan.status = status;

        if (status === "approved") {
            loan.remainingAmount = loan.amount;
            loan.approvedAt = new Date();
        } else {
            loan.remainingAmount = 0;
            loan.approvedAt = undefined;
        }

        await loan.save();

        res.status(200).json({
            message: `Loan ${status} successfully`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};