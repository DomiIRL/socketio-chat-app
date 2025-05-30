import {Socket} from "socket.io-client";
import * as chatbox from "./chatbox";

const form = document.getElementById("send-form");
const textInput = document.getElementById("message-input");
const usernameInput = document.getElementById("username-input");
const defaultBackground = document.body.style.backgroundImage;

export const defaultName = "Anonymous";

// Javascript is stupid
let socket: Socket;

export function init(io: Socket) {
    socket = io;
    loadNameFromStorage();
}

export function loadNameFromStorage() {
    const item = localStorage.getItem("name");
    if (!(item === undefined || item === null || item === "")) {
        (<HTMLInputElement>usernameInput).value = item;
    }
}

export function getUsername() {
    return (<HTMLInputElement>usernameInput).value;
}

function setBackgroundImage(url: string | null) {
    if (url == null) {
        localStorage.removeItem("background");
    } else {
        localStorage.setItem("background", url);
    }
    loadBackgroundImage();
}

export function loadBackgroundImage() {
    const item = localStorage.getItem("background");
    if (item != null) {
        document.body.style.backgroundImage = `url(${item})`;
    } else {
        document.body.style.backgroundImage = defaultBackground;
    }
}

function setTextColor(hex: string | null) {
    if (hex == null) {
        localStorage.removeItem("text-color");
    } else {
        localStorage.setItem("text-color", hex);
    }
    loadTextColor();
}

export function loadTextColor() {
    const item = localStorage.getItem("text-color");
    console.log(item);
    if (item != null) {
        document.documentElement.style.setProperty("--font-color", item);
    } else {
        document.documentElement.style.setProperty("--font-color", "#333333");
    }
}

if (form != null && textInput != null) {

    textInput.addEventListener("keydown", e => {
        const keyCode = e.which || e.keyCode;

        if (keyCode === 13 && e.shiftKey) {
            e.preventDefault();
            (<HTMLInputElement>e.target).value = (<HTMLInputElement>e.target).value + "\\n";
        }
    });

    textInput.addEventListener("paste", e => {
        // @ts-ignore
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        console.log(paste)

        typeInTextarea(paste.replace(/(\r\n|\n|\r)/gm, "\\n"))

        e.preventDefault();
    });

    form.addEventListener("submit", e => {
        console.log("Submit message");
        e.preventDefault();
        const message = (<HTMLInputElement>textInput).value;

        if (onlySpaces(message)) return;

        if (message.startsWith("/background")) {
            const args = message.split(" ");
            if (executeBackgroundCommand(message, args.slice(1, args.length))) {
                (<HTMLInputElement>textInput).value = "";
            }
            return;
        } else if (message.startsWith("/color")) {
            const args = message.split(" ");
            if (executeColorCommand(message, args.slice(1, args.length))) {
                (<HTMLInputElement>textInput).value = "";
            }
            return;
        }

        const usernameValue = (<HTMLInputElement>usernameInput).value;
        if (usernameValue != "") {
            localStorage.setItem("name", usernameValue);
        }

        const username = usernameValue === "" ? defaultName : usernameValue;
        if (message === "") return;
        (<HTMLInputElement>textInput).value = "";
        socket.emit("send-message", username, message);
    })
}

function typeInTextarea(newText: string, el = document.activeElement) {
    if (el != null) {
    // @ts-ignore
    const [start, end] = [el.selectionStart, el.selectionEnd];
    // @ts-ignore
    el.setRangeText(newText, start, end, 'select');
    }
}

function executeBackgroundCommand(input: string, args: string[]) {

    if (args.length == 0) {
        chatbox.displayBotMessage("Please enter an url for the background image");
        return false;
    }
    if (args[0].toLowerCase() === "reset") {
        setBackgroundImage(null);
        chatbox.displayBotMessage("Background was reset");
        return true;
    }
    const success = chatbox.findImage(args[0], data => {
        setBackgroundImage(data);
        chatbox.displayBotMessage("Background image has been changed successfully");
    });
    if (!success) {
        chatbox.displayBotMessage("Please enter an url for the background image");
    }

    return success;
}

function executeColorCommand(input: string, args: string[]) {

    if (args.length == 0) {
        chatbox.displayBotMessage("Please enter an valid hex code for the text color");
        return false;
    }
    if (args[0].toLowerCase() === "reset") {
        setTextColor(null);
        chatbox.displayBotMessage("Text color was reset");
        return true;
    }

    const exp = new RegExp(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
    if (exp.test(args[0])) {
        chatbox.displayBotMessage("Text color was changed successfully")
        setTextColor(args[0]);
        return true;
    }
    chatbox.displayBotMessage("Please enter an valid hex code for the text color");
    return false;
}

function onlySpaces(str: string) {
    return /^\s*$/.test(str);
}
