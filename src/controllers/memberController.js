const User = require('../models/User');
const Group = require('../models/Group');
const UserProfile = require('../models/UserProfile');

exports.getMemberDashboard = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const group = await Group.findById(user.groupIds[0]);
        const memberCount = group.members.length;
        const monthlyContribution = group.monthlyContribution || 0;
        const totalSavings = monthlyContribution * group.groupDuration;
        res.json({
            fullName: user.fullName,
            totalSavings,
            group: {
                groupName: group.groupName,
                monthlyContribution,
                groupTotalCollection: memberCount * monthlyContribution
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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