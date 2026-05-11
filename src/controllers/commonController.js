const User = require('../models/User');
const updateLanguage = async(req, res) => {

    try {
        const { preferredLanguage } = req.body;
        if (![
                "english",
                "hindi",
                "marathi"
            ].includes(preferredLanguage)) {
            return res.status(400).json({
                success: false,
                message: "Invalid language"
            });
        }
        const user =
            await User.findByIdAndUpdate(
                req.user._id, {
                    preferredLanguage
                }, {
                    new: true
                }
            ).select(
                "fullName preferredLanguage"
            );
        res.status(200).json({
            success: true,
            message: "Language updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

};

module.exports = { updateLanguage };