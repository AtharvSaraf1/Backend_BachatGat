const express = require("express");
const router = express.Router();
const { updateLanguage } = require("../controllers/commonController");

const authMiddleware = require("../middlewares/authMiddleware");

router.put(
    "/update-language",
    authMiddleware,
    updateLanguage
);

module.exports = router;