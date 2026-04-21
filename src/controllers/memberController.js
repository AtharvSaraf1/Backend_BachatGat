const User = require('../models/User');
const Group = require('../models/Group');
const UserProfile = require('../models/UserProfile');
const Contribution = require('../models/contribution');
const Loan = require('../models/Loan');

exports.getMemberDashboard = async(req, res) => {
    const userId = req.user._id;

    const contributions = await Contribution.find({
        userId: req.user._id,
        groupId: group._id
    });

    const totalSavings = contributions.reduce((sum, c) => sum + c.amount, 0);

    const loans = await Loan.find({
        userId: req.user._id,
        status: "approved"
    });

    const totalLoan = loans.reduce((sum, l) => sum + l.amount, 0);

    res.json({
        totalSavings,
        totalLoan,
        netBalance: totalSavings - totalLoan
    });
};

exports.getMemberProfile = async(req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password");


    res.json(user);
};
exports.updateMemberProfile = async(req, res) => {
    const { fullName, address } = req.body;
    const user = await User.findById(req.user._id);
    if (fullName) user.fullName = fullName;
    await user.save();
    const profile = await UserProfile.findOne({ userId: user._id });
    if (profile && address) {
        profile.address = address;
        await profile.save();
    }
    res.json({ message: "Profile updated" });
};