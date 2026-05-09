const express = require("express");

const {
    getGroupMessages
} = require("../controllers/chatController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
    "/groups/:groupCode/messages",
    authMiddleware,
    getGroupMessages
);

module.exports = router;