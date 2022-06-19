document.body.oncontextmenu = ev => {
    ev.preventDefault();
};

const elements = document.getElementsByClassName("allowed-context-menu");

// @ts-ignore
for (let element of elements) {
    element.addEventListener("contextmenu", event => {
        event.returnValue = true;
        if (typeof(event.stopPropagation) === 'function')
        {
            event.stopPropagation();
        }
        if (typeof(event.cancelBubble) === 'function')
        {
            // @ts-ignore
            event.cancelBubble();
        }
    }, true);
}
