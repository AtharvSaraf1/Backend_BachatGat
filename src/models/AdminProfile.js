const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    designation: { type: String, required: false },
    officeAddress: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminProfile', adminProfileSchema);