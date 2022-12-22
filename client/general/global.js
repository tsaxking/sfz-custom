const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const week = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const interactEvents = [
    'mouseover',
    'mousemove',
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousewheel',
    'mouseout',
    'contextmenu',
    'keydown',
    'keypress',
    'keyup',
    'touchstart',
    'touchend',
    'touchmove',
    'touchcancel'
];

// convert into camelCase
const camelCase = (str) => {
    // remove all spaces at the beginning of string
    str = str.replace(/^\s+/, '');
    str = str.replace(/\s(.)/g, function($1) { return $1.toUpperCase(); }).replace(/\s/g, '');

    // remove all hyphens and underscores, then capitalize the first letter of each word
    str = str.replace(/[-_](.)/g, function($1) { return $1.toUpperCase(); }).replace(/[-_]/g, '');

    return str;
}

const abbreviate = (str, length = 5) => {
    let newStr = str.slice(0, length);
    return newStr.length === str.length ? newStr : newStr + '...';
}

/**
 * 
 * @param {Date} date Target date object
 * @param {HTMLElement} element Target element to append the date to
 * @param {String} endMessage (OPTIONAL) Message to append to the end of the date
 * @returns {Object} Interval object
 */
function countdownToDate(date, element, endMessage) {
    // set interval to update the countdown
    let cdInterval = setInterval(() => {
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        element.innerHTML = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

        if (diff < 0) {
            clearInterval(cdInterval);
            element.innerHTML = endMessage ? endMessage : 'Countdown finished';
        }
    }, 1000);

    return cdInterval;
}

function convertDateStrToObj(str) {
    // input is "2022-08-22"
    const dateArr = str.split('-');
    return new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
}


const sleep = async(n) => {
    // sleep for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000 * n));
    return 'done';
};


const convertObjToCamelCase = (obj) => {
    try {
        JSON.stringify(obj);
    } catch {
        console.error('Cannot convert to camel case due to circular reference');
        return obj;
    }

    // convert json string to camel case using regex
    // only convert keys
    // if value is object, convert recursively

    if (Array.isArray(obj)) return obj.map(convertObjToCamelCase);

    if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                newObj[convertObjToCamelCase(key)] = convertObjToCamelCase(obj[key]);
            } else {
                newObj[convertObjToCamelCase(key)] = obj[key];
            }
        }
        return newObj;
    } else {
        return obj.replace(/(_[a-z])/g, (match) => {
            return match[1].toUpperCase();
        });
    }
}

const convertFromCamelCase = (str) => {
    return str.replace(/([A-Z])/g, (match) => {
        return ` ${match[0]}`;
    }).trim();
}