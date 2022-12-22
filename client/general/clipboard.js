/**
 * 
 * @param {String} text text to copy into clipboard 
 * @param {Boolean} notify whether or not to notify the user that the text was copied
 */
function copyText(text, notify = false) {
    navigator.clipboard.writeText(text);
    if (notify) createNotification('Clipboard', `Copied text: ${text}`, 'success');
}