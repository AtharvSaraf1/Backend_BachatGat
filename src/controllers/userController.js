const sendSMS = require('../utils/sendSMS');
const bcrypt = require('bcrypt');
const UserProfile = require('../models/UserProfile');
const Group = require('../models/Group');
const User = require('../models/User');
exports.addUser = async(req, res) => {
    try {
        if (req.user.roleSelection !== "admin") {
            return res.status(403).json({
                message: "Only Admin can add member"
            });
        }
        const {
            groupCode,
            fullName,
            mobileNumber,
            emailAddress,
            gender,
            dateofBirth,
            address,
            occupation,
            incomeRange,
            membershipId,
            profilePicture,
            alternateMobileNumber,
            emergencyContact,
            bankAccountDetails,
            prefferredLanguage,
        } = req.body;
        if (!groupCode) {
            return res.status(404).json({
                message: "groupCode is required"
            });
        }
        const group = await Group.findOne({ groupCode });
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        if (!req.user.groupIds.some(id => id.toString() === group._id.toString())) {
            return res.status(403).json({
                message: "Not allowed for this group"
            });
        }
        let user = await User.findOne({ mobileNumber });
        if (!user) {
            if (!fullName ||
                !mobileNumber ||
                !emailAddress ||
                !gender ||
                !dateofBirth ||
                !address ||
                !occupation ||
                !incomeRange ||
                !membershipId
            ) {
                return res.status(400).json({
                    message: "Please provide all required fields"
                });
            }
            const existingUser = await User.findOne({
                $or: [{ emailAddress }, { mobileNumber }]
            });
            if (existingUser) {
                return res.status(400).json({
                    message: "User with this email or mobile number already exists"
                });
            }
            const hashedPassword = await bcrypt.hash(dateofBirth, 10);
            user = new User({
                fullName,
                userName: fullName,
                mobileNumber,
                emailAddress,
                password: hashedPassword,
                roleSelection: "user",
                gender,
                dateofBirth,
                groupIds: [],
                profilePicture,
                alternateMobileNumber,
                emergencyContact,
                bankAccountDetails,
                prefferredLanguage,
            });
            await user.save();
            group.members.push(user._id);
            await group.save();
            user.groupIds.push(group._id);
            await user.save();
            const userProfile = new UserProfile({
                userId: user._id,
                address,
                occupation,
                incomeRange,
                membershipId: membershipId
            });
            await userProfile.save();
            user.userProfile = userProfile._id;
            await user.save();
            const message = `Hello ${fullName}, you have been added to ${group.groupName}. Your username is ${fullName} and password is ${dateofBirth}.`;
            await sendSMS(mobileNumber, message);
            return res.status(200).json({
                message: "New user created and added to group"
            });
        }
        if (group.members.some(id => id.toString() === user._id.toString())) {
            return res.status(400).json({
                message: "User already exists in this group"
            });
        }
        if (!group.members.some(id => id.toString() === user._id.toString())) {
            group.members.push(user._id);
            await group.save();
        }
        if (!user.groupIds.some(id => id.toString() === group._id.toString())) {
            user.groupIds.push(group._id);
            await user.save();
        }
        const message = `Hello ${user.fullName}, you have been added to ${group.groupName}.`;
        await sendSMS(user.mobileNumber, message);
        return res.status(200).json({
            message: "Existing user added to group successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};