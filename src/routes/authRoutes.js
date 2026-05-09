const express = require('express');
const router = express.Router();
const { passwordlogin, sendOTP, verifyOTP } = require('../controllers/authController');
const authMiddleware = require("../middlewares/authMiddleware");
const {
    isAdmin
} = require('../middlewares/adminMiddleware');
const { makeContribution, getGroupContributions } = require('../controllers/contibutionController');
const {
    requestLoan,
    getLoanRequests,
    updateLoanStatus
} = require('../controllers/loanController');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/password-login', passwordlogin);
router.get('/member-dashboard', authMiddleware, makeContribution);
router.get('/get-group-contributions', authMiddleware, getGroupContributions);
router.post('/request-loan', authMiddleware, requestLoan);
router.get('/loan-requests', authMiddleware, getLoanRequests);
router.put('/update-loan-status', authMiddleware, updateLoanStatus);
module.exports = router;