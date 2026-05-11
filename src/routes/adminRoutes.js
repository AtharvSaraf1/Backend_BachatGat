const express = require("express");

const {
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
} = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post(
    "/register",
    registerAdmin
);
router.get(
    "/profile",
    authMiddleware,
    adminMiddleware,
    getAdminProfile);
router.put(
    "/payment-details",
    authMiddleware,
    adminMiddleware,
    updatePaymentDetails
);
router.get(
    "/groups/:groupCode/members",
    authMiddleware,
    adminMiddleware,
    getGroupMemebers
);
router.get(
    "/dashboard-overview",
    authMiddleware,
    adminMiddleware,
    getAdminDashboardOverview
);
router.post(
    "/create-group",
    authMiddleware,
    adminMiddleware,
    createGroup
);

router.get(
    "/groups",
    authMiddleware,
    adminMiddleware,
    getAdminGroups
);

router.get(
    "/groups/:groupCode",
    authMiddleware,
    adminMiddleware,
    getGroupDetails
);

router.get(
    "/groups/:groupCode/members",
    authMiddleware,
    adminMiddleware,
    getGroupMembers
);

router.post(
    "/add-member",
    authMiddleware,
    adminMiddleware,
    addMember
);

router.get(
    "/groups/:groupCode/members/:memberId",
    authMiddleware,
    adminMiddleware,
    getAdminMemberProfile
);

module.exports = router;