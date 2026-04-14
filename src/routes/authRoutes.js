const express = require('express');
const router = express.Router();
const { registerAdmin, passwordlogin, sendOTP, verifyOTP } = require('../controllers/authController');
const { addUser } = require('../controllers/userController');
const { createGroup, getGroups } = require('../controllers/groupController');
const
    authMiddleware = require('../middlewares/authMiddleware');
const {
    isAdmin
} = require('../middlewares/adminMiddleware');
const { getAdminDashboard } = require('../controllers/adminController');
const { getMemberDashboard, getMemberProfile, updateMemberProfile } = require("../controllers/memberController");

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/add-user', authMiddleware, isAdmin, addUser);
router.post('/password-login', passwordlogin);
router.post('/registerAdmin', registerAdmin);
router.post('/create-group', authMiddleware, isAdmin, createGroup);
router.get('/get-groups', authMiddleware, getGroups);
router.get('/admin-dashboard', authMiddleware, isAdmin, getAdminDashboard);
router.get('/member-dashboard', authMiddleware, getMemberDashboard);
router.get('/member-profile', authMiddleware, getMemberProfile);
router.put('/update-member-profile', authMiddleware, updateMemberProfile);

module.exports = router;