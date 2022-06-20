import {Socket} from "socket.io-client";
import {loadNameFromStorage} from "./chat";

const form = document.getElementById("create-form");
const nameInput = document.getElementById("room-creation-input");
const roomList = document.getElementById("room-list");
const roomTitle = document.getElementById("room-name");

// Javascript is stupid
let socket: Socket;

export function init(io: Socket) {
    socket = io;
    loadNameFromStorage();
    if (form != null) {
        form.addEventListener("submit", ev => {
            ev.preventDefault();
            if (nameInput == null) return;
            const roomName = (<HTMLInputElement>nameInput).value;
            if (roomName == null) return;
            if (onlySpaces(roomName)) return;
            (<HTMLInputElement>nameInput).value = "";
            socket.emit("create-room", roomName)
        });
    }
}

export function setCurrentRoomName(name: string) {
    if (roomTitle != null) {
        roomTitle.textContent = `#${name}`;
    }
}

export function loadRooms(ids: Array<string>, names: Array<string>) {
    if (roomList != null) {
        roomList.replaceChildren();
    }
    for (let i = 0; i < ids.length && i < names.length; i++) {
        const id = ids[i];
        const name = names[i];
        console.log(`Room: id=${id} name=${name}`);
        displayRoom(name, id);
    }
}

export function displayRoom(name: string, id: string) {
    const roomElement = createRoomElement();
    if (roomElement == null) return;

    const nameElement = document.createElement("p");
    nameElement.textContent = name;

    // @ts-ignore
    (<HTMLButtonElement>roomElement).onclick = ev => {
        socket.emit("join-room", id);
    }
    roomElement.appendChild(nameElement);
}

export function createRoomElement() {
    const roomElement = createElementFromHTML(
        "<button id='room-entry'>" +
        "</button>"
    );
    if (roomElement == null) return null;

    if (roomList != null) {
        roomList.appendChild(roomElement);
        return roomElement;
    }
    return null;
}

function createElementFromHTML(htmlstring: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlstring.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

function onlySpaces(str: string) {
    return /^\s*$/.test(str);
}
