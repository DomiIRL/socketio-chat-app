import {io, Socket} from "socket.io-client";
import * as chat from "./chat";
import * as playerbar from "./playerbar";
import * as chatBox from "./chatbox";
import * as rooms from "./rooms";
import { port } from "../config";

chat.loadBackgroundImage();
chat.loadTextColor();
chatBox.requestNotifications();

const socket: Socket = io(`${document.location.hostname}`)
socket.on('connect', () => {
    console.log("Connected. " + socket.id)

    chat.init(socket);
    rooms.init(socket);

    chat.loadNameFromStorage();

    let name = chat.getUsername();
    if (name != "") {
        sendMessage(name, "");
    }

    socket.on("send-message", (username: string, message: string, time: number) => {
        console.log(`Received message`);
        chatBox.displayMessage(username, message, time);

        chatBox.displayNotification(username, message);
    });

    socket.on("history", (room: string, usernames: Array<string>, messages: Array<string>, timestamps: Array<number>) => {
        console.log(`Received history: ${usernames.length}`);
        chatBox.loadHistory(usernames, messages, timestamps);
        rooms.setCurrentRoomName(room);
    });

    socket.on("online-user", (users: Array<string>) => {
        playerbar.setOnlineCount(users.length);
        playerbar.setOnlineUsers(users);
    });

    socket.on("rooms", (ids: Array<string>, names: Array<string>) => {
        console.log(`Received rooms: ids: ${ids} names: ${names}`)
        rooms.loadRooms(ids, names);
    });

})

export function sendMessage(username: string, message: string) {
    console.log("Send message to server")
    socket.emit("send-message", username, message);
}
