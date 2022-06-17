"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Room = exports.deleteRoom = exports.createRoom = exports.rooms = void 0;
const nanoid_1 = require("nanoid");
const dbmanager_1 = require("./dbmanager");
exports.rooms = new Map();
function createRoom(roomName) {
    if (roomName.trim() == "")
        return null;
    const id = (0, nanoid_1.nanoid)();
    exports.rooms.set(id, new Room(id, roomName, new Array()));
    (0, dbmanager_1.addRoom)(id, roomName);
    return id;
}
exports.createRoom = createRoom;
function deleteRoom(id) {
    exports.rooms.delete(id);
    (0, dbmanager_1.removeRoom)(id);
}
exports.deleteRoom = deleteRoom;
class Room {
    id;
    name;
    history;
    constructor(id, name, history) {
        this.id = id;
        this.name = name;
        this.history = history;
    }
}
exports.Room = Room;
class Message {
    room;
    username;
    message;
    time;
    constructor(room, username, message, time) {
        this.room = room;
        this.username = username;
        this.message = message;
        this.time = time;
    }
}
exports.Message = Message;
