const express = require('express');
const router = express.Router();
const { registerAdmin, addUser, passwordlogin, sendOTP, verifyOTP, createGroup, getGroups } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleWare');
const {
    isAdmin
} = require('../middlewares/adminMiddleware');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/add-user', authMiddleware, isAdmin, addUser);
router.post('/password-login', passwordlogin);
router.post('/registerAdmin', registerAdmin);
router.post('/create-group', authMiddleware, isAdmin, createGroup);
router.get("/get-groups", authMiddleware, getGroups);

module.exports = router;