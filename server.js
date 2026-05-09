const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const initializeSocket = require("./src/socket/socket");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});