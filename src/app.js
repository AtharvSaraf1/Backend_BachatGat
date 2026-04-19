const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.get('/not_sleep', (req, res) => {
    res.status(200).json({ message: "Server is awake" });
});
module.exports = app;