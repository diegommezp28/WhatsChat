let csv_text = document.getElementById("csv_text");
let csv_file = document.getElementById("csv_file");
let send_button = document.getElementById("send_button");
let message_template = document.getElementById("message");
let message_preview = document.getElementById("message_preview");
let add_msg_button = document.getElementById("add_msg_button");
let input_max_time = document.getElementById("input_max_time");
let progress_bar = document.getElementById("progress_bar");
let progress_text = document.getElementById("progress_text");


csv_file.addEventListener("change", handleFileSelect);
csv_text.addEventListener("input", handleCsvTextChange);
send_button.addEventListener("click", handleMessageSubmit);
message_template.addEventListener("input", handleTemplateChange);
add_msg_button.addEventListener("click", handleAddMessage);
// console.log("hola");
// debugger;

// Handles progress bar info
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request)
        if (request.id === "progress") {
            progress_bar.max = request.total;
            progress_bar.value = request.progress;
            progress_text.innerText = `${request.numProgress}/${request.totalNum} Numbers Messaged`;

        }
    }
);

(async () => {
    const src = chrome.runtime.getURL('assets/js/vanillaEmojiPicker.js');
    const contentScript = await import(src);
    const EmojiPicker = contentScript.EmojiPicker;
    new EmojiPicker({
        trigger: [
            {
                selector: '.emoji_picker_button',
                insertInto: ['#message'] // If there is only one '.selector', than it can be used without array
            }
        ],
        closeButton: true,
        specialButtons: 'green' // #008000, rgba(0, 128, 0);
    });
})();

function handleAddMessage(evt) {
    const MSG_SEPARATOR = "\n----------\n";
    message_template.value += MSG_SEPARATOR;
    // message_template.onchange();
    message_template.dispatchEvent(new Event('input'));
}


function handleFileSelect(evt) {
    let file = evt.target.files[0];

    let reader = new FileReader();

    reader.onload = function (event) {
        let text = event.target.result;
        chrome.storage.sync.set({ file: [file.name, text] });
        csv_text.value = text;
        console.log(text);
        let csvList = csvToArray(text);
        // TODO: add warning in case parsing fails
        chrome.storage.sync.set({ csvList });
        csv_file.value = null;
    };
    reader.readAsText(file);

}

function handleCsvTextChange(evt) {
    let contacts_csv = evt.target.value;
    let template = message_template.value;
    let csvList = csvToArray(contacts_csv);
    let fields = csvList[0];
    let formattedTemplate = formatMessage(template, fields);
    message_preview.value = formattedTemplate;
}

async function handleMessageSubmit() {
    console.log("Submit pressed")
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let messageTemplate = message_template.value;
    let contacts_csv = csv_text.value;
    let maxValue = isNaN(input_max_time.value) ? 5 : parseInt(input_max_time.value);
    let checkedMax = Math.min(Math.max(maxValue, 1), 15) //Just accepts values bewteen 1 and 15 secs

    let csvList = csvToArray(contacts_csv);

    chrome.storage.sync.set({ messageTemplate });
    chrome.storage.sync.set({ csvList });
    chrome.storage.sync.set({ checkedMax });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["assets/js/inject.js"]
    });
}


async function handleTemplateChange(evt) {
    let template = evt.target.value;
    let contacts_csv = csv_text.value;
    let csvList = csvToArray(contacts_csv);
    let fields = csvList[0];
    let formattedTemplate = formatMessage(template, fields);
    message_preview.value = formattedTemplate;
}

function csvToArray(str, delimiter = ',', header = false) {

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.split("\n");

    // split values from each row into an array
    const arr = [];
    for (let i = 0; i < rows.length; i++) {
        arr.push(rows[i].split(delimiter));
    }
    // TODO: add warning if parsing fails
    return arr;

}

function formatMessage(messageTemplate, fields) {

    let formattedMessage = messageTemplate;

    if (fields && formattedMessage) {
        let name = capitalizeFirstLetter(fields[0]);
        formattedMessage = formattedMessage.replace(`[name]`, name.trim());

        for (let i = 0; i < fields.length; i++) {
            formattedMessage = formattedMessage.replace(`[col${i + 1}]`, fields[i].trim())
        }
    }
    return formattedMessage;

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}