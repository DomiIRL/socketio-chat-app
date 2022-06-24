import { addMessage } from "./dbmanager";
import {getRoom, setName, usernames} from "./usersafe";
import { Socket } from "socket.io";
import {Message, rooms} from "./rooms";
import {getRoomObject} from "./server";

let io: any;

export function initMessaging(connection: any) {
    io = connection;
}

export function sendMessage(room: string | null, username: string, message: string, socket: Socket) {
    if (room == null) {
        console.log("Received message from user without a room");
        return;
    }
    if (socket != null && !onlySpaces(username) && usernames.get(socket) !== username) {
        setName(socket, username);
        sendOnlineUsers(getRoom(socket));
    }
    const room1 = rooms.get(room);
    if (room1 == null) {
        console.log("Room object is null")
        return;
    }
    if (onlySpaces(message) || message.length > 5000) return;
    sendOnlineUsers(room1.id);
    const msg = new Message(room, username, message, new Date().getTime());
    room1.history.push(msg);

    addMessage(msg);
    if (io != null) {
        io.to(room1.id).emit("send-message", username, message, msg.time);
    }
}

function onlySpaces(str: string) {
    return /^\s*$/.test(str);
}

export function sendHistory(socket: Socket) {
    const usernames = new Array<string>();
    const messages = new Array<string>();
    const dates = new Array<Number>();

    const room = getRoomObject(socket);
    if (room == null) {
        console.log("Can't send history to player without room");
        return;
    }
    console.log(`Sending history to user of room ${room.id} with size ${room.history.length}`);

    room.history.forEach((message: Message) => {
        usernames.push(message.username);
        messages.push(message.message);
        dates.push(message.time);
    });

    console.log("Send history");
    socket.emit("history", getRoomObject(socket)?.name, usernames, messages, dates);
}

export function sendOnlineUsers(room: string | null | undefined) {
    if (room != null) {
        const names = new Array<string>();
        usernames.forEach((value, key) => {
            if (getRoom(key) == room) {
                names.push(value);
            }
        })
        io.to(room).emit("online-user", names);
    }
}

export function updateOnlineUsers(oldRoom: string | null | undefined, newRoom: string | null | undefined) {
    sendOnlineUsers(oldRoom);
    sendOnlineUsers(newRoom);
}

export class Channel {
    name: string;
    history: Array<Message>;

    constructor(name: string, history: Array<Message>) {
        this.name = name;
        this.history = history;
    }

}
