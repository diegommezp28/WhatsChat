// This is the code that will actually send the given template to 
// the specified contacts on the csv input file

async function sleep(ms = 1000) { return new Promise(resolve => setTimeout(resolve, ms)) };

/**
 * 
 * @param {*} message 
 * @param {*} number 
 */
async function sendMessageTo(number, message, inplace = false) {
    if (inplace) {
        // conversation-compose-box-input
        text_box = document.querySelector('[data-testid="conversation-compose-box-input"]');
        text_box.focus();
        document.execCommand("insertText", false, message);
    }
    else {
        // console.log(message);


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
            // console.log(sendButton);
            if (sendButton) {
                sendButton.click();
                await sleep(500);
            }

        }
        else {
            wrongNumberButton.click();
            await sleep(500);

        }
    }

}

function sendProgress(prog, total, numProgress, totalNum) {
    // console.log(`Progress: ${prog}`)
    chrome.runtime.sendMessage({
        id: "progress", progress: prog, total: total,
        numProgress: numProgress, totalNum: totalNum
    },
        () => { });
}

async function sendAllMessages(messageTemplate, csvList) {
    // console.log(messageTemplate.split(/\n?[-]{5,}\n?/))
    let messages = messageTemplate.split(/\n?[-]{5,}\n?/)
    sendProgress(0, csvList.length * messages.length, 0, csvList.length);

    for (let i = 0; i < csvList.length; i++) {
        // console.log(csvList[i]);
        let number = csvList[i][1];
        if (number) {
            for (let j = 0; j < messages.length; j++) {
                let message = messages[j];
                let inplace = j > 0; //Tiene que ser es el primero distinto de vacío
                if (message.trim()) {
                    await sendMessageTo(number.trim(), formatMessage(message, csvList[i]));
                    chrome.storage.sync.get(['checkedMax'], async (result) => {
                        let checkedMax = result.checkedMax;
                        // console.log(checkedMax);
                        let msToWait = (Math.random()) * ((checkedMax - 1) * 1000) + 1000;
                        // console.log(`ms to wait ${msToWait}`)
                        await sleep(msToWait);
                    });
                }
                sendProgress(i * messages.length + j + 1, csvList.length * messages.length, i + 1, csvList.length);
            }
        }
        else {
            sendProgress((i + 1) * messages.length, csvList.length * messages.length, i + 1, csvList.length);
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

chrome.storage.sync.get(['csvList'], (result) => {
    let csvList = result.csvList;
    // console.log(csvList)
    chrome.storage.sync.get(['messageTemplate'], (result) => {
        let messageTemplate = result.messageTemplate;
        // console.log(messageTemplate);
        sendAllMessages(messageTemplate, csvList)
    });
});