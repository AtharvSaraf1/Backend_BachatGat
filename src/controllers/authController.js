const bcrypt = require('bcrypt');
const User = require('../models/User');
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
            dateOfBirth,
            loginType,
            address
        } = req.body;
        if (!fullName || !mobileNumber || !gender || !dateOfBirth || !loginType || !address) {
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
            emailAddress,
            password: hashedPassword,
            roleSelection: "admin",
            loginType,
            gender,
            dateOfBirth,
            address,
            groupIds: []
        });

        await newUser.save();

        const token = generateToken(newUser._id);

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

exports.passwordlogin = async(req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        if (!mobileNumber || !password) {
            return res.status(400).json({
                message: "Mobile number and password are required"
            });
        }

        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                message: "Password not set for this user"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Login successful",
            token,
            roleSelection: user.roleSelection
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
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