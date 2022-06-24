let messageContainer = document.getElementById("message-container");

export function loadHistory(usernames: Array<string>, messages: Array<string>, timestamps: Array<number>) {
    if (messageContainer != null) {
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
        messageElem.innerHTML = messageElem.innerHTML.replace(/\\n/g, "<br>");
        findVideo(messageElem.innerHTML, data => {
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

function createElementFromHTML(htmlstring: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlstring.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

export function displayNotification(title: string, body: string) {
    console.log(Notification.permission);
    if (document.visibilityState === "visible") {
        return;
    }

    if (Notification.permission === "granted") {
        showNotification(title, body);
    } else if (Notification.permission === "default") {
        requestAndShowNotification(title, body);
    }
}

function requestAndShowNotification(title: string, body: string) {
    Notification.requestPermission(permission => {
        if (permission === "granted") {
            showNotification(title, body);
        }
    });
}

export function requestNotifications() {
    Notification.requestPermission(permission => {});
}

function showNotification(title: string, body: string) {
    const notification = new Notification(title, {body: body});
    notification.onclick = () => {
        notification.close();
        window.parent.focus();
    }
}

/**
 * TODO: EXECUTE CALLBACK FOR EVERY MATCH
 *
 * @param inputText the text that is searched for matches
 * @param imageCallback a callback that gets executed for the first match
 */
export function findImage(inputText: string, imageCallback: FunctionStringCallback) {
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
function findVideo(inputText: string, videoCallback: FunctionStringCallback) {
    const youtubeTest = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
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

function formatNumber(number: any) {
    if (number.toString().length < 2) {
        return `0${number}`;
    }
    return number;
}