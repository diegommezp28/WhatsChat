// This is the code that will actually send the given template to 
// the specified contacts on the csv input file

/**
 * 
 * @param {*} message 
 * @param {*} number 
 */
function sendMessageTo(number, message) {
    let numberLink = document.createElement("a");
    numberLink.id = "number_link";
    document.body.append(numberLink);
    numberLink.setAttribute("href", `https://api.whatsapp.com/send?phone=${number}&text=`)

    setTimeout(() => numberLink.click(), () => {
        numberLink.remove();
    }, 0)

}


function formatMessage(messageTemplate, fields) {

}

//input field for template
//input field to upload csv
// Format message (validate csv, validate numbers, replace fields),
// find text box, edit text box, send message, wait a little bit, repeat
//Message preview
//css
//Attach files, add caption
// emojis, text style)
//Stats and % of succesfully sent messages

//Release