const express = require("express");

const {
    getMemberGroupRequests,
    acceptGroupRequest,
    rejectGroupRequest,
    getMemberGroups,
    getMemberGroupDetails
} = require("../controllers/memberController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
    "/group-requests",
    authMiddleware,
    getMemberGroupRequests
);

router.post(
    "/group-requests/accept",
    authMiddleware,
    acceptGroupRequest
);

router.post(
    "/group-requests/reject",
    authMiddleware,
    rejectGroupRequest
);

router.get(
    "/groups",
    authMiddleware,
    getMemberGroups
);

router.get(
    "/groups/:groupCode",
    authMiddleware,
    getMemberGroupDetails
);

module.exports = router;