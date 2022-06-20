import {io, Socket} from "socket.io-client";
import * as chatbox from "./chatbox";
import * as playerbar from "./playerbar";

chatbox.loadBackgroundImage();
chatbox.loadTextColor();

const socket: Socket = io("http://172.18.16.37:8000")
// const socket: Socket = io("http://localhost:3030")
socket.on('connect', () => {
    console.log("Connected. " + socket.id)

    chatbox.init(socket);

    // socket.emit("create-room", "Global")

    chatbox.loadNameFromStorage();

    let name = chatbox.getUsername();
    if (name != "") {
        sendMessage(name, "");
    }

    socket.on("send-message", (username: string, message: string, time: number) => {
        console.log(`Received message`)
        chatbox.displayMessage(username, message, time);
    });

    socket.on("history", (usernames: Array<string>, messages: Array<string>, timestamps: Array<number>) => {
        console.log(`Received history: ${usernames.length}`)
        chatbox.loadHistory(usernames, messages, timestamps);
    });

    socket.on("online-user", (users: Array<string>) => {
        playerbar.setOnlineCount(users.length);
        playerbar.setOnlineUsers(users);
    });

    socket.on("rooms", (ids: Array<string>, names: Array<string>) => {
        console.log(`Received rooms: ids: ${ids} names: ${names}`)
        for (let i = 0; i < ids.length && i < names.length; i++) {
            const id = ids[i];
            const name = names[i];
            console.log(`Room: id=${id} name=${name}`);
        }
    });

})

export function sendMessage(username: string, message: string) {
    console.log("Send message to server")
    socket.emit("send-message", username, message);
}