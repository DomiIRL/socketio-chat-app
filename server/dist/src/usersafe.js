"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.getRoom = exports.setRoom = exports.getName = exports.setName = exports.usernames = void 0;
exports.usernames = new Map();
const userRooms = new Map();
function setName(socket, username) {
    if (username.length > 30)
        return;
    exports.usernames.set(socket, username);
}
exports.setName = setName;
function getName(socket) {
    return exports.usernames.get(socket);
}
exports.getName = getName;
function setRoom(socket, room) {
    if (room == null) {
        userRooms.delete(socket);
        return;
    }
    userRooms.set(socket, room);
}
exports.setRoom = setRoom;
function getRoom(socket) {
    const s = userRooms.get(socket);
    // Could be undefined
    return s == null ? null : s;
}
exports.getRoom = getRoom;
function removeUser(socket) {
    exports.usernames.delete(socket);
    userRooms.delete(socket);
}
exports.removeUser = removeUser;
// export class User {
//     id: number; // random immutable long value
//     name: String;
//     tag: number; // random number behind name to differenciate between multiple user
//     admin: boolean;
//
//
//     constructor(id: number, name: String, tag: number, admin: boolean) {
//         this.id = id;
//         this.name = name;
//         this.tag = tag;
//         this.admin = admin;
//     }
//
// }
