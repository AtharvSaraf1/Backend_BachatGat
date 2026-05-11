const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const chatRoutes = require('./routes/chatRoutes');
const commonRoutes = require('./routes/commonRoutes');
app.use(cors());
app.use(express.json());
app.use("/api/common", commonRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/chat", chatRoutes);
app.get('/not_sleep', (req, res) => {
    res.status(200).json({ message: "Server is awake" });
});
module.exports = app;