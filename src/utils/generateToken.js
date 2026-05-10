const jwt = require("jsonwebtoken");

const generateToken = (id, roleSelection) => {
    return jwt.sign(
        { id, roleSelection },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = generateToken;