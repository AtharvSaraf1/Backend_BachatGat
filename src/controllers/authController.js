const bcrypt = require('bcrypt');
const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const UserProfile = require('../models/UserProfile');
const OTP = require('../models/otpModel');
const sendSMS = require('../utils/sendSMS');
const generateToken = require("../utils/generateToken");
const Group = require('../models/Group');

exports.registerAdmin = async(req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            emailAddress,
            password,
            gender,
            dateofBirth,
            designation,
            officeAddress
        } = req.body;
        if (!fullName || !mobileNumber || !emailAddress || !password) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ emailAddress }, { mobileNumber }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            userName: fullName,
            mobileNumber,
            emailAddress,
            password: hashedPassword,
            roleSelection: "admin",
            gender,
            dateofBirth,
            groupIds: []
        });

        await newUser.save();

        const newAdminProfile = new AdminProfile({
            user: newUser._id,
            designation,
            officeAddress
        });

        await newAdminProfile.save();

        res.status(201).json({
            message: "Admin registered successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
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
            return res.status(400).json({
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

exports.passwordlogin = async(req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const token = generateToken(user._id);
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.sendOTP = async(req, res) => {
    try {
        const { mobileNumber } = req.body;
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otpRecord = await OTP.findOne({ mobileNumber });
        if (otpRecord) {
            if (otpRecord.resendCount >= 3) {
                return res.status(429).json({
                    message: "Maximum OTP resend attempts reached. Please try again later."
                })
            }
            const timeDiff = (new Date() - otpRecord.lastSentAt) / 1000;
            if (timeDiff < 30) {
                return res.status(429).json({
                    message: `Please wait ${Math.ceil(30 - timeDiff)} seconds before requesting a new OTP.`
                });
            }
            otpRecord.resendCount += 1;
            await otpRecord.save(); // FIX
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndUpdate({ mobileNumber }, {
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            lastSentAt: new Date(),
            $setOnInsert: { resendCount: 0 }
        }, { upsert: true });

        const message = `Your OTP for BachatGatApp is ${otp}. It is valid for 5 minutes.`;

        await sendSMS(mobileNumber, message);

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.verifyOTP = async(req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        const otpRecord = await OTP.findOne({ mobileNumber, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        const user = await User.findOne({ mobileNumber });

        const token = generateToken(user._id);

        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ message: "OTP verified successfully", token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createGroup = async(req, res) => {
    try {
        const {
            groupName,
            groupCode,
            village,
            taluka,
            district,
            state,
            formationDate
        } = req.body;
        if (!groupName || !groupCode) {
            return res.status(400).json({
                message: "groupName and groupCode are required"
            });
        }
        const existingName = await Group.findOne({ groupName });
        if (existingName) {
            return res.status(400).json({
                message: "Group name already exists"
            });
        }
        const existingCode = await Group.findOne({ groupCode });
        if (existingCode) {
            return res.status(400).json({
                message: "Group code already exists"
            });
        }
        const newGroup = new Group({
            groupName,
            groupCode,
            village,
            taluka,
            district,
            state,
            formationDate,
            adminId: req.user._id,
            members: [req.user._id]
        });
        await newGroup.save();
        if (!req.user.groupIds.includes(newGroup._id)) {
            req.user.groupIds.push(newGroup._id);
            await req.user.save();
        }
        res.status(201).json({
            message: "Group created successfully",
            groupId: newGroup._id,
            groupName: newGroup.groupName,
            groupCode: newGroup.groupCode
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getGroups = async(req, res) => {
    try {
        const groups = await Group.find({
            _id: { $in: req.user.groupIds }
        }).select("_id groupName");

        res.status(200).json(groups);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};