"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomObject = exports.io = void 0;
const socket_io_1 = require("socket.io");
const messaging_1 = require("./messaging");
const usersafe_1 = require("./usersafe");
const dbmanager_1 = require("./dbmanager");
const rooms_1 = require("./rooms");
exports.io = new socket_io_1.Server(3030, {
    cors: {
    // origin: "http://localhost:3000"
    }
});
(0, dbmanager_1.initDB)();
exports.io.on("connection", socket => {
    sendRoomsToSocket(socket);
    (0, usersafe_1.setName)(socket, "");
    joinRoom(socket, "0");
    socket.on("send-message", (username, message) => {
        console.log("Received message from " + username);
        (0, messaging_1.sendMessage)((0, usersafe_1.getRoom)(socket), username, message, socket);
    });
    socket.on("disconnect", () => {
        (0, usersafe_1.removeUser)(socket);
        (0, messaging_1.sendOnlineUsers)((0, usersafe_1.getRoom)(socket));
    });
    socket.on("create-room", (name) => {
        console.log("Create room with name: " + name);
        const id = (0, rooms_1.createRoom)(name);
        console.log("Room created with id: " + id);
        if (id != null) {
            socket.join(id);
            (0, messaging_1.sendHistory)(socket);
            (0, messaging_1.sendOnlineUsers)((0, usersafe_1.getRoom)(socket));
            sendRooms();
        }
    });
});
function joinRoom(socket, room) {
    console.log(`Join room: ${room}`);
    if (!rooms_1.rooms.has(room))
        return;
    const oldRoom = (0, usersafe_1.getRoom)(socket);
    if (oldRoom != null) {
        socket.leave(oldRoom);
    }
    socket.join(room);
    (0, usersafe_1.setRoom)(socket, room);
    (0, messaging_1.sendOnlineUsers)((0, usersafe_1.getRoom)(socket));
    (0, messaging_1.sendHistory)(socket);
    console.log(`Joined room: ${room}`);
}
function getRoomObject(socket) {
    const room = (0, usersafe_1.getRoom)(socket);
    return room == null ? null : rooms_1.rooms.get(room);
}
exports.getRoomObject = getRoomObject;
function sendRoomsToSocket(socket) {
    let roomNames = new Array();
    for (let value of rooms_1.rooms.values()) {
        roomNames.push(value.name);
    }
    socket.emit("rooms", Array.from(rooms_1.rooms.keys()), roomNames);
}
function sendRooms() {
    let roomNames = new Array();
    for (let value of rooms_1.rooms.values()) {
        roomNames.push(value.name);
    }
    exports.io.emit("rooms", Array.from(rooms_1.rooms.keys()), roomNames);
}
(0, messaging_1.initMessaging)(exports.io);
