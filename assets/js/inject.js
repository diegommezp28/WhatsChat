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
        console.log(message);


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
            if (sendButton) {
                sendButton.click();
                await sleep(500);
            }

            // // Take this with a giant grain of salt
            // let clip = document.querySelector('[data-testid="conversation-clip"]');
            // clip.children[0].click();
            // await sleep(300);
            // let inputDiv = document.querySelector('[data-testid="attach-document"]').nextSibling;
            // chrome.storage.sync.get(['file'], async (result) => {
            //     let fileList = result.file;
            //     let file = new File([fileList[1]], fileList[0], { type: 'text/plain' })
            //     console.log(typeof file);
            //     // console.log(file);
            //     const dataTransfer = new DataTransfer();
            //     dataTransfer.items.add(file)
            //     inputDiv.files = dataTransfer.files

            //     await sleep(5000);
            //     let inputs = document.getElementsByTagName("input");
            //     for (let i = 0; i < inputs.length; i++) {
            //         console.log(inputs[i].files);
            //     }


            // });

        }
        else {
            wrongNumberButton.click();
            await sleep(500);

        }
    }

}

async function sendAllMessages(messageTemplate, csvList) {
    console.log(messageTemplate.split(/\n?----------\n?/))

    for (let i = 0; i < csvList.length; i++) {
        console.log(csvList[i]);
        let number = csvList[i][1];
        if (number) {
            let messages = messageTemplate.split(/\n?----------\n?/)
            for (let j = 0; j < messages.length; j++) {
                let message = messages[j];
                let inplace = j > 0; //Tiene que ser es el primero distinto de vacío
                if (message.trim()) {
                    await sendMessageTo(number.trim(), formatMessage(message, csvList[i]));
                    await sleep((Math.random() + 1) * 5000);
                }
            }
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

// Number without WhatsApp, +573022371078, 23
// invalid phone number, +57310341, 22
// lenny, +573106882967, 21
// valentina, +573103414225, 22
// diego, +573022371079, 22
// Number without WhatsApp, +573022371078, 23
// invalid phone number, +57310341, 22
// lenny, +573106882967, 21
// valentina, +573103414225, 22

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