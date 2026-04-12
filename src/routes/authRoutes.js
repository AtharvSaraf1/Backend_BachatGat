const express = require('express');
const router = express.Router();
const { registerAdmin, addUser, passwordlogin, sendOTP, verifyOTP } = require('../controllers/authController');
const authMiddleWare = require("../middlewares/authMiddleWare");
const authMiddleware = require('../middlewares/authMiddleWare');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/addUser', authMiddleware, addUser);
router.post('/password-login', passwordlogin);
router.post('/registerAdmin', registerAdmin);

module.exports = router;