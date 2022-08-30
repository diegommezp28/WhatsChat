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
    await sleep(2000);
    numberLink.remove();

    let wrongNumberButton = document.querySelector('[data-testid="popup-controls-ok"]');
    if (!wrongNumberButton) {
        let sendButton = document.querySelector('[data-testid="compose-btn-send"]');
        console.log(sendButton);
        sendButton.click();
        await sleep(500);
    }
    else {
        wrongNumberButton.click();
        await sleep(500);

    }

}

async function sendAllMessages(messageTemplate, csvList) {

    for (let i = 0; i < csvList.length; i++) {
        console.log(csvList[i]);
        let number = csvList[i][1];
        if (number) {
            await sendMessageTo(number.trim(), formatMessage(messageTemplate, csvList[i]));
        }


    }

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

//input field for template -->
//input field to upload csv -->
// Format message (validate csv, ?
// replace fields),  --->
// validate numbers, 
// If number is wrong act upon it -->
// find text box, edit text box, send message, wait a little bit, repeat --->
//Message preview --->
//Ranom time between sending
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