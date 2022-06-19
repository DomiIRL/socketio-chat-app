import {Server, Socket} from "socket.io";
import {initMessaging, sendHistory, sendMessage, sendOnlineUsers} from "./messaging";
import {getRoom, removeUser, setName, setRoom} from "./usersafe";
import {addRoom, initDB} from "./dbmanager";
import {createRoom, Room, rooms} from "./rooms";

export const io = new Server(3030, {
    cors: {
        // origin: "http://localhost:3000"
    }
});

initDB();

io.on("connection", socket => {

    sendRoomsToSocket(socket);
    setName(socket, "");
    joinRoom(socket, "0");

    socket.on("send-message", (username: string, message: string) => {
        console.log(`Received message from ${username} with content ${message}`)
        sendMessage(getRoom(socket), username, message, socket);
    });

    socket.on("disconnect", () => {
        removeUser(socket);
        sendOnlineUsers(getRoom(socket));
    });

    socket.on("create-room", (name: string) => {
        console.log("Create room with name: " + name)
        const id = createRoom(name);
        console.log("Room created with id: " + id);
        if (id != null) {
            socket.join(id);
            sendHistory(socket);
            sendOnlineUsers(getRoom(socket));
            sendRooms();
        }
    });

});

function joinRoom(socket: Socket, room: string) {
    console.log(`Join room: ${room}`)
    if (!rooms.has(room)) {
        console.log("Room does not exist");
        return;
    }

    const oldRoom = getRoom(socket);
    if (oldRoom != null) {
        socket.leave(oldRoom);
    }

    socket.join(room);
    setRoom(socket, room);
    sendOnlineUsers(getRoom(socket));
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
