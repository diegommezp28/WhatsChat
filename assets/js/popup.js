let csv_text = document.getElementById("csv_text");
let csv_file = document.getElementById("csv_file");
let send_button = document.getElementById("send_button");
let message_template = document.getElementById("message");
let message_preview = document.getElementById("message_preview");

csv_file.addEventListener("change", handleFileSelect);
message_template.addEventListener("input", handleTemplateChange);
send_button.addEventListener("click", handleMessageSubmit);

async function handleMessageSubmit() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let messageTemplate = message_template.value;
    let contacts_csv = csv_text.value;

    let csvList = csvToArray(contacts_csv);

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
        csv_file.value = null;
    };
    reader.readAsText(file);

}

async function handleTemplateChange(evt) {
    let template = evt.target.value;
    chrome.storage.sync.get(['csvList'], (result) => {
        let csvList = result.csvList;
        let fields = csvList[0];
        let formattedTemplate = formatMessage(template, fields);
        message_preview.value = formattedTemplate;


    });
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

function formatMessage(messageTemplate, fields) {

    let formattedMessage = messageTemplate;

    if (fields && formattedMessage) {
        let name = capitalizeFirstLetter(fields[0]);
        formattedMessage = formattedMessage.replace(`[name]`, name.trim());

        for (let i = 1; i < fields.length; i++) {
            formattedMessage = formattedMessage.replace(`[col${i + 1}]`, fields[i].trim())
        }
    }
    return formattedMessage;

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}








