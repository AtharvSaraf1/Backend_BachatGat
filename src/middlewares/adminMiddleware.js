exports.isAdmin = (req, res, next) => {
    if (req.user.roleSelection !== 'admin') {
        return res.status(403).json({
            message: "Admin acess required"
        });


    }
    next();
};