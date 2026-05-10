const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Message");

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use(async(socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1] ||
                socket.handshake.query?.token;

            if (!token) {
                return next(new Error("Token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.user.fullName);

        socket.on("joinGroup", async({ groupCode }) => {
            try {
                const group = await Group.findOne({ groupCode });

                if (!group) {
                    return socket.emit("errorMessage", {
                        message: "Group not found"
                    });
                }

                const isApprovedMember = group.members.some(
                    (m) =>
                    m.userId.toString() === socket.user._id.toString() &&
                    m.status === "approved"
                );

                if (!isApprovedMember) {
                    return socket.emit("errorMessage", {
                        message: "You are not approved member of this group"
                    });
                }

                socket.join(groupCode);

                socket.emit("joinedGroup", {
                    message: "Joined group chat successfully",
                    groupCode
                });
            } catch (error) {
                socket.emit("errorMessage", {
                    message: error.message
                });
            }
        });

        socket.on("sendMessage", async({ groupCode, message, messageType }) => {
            try {
                if (!groupCode || !message) {
                    return socket.emit("errorMessage", {
                        message: "groupCode and message are required"
                    });
                }

                const group = await Group.findOne({ groupCode });

                if (!group) {
                    return socket.emit("errorMessage", {
                        message: "Group not found"
                    });
                }

                const isApprovedMember = group.members.some(
                    (m) =>
                    m.userId.toString() === socket.user._id.toString() &&
                    m.status === "approved"
                );

                if (!isApprovedMember) {
                    return socket.emit("errorMessage", {
                        message: "You are not approved member of this group"
                    });
                }

                const newMessage = await Message.create({
                    groupId: group._id,
                    senderId: socket.user._id,
                    messageType: messageType || "text",
                    message,
                    readBy: [{
                        userId: socket.user._id
                    }]
                });

                const populatedMessage = await Message.findById(newMessage._id)
                    .populate("senderId", "fullName mobileNumber roleSelection");

                io.to(groupCode).emit("receiveMessage", populatedMessage);
            } catch (error) {
                socket.emit("errorMessage", {
                    message: error.message
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.user.fullName);
        });
    });
};

module.exports = initializeSocket;