function sendMessageTo(message, number) {
    let numberLink = document.createElement("a");
    numberLink.id = "number_link";
    document.body.append(numberLink);
    numberLink.setAttribute("href", `https://api.whatsapp.com/send?phone=${number}&text=`)

    setTimeout(() => numberLink.click(), () => {
        numberLink.remove();
    }, 0)

}

function sendCurrentMessage() {
    console.log("Messaging");
    chrome.storage.sync.get(['messageData'], (result) => {
        [message, phoneNumber] = result.messageData
        console.log('Value currently is ' + result.messageData);
        // sendMessageTo(message, phoneNumber)

        let numberLink = document.createElement("a");
        numberLink.id = "number_link";
        document.body.append(numberLink);
        numberLink.setAttribute("href", `https://api.whatsapp.com/send?phone=${phoneNumber}&text=`)

        setTimeout(() => numberLink.click(), () => {
            numberLink.remove();
        }, 0)
    });

    // sendMessageTo(message, phoneNumber)

}

let sendButton = document.getElementById("send_button");
sendButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let message = document.getElementById("message").value;
    let phoneNumber = document.getElementById("cell_input").value;
    console.log("Data:", message, phoneNumber);
    chrome.storage.sync.set({ messageData: [message, phoneNumber] });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: sendCurrentMessage,
    });

})




