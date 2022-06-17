"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = exports.sendOnlineUsers = exports.sendHistory = exports.sendMessage = exports.initMessaging = void 0;
const dbmanager_1 = require("./dbmanager");
const usersafe_1 = require("./usersafe");
const rooms_1 = require("./rooms");
const index_1 = require("./index");
let io;
function initMessaging(connection) {
    io = connection;
}
exports.initMessaging = initMessaging;
function sendMessage(room, username, message, socket) {
    if (room == null) {
        console.log("Received message from user without a room");
        return;
    }
    if (socket != null && usersafe_1.usernames.get(socket) !== username) {
        (0, usersafe_1.setName)(socket, username);
        sendOnlineUsers((0, usersafe_1.getRoom)(socket));
    }
    const room1 = rooms_1.rooms.get(room);
    if (room1 == null) {
        return;
    }
    if (message == "" || message.length > 1000)
        return;
    sendOnlineUsers(room1.id);
    const msg = new rooms_1.Message(room, username, message, new Date().getTime());
    (0, dbmanager_1.addMessage)(msg);
    if (io != null) {
        io.to(room1.id).emit("send-message", username, message, msg.time);
    }
}
exports.sendMessage = sendMessage;
function sendHistory(socket) {
    const usernames = new Array();
    const messages = new Array();
    const dates = new Array();
    const room = (0, index_1.getRoomObject)(socket);
    if (room == null)
        return;
    console.log(`Sending history to room ${room.id} with size ${room.history.length}`);
    room.history.forEach((message) => {
        usernames.push(message.username);
        messages.push(message.message);
        dates.push(message.time);
    });
    console.log("Send history");
    socket.emit("history", usernames, messages, dates);
}
exports.sendHistory = sendHistory;
function sendOnlineUsers(room) {
    if (room != null) {
        io.to(room).emit("online-user", Array.from(usersafe_1.usernames.values()));
    }
}
exports.sendOnlineUsers = sendOnlineUsers;
class Channel {
    name;
    history;
    constructor(name, history) {
        this.name = name;
        this.history = history;
    }
}
exports.Channel = Channel;
