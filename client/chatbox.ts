import {Socket} from "socket.io-client";

let messageContainer = document.getElementById("message-container");
let form = document.getElementById("send-form");
let textInput = document.getElementById("message-input");
let usernameInput = document.getElementById("username-input");

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

export function loadHistory(usernames: Array<string>, messages: Array<string>, timestamps: Array<number>) {
    if (messageContainer != null) {
        // @ts-ignore
        messageContainer.replaceChildren();
    }
    for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        const message = messages[i];
        const timestamp = timestamps[i];
        displayMessage(username, message, timestamp)
    }
}

export function displayBotMessage(message: string) {
    displayMessage("Bot", message, new Date().getTime());
}

export function displayMessage(username: string, message: string, time: number) {
    const messageBox = createMessageBox();
    if (messageBox == null) return;

    // @ts-ignore
    const date = new Date(time);

    let timeDisplay = "";
    if (new Date().toDateString() != date.toDateString()) {
        timeDisplay = `${formatNumber(date.getDate())}/${formatNumber(date.getMonth() + 1)}/${formatNumber(date.getFullYear())} `;
    }
    timeDisplay += `${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`;

    // @ts-ignore
    const messageElem = messageBox.querySelector(".message");
    // @ts-ignore
    const usernameElem = messageBox.querySelector(".username");
    // @ts-ignore
    const timestampElem = messageBox.querySelector(".timestamp");
    if (messageElem != null) {
        messageElem.textContent = message;
        findYoutube(messageElem.innerHTML, data => {
            const frameElement = document.createElement("iframe");
            frameElement.src = data;
            frameElement.width = "550";
            frameElement.height = "309.4";
            frameElement.className = "embed"
            messageBox.appendChild(frameElement);
        });
        findImage(messageElem.innerHTML, data => {
            const imageElement = document.createElement("img");
            const aElement = document.createElement("a");
            aElement.href = data;
            aElement.target = "_blank";
            imageElement.src = data;
            imageElement.alt = "";
            imageElement.className = "image embed";
            aElement.appendChild(imageElement);
            messageBox.appendChild(aElement);
        });
        messageElem.innerHTML = linkify(messageElem.innerHTML);
        usernameElem.textContent = username;
        timestampElem.textContent = timeDisplay;
    }

    if (messageContainer != null) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

}

/**
 * TODO: EXECUTE CALLBACK FOR EVERY MATCH
 *
 * @param inputText the text that is searched for matches
 * @param imageCallback a callback that gets executed for the first match
 */
function findImage(inputText: string, imageCallback: FunctionStringCallback) {
    const imageTest = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp|jpeg)/;
    const regExp = new RegExp(imageTest);
    const exec = regExp.exec(inputText);
    if (exec) {
        imageCallback(exec[0]);
        return true;
    }
    return false;
}

/**
 * TODO: EXECUTE CALLBACK FOR EVERY MATCH
 *
 * @param inputText the text that is searched for matches
 * @param videoCallback a callback that gets executed for the first match
 */
function findYoutube(inputText: string, videoCallback: FunctionStringCallback) {
    const youtubeTest = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    const regExp = new RegExp(youtubeTest);
    const exec = regExp.exec(inputText);
    if (exec) {
        videoCallback(`https://www.youtube.com/embed/${exec[1]}`);
        return true;
    }
    return false;
}

function linkify(inputText: string) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

function createMessageBox() {

    const messageBox = createElementFromHTML(
        "<div class='message-box'>\n" +
        "<div class='message-header'>" +
        "<p class='username'></p>" +
        "<p class='timestamp'></p>" +
        "</div>" +
        "<p class='message'></p>\n" +
        // "<img class='image' src='https://static.remove.bg/remove-bg-web/eb1bb48845c5007c3ec8d72ce7972fc8b76733b1/assets/start-1abfb4fe2980eabfbbaaa4365a0692539f7cd2725f324f904565a9a744f8e214.jpg' alt='NOT LOADED''>" +
        "</div>"
    )
    if (messageBox == null) return null;

    if (messageContainer != null) {
        if (messageContainer.children.length === 0) {
            messageContainer.appendChild(messageBox);
        } else {
            messageContainer.insertBefore(messageBox, messageContainer.children[0]);
        }
        return messageBox;
    }
    return null;
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
        document.body.style.backgroundImage = "url('assets/bg.jpg')";
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

function createElementFromHTML(htmlstring: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlstring.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

function formatNumber(number: any) {
    if (number.toString().length < 2) {
        return `0${number}`;
    }
    return number;
}

if (form != null) {
    form.addEventListener("submit", e => {
        console.log("Submit message");
        e.preventDefault();
        const message = (<HTMLInputElement>textInput).value;

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

function executeBackgroundCommand(input: string, args: string[]) {

    if (args.length == 0) {
        displayBotMessage("Please enter an url for the background image");
        return false;
    }
    if (args[0].toLowerCase() === "reset") {
        setBackgroundImage(null);
        displayBotMessage("Background was reset");
        return true;
    }
    const success = findImage(args[0], data => {
        setBackgroundImage(data);
        displayBotMessage("Background image has been changed successfully");
    });
    if (!success) {
        displayBotMessage("Please enter an url for the background image");
    }

    return success;
}

function executeColorCommand(input: string, args: string[]) {

    if (args.length == 0) {
        displayBotMessage("Please enter an valid hex code for the text color");
        return false;
    }
    if (args[0].toLowerCase() === "reset") {
        setTextColor(null);
        displayBotMessage("Text color was reset");
        return true;
    }

    const exp = new RegExp(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
    if (exp.test(args[0])) {
        displayBotMessage("Text color was changed successfully")
        setTextColor(args[0]);
        return true;
    }
    displayBotMessage("Please enter an valid hex code for the text color");
    return false;
}