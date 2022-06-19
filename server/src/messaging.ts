import { addMessage } from "./dbmanager";
import {getRoom, setName, usernames} from "./usersafe";
import { Socket } from "socket.io";
import {Message, rooms} from "./rooms";
import {getRoomObject} from "./index";

let io: any;

export function initMessaging(connection: any) {
    io = connection;
}

export function sendMessage(room: string | null, username: string, message: string, socket: Socket) {
    if (room == null) {
        console.log("Received message from user without a room");
        return;
    }
    if (socket != null && usernames.get(socket) !== username) {
        setName(socket, username);
        sendOnlineUsers(getRoom(socket));
    }
    const room1 = rooms.get(room);
    if (room1 == null) {
        return;
    }
    if (message == "" || message.length > 1000) return;
    sendOnlineUsers(room1.id);
    const msg = new Message(room, username, message, new Date().getTime());
    room1.history.push(msg);

    addMessage(msg);
    if (io != null) {
        io.to(room1.id).emit("send-message", username, message, msg.time);
    }
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
    console.log(`Sending history to room ${room.id} with size ${room.history.length}`);

    room.history.forEach((message: Message) => {
        usernames.push(message.username);
        messages.push(message.message);
        dates.push(message.time);
    });

    console.log("Send history");
    socket.emit("history", usernames, messages, dates);
}

export function sendOnlineUsers(room: string | null | undefined) {
    if (room != null) {
        io.to(room).emit("online-user", Array.from(usernames.values()));
    }
}

export class Channel {
    name: string;
    history: Array<Message>;

    constructor(name: string, history: Array<Message>) {
        this.name = name;
        this.history = history;
    }

}
