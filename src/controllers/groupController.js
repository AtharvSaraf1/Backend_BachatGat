const Group = require('../models/Group');
exports.createGroup = async(req, res) => {
    try {
        const {
            groupName,
            groupCode,
            village,
            taluka,
            district,
            state,
            formationDate
        } = req.body;
        if (!groupName || !groupCode) {
            return res.status(400).json({
                message: "groupName and groupCode are required"
            });
        }
        const existingName = await Group.findOne({ groupName });
        if (existingName) {
            return res.status(400).json({
                message: "Group name already exists"
            });
        }
        const existingCode = await Group.findOne({ groupCode });
        if (existingCode) {
            return res.status(400).json({
                message: "Group code already exists"
            });
        }
        const newGroup = new Group({
            groupName,
            groupCode,
            village,
            taluka,
            district,
            state,
            formationDate,
            adminId: req.user._id,
            members: [req.user._id]
        });
        await newGroup.save();
        if (!req.user.groupIds.includes(newGroup._id)) {
            req.user.groupIds.push(newGroup._id);
            await req.user.save();
        }
        res.status(201).json({
            message: "Group created successfully",
            groupId: newGroup._id,
            groupName: newGroup.groupName,
            groupCode: newGroup.groupCode
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getGroups = async(req, res) => {
    try {
        const groups = await Group.find({
            _id: { $in: req.user.groupIds }
        }).select("_id groupName");

        res.status(200).json(groups);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};