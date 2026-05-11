const Group = require('../models/Group');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const Loan = require('../models/Loan');
const Contribution = require('../models/contribution');
const geocodeAddress = require("../utils/geocodeAddress");
const sendSMS = require("../utils/sendSMS");

const registerAdmin = async(req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            password,
            gender,
            loginType
        } = req.body;
        if (!fullName || !mobileNumber || !gender || !loginType) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        if (!["password", "otp"].includes(loginType)) {
            return res.status(400).json({
                message: "Invalid loginType"
            });
        }
        if (loginType === "password" && !password) {
            return res.status(400).json({
                message: "Password is required for password login type"
            });
        }
        const existingUser = await User.findOne({
            mobileNumber
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        let hashedPassword = null;
        if (loginType === "password") {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newUser = new User({
            fullName,
            userName: fullName,
            mobileNumber,
            password: hashedPassword,
            roleSelection: "admin",
            loginType,
            gender,
            groupIds: []
        });

        await newUser.save();

        const token = generateToken(newUser._id, newUser.roleSelection);

        res.status(201).json({
            message: "Admin registered successfully",
            token,
            loginType
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const getAdminDashboardOverview = async(req, res) => {
    try {
        const adminId = req.user._id;

        const groups = await Group.find({
            $or: [
                { adminId: adminId },
                { "members.userId": adminId }
            ]
        });

        let totalMembers = 0;
        let pendingMembers = 0;
        let approvedMembers = 0;

        groups.forEach((group) => {
            group.members.forEach((member) => {
                totalMembers++;

                if (member.status === "pending") {
                    pendingMembers++;
                }

                if (member.status === "approved") {
                    approvedMembers++;
                }
            });
        });

        res.status(200).json({
            message: "Admin dashboard overview fetched successfully",
            totalGroups: groups.length,
            totalMembers,
            pendingMembers,
            approvedMembers
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch admin dashboard overview",
            error: error.message
        });
    }
};
const updatePaymentDetails = async(req, res) => {
    try {
        const {
            upiId,
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
        } = req.body;

        const admin = await User.findByIdAndUpdate(
            req.user._id, {
                $set: {
                    upiId: upiId,

                    "bankAccountDetails.accountHolderName": accountHolderName,
                    "bankAccountDetails.accountNumber": accountNumber,
                    "bankAccountDetails.ifscCode": ifscCode,
                    "bankAccountDetails.bankName": bankName,
                },
            }, {
                new: true,
            }
        ).select("upiId bankAccountDetails");

        res.status(200).json({
            success: true,
            message: "Payment details updated successfully",
            paymentDetails: {
                upiId: admin.upiId,
                bankAccountDetails: admin.bankAccountDetails,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const createGroup = async(req, res) => {
    try {
        const {
            groupName,
            groupCode,
            groupDuration,
            startDate,
            description,
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
        const fullAddress =
            `${village}, ${taluka}, ${district}, ${state}, India`;

        const location = await geocodeAddress(fullAddress);

        const newGroup = new Group({
            groupName,
            groupCode,
            groupDuration,
            startDate,
            village,
            taluka,
            district,
            state,
            description,
            formationDate,

            location: {
                address: fullAddress,
                latitude: location.latitude,
                longitude: location.longitude
            },

            adminId: req.user._id,

            members: [{
                userId: req.user._id,
                roleInGroup: "admin",
                status: "approved"
            }]
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
const addMember = async(req, res) => {
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

        const firstTwoLetters =
            fullName.trim().substring(0, 2).toLowerCase();

        const dob = new Date(dateOfBirth);

        const day =
            String(dob.getDate()).padStart(2, "0");

        const month =
            String(dob.getMonth() + 1).padStart(2, "0");

        const lastFourDigits =
            mobileNumber.slice(-4);

        const passkey =
            `${firstTwoLetters}${day}${lastFourDigits}`;

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

        const existingMember = group.members.find(
            m => m.userId.toString() === user._id.toString()
        );

        if (existingMember) {
            return res.status(400).json({
                message: `User already exists in this group with status: ${existingMember.status}`
            });
        }

        group.members.push({
            userId: user._id,
            roleInGroup: "member",
            status: "pending"
        });

        await group.save();

        if (!user.groupIds.some(id => id.toString() === group._id.toString())) {
            user.groupIds.push(group._id);
            await user.save();
        }

        if (isNewUser) {
            const message = `Hello ${fullName}, you have been added to ${group.groupName}. Your username is your mobile number: ${mobileNumber}, and your password is : ${passkey}. Please login and accept or reject the group request.`;

            await sendSMS(mobileNumber, message);
        }

        return res.status(200).json({
            message: isNewUser ?
                "New member created and group request sent successfully" : "Existing member group request sent successfully",
            status: "pending"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
const getAdminGroups = async(req, res) => {
    try {
        const adminId = req.user._id;

        const groups = await Group.find({
            $or: [
                { adminId: adminId },
                { "members.userId": adminId }
            ]
        }).sort({ createdAt: -1 });

        const formattedGroups = groups.map((group) => {
            const approvedMembers = group.members.filter(
                (member) => member.status === "approved"
            );

            return {
                groupId: group._id,
                groupName: group.groupName,
                groupCode: group.groupCode,
                totalMembers: approvedMembers.length,
                totalSaving: group.totalSaving || 0,
                formationDate: group.formationDate,
                location: group.location
            };
        });

        res.status(200).json({
            message: "Admin groups fetched successfully",
            groups: formattedGroups
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch admin groups",
            error: error.message
        });
    }
};
const getGroupDetails = async(req, res) => {
    try {
        const { groupCode } = req.params;

        const group = await Group.findOne({ groupCode }).populate(
            "members.userId",
            "fullName mobileNumber gender role"
        );

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const approvedMembers = group.members.filter(
            (member) => member.status === "approved"
        );

        const pendingMembers = group.members.filter(
            (member) => member.status === "pending"
        );

        const rejectedMembers = group.members.filter(
            (member) => member.status === "rejected"
        );

        res.status(200).json({
            message: "Group details fetched successfully",

            group: {
                groupId: group._id,
                groupName: group.groupName,
                groupCode: group.groupCode,
                description: group.description,
                formationDate: group.formationDate,

                totalSaving: group.totalSaving || 0,
                totalLoanGiven: group.totalLoanGiven || 0,

                totalMembers: approvedMembers.length,
                pendingMembers: pendingMembers.length,
                rejectedMembers: rejectedMembers.length,
                village: group.village,
                taluka: group.taluka,
                district: group.district,
                state: group.state,

                location: {
                    address: group.location ? group.location.address : null,
                    latitude: group.location ? group.location.latitude : null,
                    longitude: group.location ? group.location.longitude : null
                },
                audioCall: true,
                videoCall: true
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch group details",
            error: error.message
        });
    }
};

const getGroupMembers = async(req, res) => {
    try {
        const { groupCode } = req.params;

        const group = await Group.findOne({ groupCode }).populate(
            "members.userId",
            "fullName mobileNumber gender role"
        );

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const approvedMembers = [];
        const pendingMembers = [];
        const rejectedMembers = [];

        group.members.forEach((member) => {
            const memberData = {
                userId: member.userId._id,
                fullName: member.userId.fullName,
                mobileNumber: member.userId.mobileNumber,
                gender: member.userId.gender,
                role: member.userId.role,
                roleInGroup: member.roleInGroup,
                status: member.status,
                note: member.note || "",
                joinedAt: member.joinedAt
            };

            if (member.status === "approved") {
                approvedMembers.push(memberData);
            }

            if (member.status === "pending") {
                pendingMembers.push(memberData);
            }

            if (member.status === "rejected") {
                rejectedMembers.push(memberData);
            }
        });

        res.status(200).json({
            message: "Group members fetched successfully",
            approvedMembers,
            pendingMembers,
            rejectedMembers
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch group members",
            error: error.message
        });
    }
};
const getAdminProfile = async(req, res) => {
    try {

        const adminId = req.user._id;

        const admin = await User.findById(adminId).select(
            "fullName mobileNumber roleSelection profilePicture upiId bankAccountDetails"
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const groups = await Group.find({
            adminId,
        });

        const groupIds = groups.map(
            (group) => group._id
        );

        let totalMembers = 0;

        groups.forEach((group) => {
            totalMembers +=
                group.members ? group.members.length || 0 : 0;
        });

        const contributions =
            await Contribution.find({
                groupId: {
                    $in: groupIds,
                },
                status: "paid",
            });

        let totalCollection = 0;

        contributions.forEach((contribution) => {
            totalCollection += contribution.amount;
        });

        res.status(200).json({
            success: true,

            adminProfile: {
                fullName: admin.fullName,

                mobileNumber: admin.mobileNumber,

                role: admin.roleSelection,

                profilePicture: admin.profilePicture,

                upiId: admin.upiId || null,

                bankAccount: admin.bankAccountDetails || null,

                overview: {
                    totalGroups: groups.length,

                    totalMembers,

                    totalCollection,
                },
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
const getGroupMemebers = async(req, res) => {

    try {

        const { groupCode } = req.params;

        const group = await Group.findOne({
            groupCode
        }).populate(
            "members.userId",
            "fullName"
        );

        if (!group) {

            return res.status(404).json({
                message: "Group not found"
            });

        }

        const members = group.members.map(
            (member) => ({

                memberId: member.userId ? member.userId._id : null,

                fullName: member.userId ? member.userId.fullName : null,

                status: member.status === "rejected" ?
                    "failed" : member.status || "pending",

            })
        );

        res.status(200).json({

            message: "Group members fetched successfully",

            members

        });

    } catch (error) {

        res.status(500).json({

            message: "Failed to fetch group members",

            error: error.message

        });

    }

};
const getAdminMemberProfile =
    async(req, res) => {

        try {

            const {
                groupId,
                memberId,
            } = req.params;

            const adminId =
                req.user._id;

            const group =
                await Group.findOne({
                    _id: groupId,
                    adminId,
                });

            if (!group) {

                return res.status(404).json({
                    success: false,
                    message: "Group not found or unauthorized",
                });

            }

            const memberExists =
                group.members.find(
                    (member) =>
                    member.userId.toString() ===
                    memberId
                );

            if (!memberExists) {

                return res.status(404).json({
                    success: false,
                    message: "Member not found in this group",
                });

            }

            const member =
                await User.findById(
                    memberId
                ).select(
                    "fullName mobileNumber address dateofBirth profilePicture"
                );

            if (!member) {

                return res.status(404).json({
                    success: false,
                    message: "Member not found",
                });

            }
            const joined_at = group.members.find(
                (member) =>
                member.userId.toString() ===
                memberId
            ).joinedAt;
            const contributions =
                await Contribution.find({
                    userId: memberId,
                    groupId,
                    status: "paid",
                });

            let totalContribution = 0;

            contributions.forEach(
                (contribution) => {
                    totalContribution +=
                        contribution.amount;
                }
            );
            const loanTaken = 5000;

            const loanPaid = 3000;

            const loanRemaining =
                loanTaken - loanPaid;

            res.status(200).json({
                success: true,

                memberProfile: {

                    memberId: member._id,
                    fullName: member.fullName,
                    mobileNumber: member.mobileNumber,
                    address: member.address ||
                        null,
                    dateOfBirth: member.dateofBirth ||
                        null,
                    profilePicture: member.profilePicture ||
                        null,
                    memberSince: member.createdAt,
                    contributionSummary: {
                        totalContribution,
                    },
                    loanSummary: {
                        loanTaken,
                        loanPaid,
                        loanRemaining,
                    },
                },
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
module.exports = {
    registerAdmin,
    addMember,
    getAdminDashboardOverview,
    getAdminGroups,
    getGroupDetails,
    getGroupMembers,
    createGroup,
    getAdminProfile,
    updatePaymentDetails,
    getGroupMemebers,
    getAdminMemberProfile
};