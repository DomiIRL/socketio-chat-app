import * as chatbox from "./chat";

const onlineCount = document.getElementById("online-counter");
const onlineUsers = document.getElementById("player-bar-list");

export function setOnlineUsers(users: Array<string>) {
    // Lists users without a name at the bottom of the list
    const namedUsers = new Array<string>();
    const unnamedUsers = new Array<string>();

    users.forEach(user => {
        if (user !== "") {
            namedUsers.push(user);
        } else {
            unnamedUsers.push(user);
        }
    });

    namedUsers.sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    })

    unnamedUsers.forEach(users => {
        namedUsers.push(users);
    })

    if (onlineUsers != null) {
        onlineUsers.replaceChildren()

        namedUsers.forEach(user => {
            const userText = document.createElement("li");
            userText.textContent = user === "" ? chatbox.defaultName : user.toString();
            if (onlineUsers != null) {
                onlineUsers.appendChild(userText)
            }
        })
    }
}

export function setOnlineCount(count: number) {
    if (onlineCount != null) {
        onlineCount.textContent = "Online: " + count;
    }

}