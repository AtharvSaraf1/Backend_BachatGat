const express = require("express");

const {
    registerAdmin,
    addMember,
    getAdminDashboardOverview,
    getAdminGroups,
    getGroupDetails,
    getGroupMembers
} = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post(
    "/register",
    registerAdmin
);

router.get(
    "/dashboard-overview",
    authMiddleware,
    adminMiddleware,
    getAdminDashboardOverview
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

module.exports = router;