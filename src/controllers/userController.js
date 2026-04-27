const sendSMS = require('../utils/sendSMS');
const bcrypt = require('bcrypt');
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
            dateOfBirth,
            address
        } = req.body;

        if (!groupCode || !fullName || !mobileNumber || !dateOfBirth || !address) {
            return res.status(400).json({
                message: "groupCode, fullName, mobileNumber, dateOfBirth and address are required"
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
                message: "You are not allowed to add members in this group"
            });
        }
        const passkey = Math.floor(100000 + Math.random() * 900000).toString();
        let user = await User.findOne({ mobileNumber });
        let isNewUser = false;

        if (!user) {
            const hashedPassword = await bcrypt.hash(passkey, 10);

            user = new User({
                fullName,
                userName: fullName,
                mobileNumber,
                password: hashedPassword,
                roleSelection: "user",
                dateOfBirth,
                address,
                groupIds: []
            });

            await user.save();
            isNewUser = true;
        }

        if (group.members.some(m => m.userId.toString() === user._id.toString())) {
            return res.status(400).json({
                message: "User already exists in this group"
            });
        }

        group.members.push({
            userId: user._id,
            roleInGroup: "member"
        });
        await group.save();

        if (group.members.some(m => m.userId.toString() === user._id.toString())) {
            user.groupIds.push(group._id);
            await user.save();
        }

        if (isNewUser) {
            const message = `Hello ${fullName}, you have been added to ${group.groupName}. Your username is your mobile number: ${mobileNumber}, and your password is : ${passkey}.`;

            await sendSMS(mobileNumber, message);
        }

        return res.status(200).json({
            message: isNewUser ?
                "New member created and added successfully" : "Existing member added successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};