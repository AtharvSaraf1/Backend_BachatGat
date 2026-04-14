const bcrypt = require('bcrypt');
const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const OTP = require('../models/otpModel');
const sendSMS = require('../utils/sendSMS');
const generateToken = require("../utils/generateToken");


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

exports.passwordlogin = async(req, res) => {
    try {
        const { mobileNumber, password } = req.body;
        if (!mobileNumber || !password) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }
        const user = await User.findOne({ mobileNumber });
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