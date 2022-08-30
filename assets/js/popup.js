let csv_text = document.getElementById("csv_text");
let csv_file = document.getElementById("csv_file");
let send_button = document.getElementById("send_button");
let message_template = document.getElementById("message");

csv_file.addEventListener("change", handleFileSelect);
send_button.addEventListener("click", handleMessageSubmit);

async function handleMessageSubmit() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let messageTemplate = message_template.value;
    let contacts_csv = csv_text.value;

    csvList = csvToArray(contacts_csv);

    chrome.storage.sync.set({ messageTemplate });
    chrome.storage.sync.set({ csvList });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["assets/js/inject.js"]
    });
}

function handleFileSelect(evt) {
    let file = evt.target.files[0];
    let reader = new FileReader();

    reader.onload = function (event) {
        let text = event.target.result;
        csv_text.value = text;
        console.log(text);
        let csvList = csvToArray(text);
        // TODO: add warning in case parsing fails
        chrome.storage.sync.set({ csvList });
    };
    reader.readAsText(file);

}

function csvToArray(str, delimiter = ',', header = false) {

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.split("\n");

    // split values from each row into an array
    const arr = [];
    for (let i = 0; i < rows.length; i++) {
        arr.push(rows[i].split(','));
    }
    // TODO: add warning if parsing fails
    return arr;

}

// send_button.addEventListener("click", async () => {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     let messageTemplate = document.getElementById("message").value;
//     chrome.storage.sync.set({ messageTemplate });

//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         files: ["assets/js/inject.js"]
//         // func: sendCurrentMessage,
//     });

// })



// function sendMessageTo(message, number) {
//     let numberLink = document.createElement("a");
//     numberLink.id = "number_link";
//     document.body.append(numberLink);
//     numberLink.setAttribute("href", `https://api.whatsapp.com/send?phone=${number}&text=`)

//     setTimeout(() => numberLink.click(), () => {
//         numberLink.remove();
//     }, 0)

// }

// function sendCurrentMessage() {
//     console.log("Messaging");
//     chrome.storage.sync.get(['messageData'], (result) => {
//         [message, phoneNumber] = result.messageData
//         console.log('Value currently is ' + result.messageData);
//         // sendMessageTo(message, phoneNumber)

//         let numberLink = document.createElement("a");
//         numberLink.id = "number_link";
//         document.body.append(numberLink);
//         numberLink.setAttribute("href", `https://api.whatsapp.com/send?phone=${phoneNumber}&text=`)

//         setTimeout(() => numberLink.click(), () => {
//             numberLink.remove();
//         }, 0)
//     });

//     // sendMessageTo(message, phoneNumber)

// }






