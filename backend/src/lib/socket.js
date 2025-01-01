import {Server} from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
export function getReciverSocketId(userId) {
  return userSocketMap[userId];
}
// used to store online users
const userSocketMap = {}; // {userId: socketId}
io.on("connection", (socket) => {
  console.log("a user connected to soket.io server", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  //io.emit() is used to send message to all connected users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log("a user disconnected from soket.io server", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
  socket.on("message", (data) => {
    console.log("message", data);
    io.emit("message", data);
  });
});
export {io, server, app};