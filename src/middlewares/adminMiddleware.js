const adminMiddleware = (req, res, next) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (req.user.roleSelection !== "admin") {
            return res.status(403).json({
                message: "Only admin can access this route"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = adminMiddleware;