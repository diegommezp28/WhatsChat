// This is the code that will actually send the given template to 
// the specified contacts on the csv input file

async function sleep(ms = 1000) { return new Promise(resolve => setTimeout(resolve, ms)) };

/**
 * 
 * @param {*} message 
 * @param {*} number 
 */
async function sendMessageTo(number, message) {
    let numberLink = document.createElement("a");
    numberLink.id = "number_link";
    document.body.append(numberLink);
    numberLink.setAttribute("href", `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`)
    numberLink.click()
    await sleep(3000);
    let sendButton = document.querySelector('[data-testid="compose-btn-send"]');
    console.log(sendButton);
    sendButton.click();
    await sleep(500);

}

async function sendAllMessages(messageTemplate, csvList) {
    // let firstNumber = csvList[0][1];
    // sendMessageTo(firstNumber, formatMessage(messageTemplate, csvList[0]));

    for (let i = 0; i < csvList.length; i++) {
        let number = csvList[i][1];
        let name = csvList[i][0];

        await sendMessageTo(number, formatMessage(messageTemplate, csvList[i]));


    }

}


function formatMessage(messageTemplate, fields) {
    return messageTemplate;

}

//input field for template -->
//input field to upload csv -->
// Format message (validate csv, validate numbers, replace fields),
// find text box, edit text box, send message, wait a little bit, repeat
//Message preview
//css
//Attach files, add caption
// emojis, text style)
//Stats and % of succesfully sent messages

//Release

// let messageTemplate = chrome.storage.sync.get({ messageTemplate });
chrome.storage.sync.get(['csvList'], (result) => {
    let csvList = result.csvList;
    console.log(csvList)
    chrome.storage.sync.get(['messageTemplate'], (result) => {
        let messageTemplate = result.messageTemplate;
        console.log(messageTemplate);
        sendAllMessages(messageTemplate, csvList)
    });
});