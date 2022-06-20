import {Server, Socket} from "socket.io";
require("log-timestamp");
import {
    initMessaging,
    sendHistory,
    sendMessage,
    sendOnlineUsers,
    updateOnlineUsers
} from "./messaging";
import { getRoom, removeUser, setName, setRoom } from "./usersafe";
import { initDB } from "./dbmanager";
import { createRoom, Room, rooms } from "./rooms";

export const io = new Server(3030, {
    cors: {
        // origin: "http://localhost:3000"
    },
    connectTimeout: 1000
});

console.log("Starting chatapp server")

initDB();

io.on("connection", socket => {

    sendRoomsToSocket(socket);
    setName(socket, "");
    joinRoom(socket, "0");

    socket.on("send-message", (username: string, message: string) => {
        console.log("Received message from " + username)
        sendMessage(getRoom(socket), username, message, socket);
    });

    socket.on("disconnect", () => {
        sendOnlineUsers(getRoom(socket));
        removeUser(socket);
    });

    socket.on("create-room", (name: string) => {
        console.log("Create room with name: " + name)
        const id = createRoom(name);
        console.log("Room created with id: " + id);
        if (id != null) {
            joinRoom(socket, id);
            sendHistory(socket);
            sendOnlineUsers(getRoom(socket));
            sendRooms();
        }
    });

    socket.on("join-room", (id: string) => {
        joinRoom(socket, id);
    });

});

function joinRoom(socket: Socket, room: string) {
    console.log(`Join room: ${room}`)
    if (!rooms.has(room)) {
        console.log("Room does not exist");
        return;
    }

    const oldRoom = getRoom(socket);
    if (oldRoom == room) return;
    if (oldRoom != null) {
        socket.leave(oldRoom);
    }

    socket.join(room);
    setRoom(socket, room);
    updateOnlineUsers(oldRoom, room);
    sendHistory(socket);
    console.log(`Joined room: ${room}`)
}

export function getRoomObject(socket: Socket) : Room | null | undefined {
    const room = getRoom(socket);
    return room == null ? null : rooms.get(room);
}

function sendRoomsToSocket(socket: Socket) {
    let roomNames = new Array<string>();

    for (let value of Array.from(rooms.values())) {
        roomNames.push(value.name);
    }

    socket.emit("rooms", Array.from(rooms.keys()), roomNames);
}

function sendRooms() {
    let roomNames = new Array<string>();

    for (let value of Array.from(rooms.values())) {
        roomNames.push(value.name);
    }

    io.emit("rooms", Array.from(rooms.keys()), roomNames);
}

initMessaging(io);
