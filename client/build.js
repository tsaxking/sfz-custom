
function showElement(el) {
    el.classList.remove('d-none');
    // el.classList.add('d-block');
}

function hideElement(el) {
    // el.classList.remove('d-block');
    el.classList.add('d-none');
}

function isHidden(el) {
    return el.classList.contains('d-none');
}

function cloak(el) {
    el.classList.add('invisible');
    el.classList.remove('visible');
}

function deCloak(el) {
    el.classList.remove('invisible');
    el.classList.add('visible');
}

// Turns html string into html object
function createElementFromText(str) {
    let div = document.createElement('div');
    div.innerHTML = str;
    return div.children[0];
}

function addAlpha(color, opacity) {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

function hexToRgbA(hex, opacity) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `${opacity ? opacity : 1})`;
    }
    throw new Error('Bad Hex');
}

function randomHex() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomRGB(opacity) {
    var o = Math.round,
        r = Math.random,
        s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + (opacity ? opacity : 1) + ')';
}

function changeRGBAOpacity(color, opacity) {
    if (typeof opacity != 'number') throw new Error('Type of opacity is not a number, type is: ' + typeof opacity);
    if (opacity < 0 || opacity > 1) throw new Error('Opacity is not between 0 and 1, value is: ' + opacity);

    let colorArr = color.split(',');
    colorArr[3] = opacity + ')';
    return colorArr.join(',');
}

function detectRGBContrast(colors) {
    const threshold = ((256 + 256 + 256) / colors.length) > 50 ? 50 : ((256 + 256 + 256) / colors.length);
    return colors.some((color, index, array) => {
        const [r, g, b] = color;
        let test = array.filter((testColor, testIndex) => {
            if (testIndex === index) return false;

            const [testR, testG, testB] = testColor;

            let rDist = Math.abs(testR - r);
            let gDist = Math.abs(testB - b);
            let bDist = Math.abs(testG - g);

            let close = (rDist + gDist + bDist) < threshold;

            return close;
        });
        return test.length != 0;
    });
}

function getUniqueRGB(colors) {
    if (colors.length == 0) return randomRGB();
    let color, _colors;
    do {
        color = randomRGB();
        let [r, g, b] = color.split(',');

        r = r.slice(5, r.length);

        _colors = colors.map(c => {
            let [_r, _g, _b] = c.split(',');

            _r = _r.slice(5, _r.length);
            return [Number(_r), Number(_g), Number(_b)];
        });

        _colors.push([
            Number(r),
            Number(g),
            Number(b)
        ]);
    } while (detectRGBContrast(_colors));

    return color;
}

function createElementFromSelector(selector) {
    var pattern = /^(.*?)(?:#(.*?))?(?:\.(.*?))?(?:@(.*?)(?:=(.*?))?)?$/;
    var matches = selector.match(pattern);
    var element = document.createElement(matches[1] || 'div');
    if (matches[2]) element.id = matches[2];
    if (matches[3]) {
        matches[3].split('.').forEach(c => {
            element.classList.add(c);
        });
    }
    if (matches[4]) element.setAttribute(matches[4], matches[5] || '');
    return element;
}


function createCheckbox(id, value, classList, name, checked, func) {
    let formCheck = document.createElement('div');
    formCheck.classList.add('form-check');
    formCheck.classList.add('ws-nowrap');

    let input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.value = value;
    input.id = id;
    if (classList) classList.forEach(c => {
        input.classList.add(c);
    });

    input.checked = checked;

    if (func) input.addEventListener('change', func);


    formCheck.appendChild(input);

    if (name) {
        let label = document.createElement('label');
        label.classList.add('form-check-label');
        label.classList.add('ps-2');
        label.innerText = name;
        formCheck.appendChild(label);
    }

    return formCheck;
}


function createContextMenu(el, sections, options) {
    // remove previous event listeners

    let ignoreFrom;
    if (options) ignoreFrom = options.ignoreFrom;

    const createSections = (e) => {
        let ignoreEls = [];
        if (Array.isArray(ignoreFrom)) {
            ignoreFrom.forEach(i => {
                el.querySelectorAll(i).forEach(_e => {
                    ignoreEls.push(_e);
                });
            });
            // return if the element is in the ignore list or is a child of one of the ignore list elements.
            if (ignoreEls.some(i => i.contains(e.target))) {
                // console.log('Ignoring right click');
                return;
            }
        }

        e.preventDefault();
        const contextmenuContainer = document.querySelector('#contextmenu-container');

        const menu = document.querySelector('#contextmenu');
        menu.innerHTML = '';

        sections.forEach(section => {
            const { name, items } = section;
            // const sectionEl = document.createElement('li');
            const sectionTitle = createElementFromSelector('p.ws-nowrap.bg-dark.text-secondary.p-1.rounded.m-0.no-select');
            sectionTitle.innerHTML = name;
            // sectionEl.appendChild(sectionTitle);
            menu.appendChild(sectionTitle);

            // const sectionDivider = document.createElement('li');
            const sectionDividerEl = createElementFromSelector('hr.dropdown-divider.bg-light.m-0');
            // sectionDivider.appendChild(sectionDividerEl);
            menu.appendChild(sectionDividerEl);

            items.forEach(item => {
                const { name, func, color } = item;
                // const itemEl = document.createElement('li');
                const itemElLink = createElementFromSelector('p.ws-nowrap.cursor-pointer.bg-dark.text-light.m-0.p-1.rounded');

                itemElLink.addEventListener('mouseover', () => {
                    itemElLink.classList.remove('bg-dark');
                    itemElLink.classList.add(`bg-${color ? color : 'primary'}`);
                });
                itemElLink.addEventListener('mouseout', () => {
                    itemElLink.classList.remove(`bg-${color ? color : 'primary'}`);
                    itemElLink.classList.add('bg-dark');
                });

                itemElLink.innerHTML = name;
                itemElLink.addEventListener('click', func);
                // itemEl.appendChild(itemElLink);
                menu.appendChild(itemElLink);
            });
        });

        const { clientX: mouseX, clientY: mouseY } = e;
        contextmenuContainer.style.left = mouseX + 'px';
        contextmenuContainer.style.top = mouseY + 'px';
        showElement(contextmenuContainer);

        const removeMenu = (evt) => {
            if (evt.target == el) return;
            hideElement(contextmenuContainer);
            menu.innerHTML = '';
            document.removeEventListener('click', removeMenu);
            // document.removeEventListener('contextmenu', removeMenu);
        }

        document.addEventListener('click', removeMenu);
        // document.addEventListener('contextmenu', removeMenu);
    }

    el.removeEventListener('contextmenu', createSections);
    el.addEventListener('contextmenu', createSections);
}

function getAllParentElements(el) {
    let parents = [];
    let parent = el.parentElement;
    while (parent) {
        parents.push(parent);
        parent = parent.parentElement;
    }
    return parents;
}


function isShown(el) {
    const rect = el.getBoundingClientRect();

    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}
// // Data url:
// // Get a reference to the file input
// const fileInput = document.querySelector('input#thing');

// // Listen for the change event so we can capture the file
// fileInput.addEventListener('change', (e) => {
//     // Get a reference to the file
//     const file = e.target.files[0];

//     // Encode the file using the FileReader API
//     const reader = new FileReader();
//     reader.onloadend = () => {
//         console.log(reader.result);
//         // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
//     };
//     reader.readAsDataURL(file);
// });

// function fileUploadToDataUrl(input) {
//     // Get a reference to the file
//     const file = input.files[0];

//     // Encode the file using the FileReader API
//     const reader = new FileReader();
//     reader.onloadend = () => {
//         console.log(reader.result);
//         // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
//     };
//     reader.readAsDataURL(file);
// }





// FileReader:

function fileUpload(file, cb, cbError) {
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(evt) {
            if (cb) cb(evt);
            // document.getElementById("fileContents").innerHTML = evt.target.result;
        }
        reader.onerror = function(evt) {
            console.log('Error reading file');
            if (cbError) cbError(evt);
            // document.getElementById("fileContents").innerHTML = "error reading file";
        }
    }
}

/**
 * 
 * @param {Element} input File input element 
 * @param {Function} callback Function to call when file is loaded 
 * @param {Array} accept Array of accepted file types ['pdf','png','jpg']
 * @param {Function} unacceptableCb (optional) Function to call when file is unacceptable, else it will create an alert
 */
function readMultipleFiles(input, callback, accept, unacceptableCb) {
    if (!input.querySelector) throw new Error('input must be a node!');
    if (!callback) throw new Error('readMultipleFiles requires a callback!');

    const { files } = input;

    var reader = new FileReader();
    let fileBin = [];

    const readFile = (index) => {
        const file = files[index];

        if (index >= files.length) {
            callback(fileBin);
            return;
        }

        const splitName = file.name.split('.');
        const ext = splitName[splitName.length - 1];
        if (!accept.find(a => a.toLowerCase() == ext.toLowerCase())) {
            if (unacceptableCb) unacceptableCb(file, index);
            else alert('File type not accepted!');
            return;
        }

        reader.onloadend = (e) => {
            // get file content
            fileBin.push({
                filename: file.name,
                data: e.target.result,
                extension: ext
            });
            readFile(index + 1);
        }
        reader.readAsBinaryString(file);
    }
    readFile(0);
}

async function readFiles(input, accept = []) {
    if (!input.querySelector) throw new Error('input must be a node!');
    const { files } = input;

    var reader = new FileReader();
    return await Promise.all(Array.from(files).map(async(file) => {
        const splitName = file.name.split('.');
        const ext = splitName[splitName.length - 1];
        if (!accept.find(a => a.toLowerCase() == ext.toLowerCase())) {
            alert('File type not accepted!');
            return;
        }

        return await new Promise((resolve, reject) => {
            let bin;
            reader.onloadend = (e) => {
                // get file content
                bin = {
                    filename: file.name,
                    data: e.target.result,
                    extension: ext
                }

                resolve(bin);
            }
            reader.readAsBinaryString(file);
        });
    }));
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (parseFloat((bytes / Math.pow(k, i)).toFixed(dm))) + ' ' + sizes[i];
}

function viewImageFromFileUpload(input, target) {
    if (input.files.length > 0) {
        var reader = new FileReader();

        reader.onload = function(e) {
            target.setAttribute('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.elements = [];
        this.animating = false;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    add(element) {
        this.elements.push(element);
    }

    remove(element) {
        this.elements.splice(this.elements.indexOf(element), 1);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    draw() {
        this.clear();
        this.elements.forEach(element => {
            element.draw(this.ctx);
        });
    }

    animate() {
        this.animating = true;
        this.draw();
        if (this.animating) requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        this.animating = false;
    }
}
const initNotifications = () => {
    // VVVVVVVVV Creates notification container VVVVVVVVV
    let notificationEl = document.createElement('div');
    notificationEl.setAttribute('aria-live', 'polite');
    notificationEl.setAttribute('aria-atomic', 'true');
    notificationEl.style.minWidth = 'min-content';
    notificationEl.style.minHeight = 'min-content';
    notificationEl.style.position = 'fixed';
    notificationEl.style.top = '64px';
    notificationEl.style.right = '12px';
    notificationEl.classList.add('text-light');

    let innerNotificationEl = document.createElement('div');
    innerNotificationEl.style.position = 'absolute';
    innerNotificationEl.style.top = '0';
    innerNotificationEl.style.right = '0';
    innerNotificationEl.id = 'notifications';

    notificationEl.appendChild(innerNotificationEl);

    document.querySelector('main').appendChild(notificationEl);
}

let numNotifs = 0;

// Makes toast
function createNotificationEl(title, msg, color) {
    let toast = document.createElement('div');
    toast.classList.add('toast');
    toast.classList.add(`bg-${color}`);
    toast.classList.add('notification');
    toast.id = 'notification-' + numNotifs;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    let header = document.createElement('div');
    header.classList.add('toast-header');
    header.classList.add('bg-dark');
    header.classList.add('d-flex');
    header.classList.add('justify-content-between');

    let strong = document.createElement('strong');
    strong.classList.add('mr-auto');
    strong.classList.add(`text-${color}`);
    strong.innerText = title ? title : 'sfzMusic';
    header.appendChild(strong);

    let small = document.createElement('small');
    small.classList.add('text-muted');
    small.innerText = (new Date(Date.now())).toDateString();
    header.appendChild(small);

    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('ml-2');
    button.classList.add('mb-1');
    button.classList.add('bg-dark');
    button.classList.add('border-0');
    button.classList.add('text-light');
    button.setAttribute('data-dismiss', 'toast');


    let span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '&times;';
    button.appendChild(span);
    header.appendChild(button);
    toast.appendChild(header);

    let body = document.createElement('div');
    body.classList.add('toast-body');
    body.innerText = msg;
    toast.appendChild(body);

    return toast;
}

/**
 * 
 * @param {String} title title, defaults to 'sfzMusic'
 * @param {String} msg content of body
 * @param {String} color bs color
 * @param {Number} length in seconds 
 */
function createNotification(title, msg, color, length) {
    let notification = createNotificationEl(title, msg, color);

    let removed = false;
    const timeout = setTimeout(() => {
        removed = true;
        removeNotification(notification);
    }, length ? length * 1000 : 1000 * 5);

    notification.querySelector('button').addEventListener('click', () => {
        if (!removed) {
            removeNotification(notification);
            clearTimeout(timeout);
        }
    });

    document.querySelector('#notifications').appendChild(notification);

    // Shows toast using bs api
    $(`#notification-${numNotifs}`).toast({
        animation: true,
        autohide: true,
        delay: length ? length * 1000 : 1000 * 5
    });
    $(`#notification-${numNotifs}`).toast('show');
    $(`#${notification.id}`).on('hidden.bs.toast', () => {
        notification.remove();
    });
    numNotifs++;
}

function removeNotification(notification) {
    $(`#${notification.id}`).toast('hide');
}

function pushNotification(title, message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        // alert("This browser does not support desktop notification");
        return;
    }
    // Let's check if the user is okay to get some notification
    if (window.Notification.permission === "granted") {
        // If it's okay let's create a notification
        var options = {
            body: message,
            dir: "ltr"
        };
        var notification = new window.Notification(title ? title : "sfzMusic", options);
        console.log(notification);
        return;
    }
    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            // Whatever the user answers, we make sure we store the information
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
            // If the user is okay, let's create a notification
            if (permission === "granted") {
                var options = {
                    body: message,
                    dir: "ltr"
                };
                var notification = new Notification(title ? title : "sfzMusic", options);
            }
        });
        return;
    }

    alert(`${title ? title : "sfzMusic"}: ${message}`);

    // At last, if the user already denied any notification, and you
    // want to be respectful there is no need to bother them anymore.
}
let currentPage;
class Page {
    constructor(link, main = async() => {
        console.log('No main function defined for this page');
        return async() => {
            console.log('No leave function defined for this page');
        };
    }) {
        if (typeof main === 'function') this.main = main;
        else throw new Error('main must be a function');

        // main must be async
        if (!this.main.constructor.name === 'AsyncFunction') throw new Error('main must be async');

        // set all object properties from link
        Object.keys(link).forEach(key => {
            this[key] = link[key];
        });

        // offcanvas link
        this.link = document.querySelector(`.nav-link[href="${this.pathname}"]`);

        // sets link click event
        this.link.addEventListener('click', async(e) => {
            e.preventDefault();
            this.load();
        });

        // page element
        this.html = document.querySelector(`.page#${this.lowercaseTitle}`);


        this.querySelector = this.html.querySelector.bind(this.html);
        this.querySelectorAll = this.html.querySelectorAll.bind(this.html);
    }

    load(pushState = true) {
        if (currentPage) currentPage.leave({
            page: currentPage,
            html: currentPage.html
        });
        this.setInfo(); // sets page info
        this.open(); // opens page and sets link to active
        window.scrollTo(0, 0); // scrolls to top
        navigateTo(this.link.href, pushState, false); // adds page to history
        currentPage = this;
        const leave = this.main({
            page: this,
            html: this.html
        }); // runs main function
        if (typeof leave === 'function') this.leave = leave;
        else this.leave = async() => {
            console.log('No leave function defined for this page');
        }
    }

    setInfo() {
        const { name, keywords, description, screenInfo } = this;

        // sets background color
        if (previousMainColor) document.querySelector('body').classList.remove(`bg-${previousMainColor}`)
        document.querySelector('body').classList.add(`bg-${screenInfo.color}`);
        previousMainColor = screenInfo.color;

        // sets page information
        document.title = 'sfzMusic: ' + titlePrefix + ' ' + name;

        try {
            document.querySelector('[name="keywords"]').setAttribute('content', keywords.toString());
            document.querySelector('[name="description"]').setAttribute('content', description);
        } catch {}
    }

    open() {
        // hide all pages
        document.querySelectorAll('.page').forEach(el => {
            hideElement(el);
        });

        showElement(this.html);

        // deactivate all links
        document.querySelectorAll('.nav-link').forEach(_l => {
            _l.classList.remove('active');
        });

        // activate this link
        this.link.classList.add('active');

        // if mobile, close sidebar
        $('#side-bar-nav').offcanvas('hide');

        // scroll to top
        window.scrollTo(0, 0);
    }

    notify(message, type = 'info') {
        createNotification(this.name, message, type);
    }
}



function navigateTo(url, pushState, reload) {
    if (!setPathname) return;
    if (url == location.pathname && !reload) return; // if already on page or reloading, do nothing
    if (pushState) history.pushState({}, '', url); // add page to history
}


window.addEventListener('popstate', (e) => {
    e.preventDefault();
    openPage(location.pathname, false); // open page from history
});

function openPage(url, pushState = true) {
    const page = pageList.find(p => p.pathname == url);
    if (page) page.load(pushState);
}
window.scrollTo(0, 0);

const initPages = () => {

    let pageList,
        allPages = {},
        setPathname,
        titlePrefix = '';
    let previousMainColor;
    document.addEventListener('DOMContentLoaded', async() => {
        const currentPageSrc = document.querySelector('#current-page-src');

        let requestUrl;

        switch (currentPageSrc.dataset.link) {
            case 'home':
                requestUrl = '/get-links';
                setPathname = true;
                break;
            case 'student-portal':
                requestUrl = '/class/get-links';
                setPathname = false;
                titlePrefix = 'Student Portal -';
                break;
        }

        currentPageSrc.remove();

        pageList = await requestFromServer({
            url: requestUrl,
            method: 'POST'
        });

        pageList = pageList.map(l => {
            let p;
            try {
                // console.log('mainFunction: ', l.name.replace(new RegExp(' ', 'g'), ''));
                p = new Page(l, mainFunctions[l.name.replace(new RegExp(' ', 'g'), '')]);
            } catch (e) {
                return;
            }
            allPages[p.pathname.replace(new RegExp('/', 'g'), '-').split('-').join('')] = p;

            return p;
        }).filter(p => p);

        const page = pageList.find(p => p.pathname == location.pathname);

        if (page) page.load();
        else pageList[0].load();

        try { // if no loading screen, don't do this
            // loading screen
            const loadingScreen = document.querySelector('#loading-page');
            // add animations
            loadingScreen.classList.add('animate__animated');
            loadingScreen.classList.add('animate__fadeOut');

            document.querySelectorAll('.animate-on-show').forEach(el => {
                el.classList.add('animate-hide');
            });

            await sleep(.2);
            document.querySelectorAll('.animate-on-show').forEach(async(el, i) => {
                let { animation } = el.dataset;

                if (!animation) animation = 'animate__fadeInUp';
                el.classList.remove('animate-hide');

                if (isShown(el) && !isHidden(el)) {
                    await sleep(i * .1);

                    el.classList.add('animate__animated');
                    el.classList.add(animation);

                    el.dataset.shown = true;
                    // el.classList.remove('animate-on-show');

                    el.addEventListener('animationend', () => {
                        el.classList.remove('animate__animated');
                        el.classList.remove(animation);
                    });
                }
            });

            // remove loading screen after animation
            loadingScreen.addEventListener('animationend', () => {
                loadingScreen.remove();

                window.addEventListener('scroll', () => {
                    currentPage.querySelectorAll('.animate-on-show').forEach(async(el, i) => {
                        let { animation } = el.dataset;

                        if (!animation) animation = 'animate__fadeInUp';
                        el.classList.remove('animate-hide');

                        const animated = el.dataset.shown == 'true';

                        if (isShown(el) && !isHidden(el) && !animated) {
                            await sleep(i * .1);

                            el.classList.add('animate__animated');
                            el.classList.add(animation);
                            // el.classList.remove('animate-on-show');

                            el.addEventListener('animationend', () => {
                                el.classList.remove('animate__animated');
                                el.classList.remove(animation);
                            });
                        }
                    });
                });
            });
        } catch {}
    });
}
/**
 * @description Creates a table from an element, headers, and data. You can add in event listeners if you like! Fully customizable
 * @param {Element} table Table Element
 * @param {Array} headers Header: {title: 'String', getData: (rowData) => {how to get content to place into <td></td>}, listeners: (OPTIONAL) [{type: 'listener type', action: (rowData) => {what to do on listener}}]
 * @param {Array} data Each item is a row, structure it how you like. getData(data[n]) and action(data[n]) use this
 * @param {Object} options (optional) see below
 * 
 * @returns {Table} Table Object
 * 
 * @example
 *  ```javascript
 *  const tableOptions = {
 *      appendTest: (row) => {}, // function: must return a boolean, if true, will append the tr to the table. Parameter is the row
 *      trListeners: [], // array of objects: {type: 'listener type', action: ({ row, tr, event }) => { // what to do on listener}}
 *      trAttributes: [], // array of objects: {type: 'attribute type', value: (row) => { function to get attribute }}
 *      dataTable: false, // boolean: if true, will create a data table using jquery dataTable, this requires the table to have an id
 *      colGroup: [], // array of objects: { index: 0, classes: ['class'] }
 *      trClassTests: [], // array of objects: { test: (row) => { function to test row }, value: 'class' }
 *      evenColumns: false, // boolean: if true, will make all columns the same width
 *      trClasses: [], // array of strings: ['class1', 'class2']
 *      onEdit: (row, column, newValue) => {} // function: what to do when a row is edited, this will make the table a spreadsheet. DO NOT USE WITH ANY OTHER OPTION
 *  }
 *  ```
 */
function setTable(table, headers, data, options) {
    let appendTest = null,
        trListeners = [],
        trAttributes = [],
        dataTable = false,
        datatable = false,
        colGroup = null,
        trClassTests = [],
        evenColumns = null,
        trClasses = [],
        reorder = null,
        onEdit = null,
        editing = false,
        tooltips = false,
        tdTooltip = false;

    if (options) {
        appendTest = options.appendTest;
        onEdit = options.onEdit;
        editing = typeof onEdit == 'function';
        if (Array.isArray(options.trListeners)) trListeners = options.trListeners;
        if (Array.isArray(options.trAttributes)) trAttributes = options.trAttributes;
        dataTable = options.dataTable;
        datatable = options.datatable;
        if (Array.isArray(options.colGroup)) colGroup = options.colGroup;
        if (Array.isArray(options.trClassTests)) trClassTests = options.trClassTests;
        evenColumns = options.evenColumns;
        if (Array.isArray(options.trClasses)) trClasses = options.trClasses;
        reorder = options.reorder;
    }

    table.innerHTML = ''; // Clears the table

    let thead = document.createElement('thead'); // Creates headers div
    let tfoot = document.createElement('tfoot'); // Creates footers div

    let theadRow = document.createElement('tr'); // Creates headers row
    let tfootRow = document.createElement('tr'); // Creates footers row

    let footers = false; // boolean value to test if you want footers

    let numColumns = headers.length;

    if (reorder) {
        trClasses.push('tr-drag');
        trAttributes.push({
            attribute: 'data-swap',
            value: () => 'false'
        });
        trAttributes.push({
            attribute: 'draggable',
            value: () => 'true'
        });
        trAttributes.push({
            attribute: 'data-insert',
            value: (row) => false
        });
        if (!reorder.dragPosition || reorder.dragPosition == 'start') {
            headers.unshift({
                title: 'Drag',
                getData: () => {
                    return '<i class="material-icons">drag_indicator</i>';
                },
                classes: [
                    'table-drag',
                    'cursor-grab'
                ]
            });
        } else if (reorder.dragPosition == 'end') {
            headers.push({
                title: 'Drag',
                getData: () => {
                    return '<i class="material-icons">drag_indicator</i>';
                },
                classes: [
                    'table-drag',
                    'cursor-grab'
                ]
            });
        } else if (typeof reorder.dragPosition == 'number') {
            headers.splice(reorder.dragPosition, 0, {
                title: 'Drag',
                getData: () => {
                    return '<i class="material-icons">drag_indicator</i>';
                },
                classes: [
                    'table-drag',
                    'cursor-grab'
                ]
            });
        } else if (reorder.dragPosition = 'row') {
            trClasses.push('table-drag');
            trClasses.push('cursor-drag');
        }
    }

    headers.forEach(h => { // loops through headers
        if (!h) return;
        let th = document.createElement('th'); // Creates header element

        if (evenColumns) th.style.width = (1 / numColumns) * 100 + '%';

        if (typeof h.title == 'string') th.innerHTML = h.title;
        else th.appendChild(h.title);

        if (h.tooltip) {
            th.title = h.tooltip;
            tooltips = true;
        }

        th.classList.add('no-select');

        if (h.footer) { // if you want footers, use this!
            let tf = document.createElement('th'); // Creates header element for footer
            footers = true; // sets footers to true for later to prevent error

            if (evenColumns) th.style.width = (1 / numColumns) * 100 + '%';

            if (typeof h.title == 'string') tf.innerHTML = h.title;
            else tf.appendChild(h.title);

            tf.classList.add('no-select');

            tfootRow.appendChild(tf); // appends footer element into footer row
        }
        theadRow.appendChild(th); // appends header to header row
    });

    thead.appendChild(theadRow); // appends header row to header div
    table.appendChild(thead); // appends header div to table
    if (footers) tfoot.appendChild(tfootRow); // footer row to footer div

    if (!data || data.length == 0) return;
    let rowPos = 0;

    let tbody = document.createElement('tbody'); // initiates data body
    // resets data that passses appendTest (used for reorder)
    data.forEach(d => { // loops through data
        if (!d) return;
        d._rowPos = rowPos;
        try {
            if (appendTest) { // Do you want to have this row?
                if (!appendTest(d)) return;
            }
        } catch (err) {}
        let tr = document.createElement('tr'); // creates new row

        let colPos = 0;

        headers.forEach(h => { // loops through headers
            if (!h) return;
            let td = document.createElement('td'); // creates data element

            if (editing) {
                td.classList.add('table-light');
                td.classList.add('p-0');
                const input = createElementFromSelector('input.form-control.w-100.h-100');
                input.type = 'text';
                input.value = d[h.title];

                input.addEventListener('change', () => {
                    onEdit(d, h.title, input.value);
                });

                td.appendChild(input);
                tr.appendChild(td);
                return;
            }

            let _data = h.getData ? h.getData(d) : '-!@#$%^&*()';
            // console.log(_data);
            if (_data == '-!@#$%^&*()') td.innerHTML = d[h.title];
            else if (typeof _data == 'object' && _data) td.appendChild(_data); // calls header.getData() function to get content for this cell, if it doesn't exist, destructure the object
            else td.innerHTML = _data;

            if (Array.isArray(h.listeners)) h.listeners.forEach(l => { // if you want listeners for this column, sets them (can be several)
                td.addEventListener(l.type, (event) => l.action({ event, data: d, td })); // creates listener from listener.type ('click','mouseover','touchstart',etc.) and action() which passes in data from this row
            });

            td.dataset.colPos = colPos;
            td.dataset.rowPos = rowPos;
            td.dataset.header = h.title;

            // Sets td attributes
            if (Array.isArray(h.attributes)) h.attributes.forEach(att => {
                td.setAttribute(att.attribute, att.value);
            });

            if (Array.isArray(h.classes)) h.classes.forEach(c => {
                td.classList.add(c);
            });

            if (Array.isArray(colGroup)) {
                let colGCol = colGroup.find(c => c.index == colPos);
                if (colGCol) {
                    colGCol.classes.forEach(c => {
                        td.classList.add(c);
                    });
                }
            }

            if (Array.isArray(h.tdClasses)) {
                h.tdClasses.forEach(c => {
                    td.classList.add(c);
                });
            }
            try {
                if (h.tdTooltip) {
                    const tooltip = h.tdTooltip(d, h.title);
                    if (tooltip) {
                        td.title = tooltip;
                        tdTooltip = true;
                    }
                }
            } catch {}

            tr.appendChild(td); // appends data to row

            colPos++;
        });
        if (trListeners) trListeners.forEach(l => { // if you want listeners for the row itself, sets them (can be several)
            tr.addEventListener(l.type, (event) => l.action({ event, data: d, tr, row: d })) // creates listener from listener.type ('click','mouseover','touchstart',etc.) and action() which passes in data from this row
        });
        tr.dataset.rowPos = rowPos; // ads rowPos to tr

        // Adds tr attributes
        if (trAttributes) trAttributes.forEach(att => {
            tr.setAttribute(att.attribute, att.value(d));
        });

        if (trClassTests) {
            trClassTests.forEach(test => {
                if (test.test(d)) tr.classList.add(test.value);
            });
        }
        if (trClasses) {
            trClasses.forEach(c => {
                tr.classList.add(c);
            });
        }

        tbody.appendChild(tr); // appends row to data body
        rowPos++;
        return d;
    })
    table.appendChild(tbody); // appends data body to table
    if (footers) table.appendChild(tfoot); // appends footers to table

    // Makes dataTable
    if (dataTable || datatable) {
        $('#' + table.id).each((_, table) => {
            $(table).DataTable();
        });
    }

    // make bootstrap tooltips
    if (tooltips) {
        // select all th from table
        $('#' + table.id + ' th').tooltip();
    }

    if (tdTooltip) {
        // select all td from table
        $('#' + table.id + ' td').tooltip();
    }

    let renderedTable = getTableElements(table);

    // make reordered table
    if (reorder) {
        const dragIndex = headers.indexOf(headers.find(h => h.title == 'Drag'));
        headers.splice(dragIndex, 1);
        let {
            onDragStart,
            onDragEnd,
            onDrag,
            onInsert,
            onSwap
        } = reorder;
        // console.log('setting drag events');
        if (!onDragStart) onDragStart = () => {};
        if (!onDragEnd) onDragEnd = () => {};
        if (!onDrag) onDrag = () => {};
        if (!onInsert) onInsert = () => {};
        if (!onSwap) onSwap = () => {};
        let currentDrag;

        let trPositions = [];
        let blankPositions = [];

        table.querySelectorAll('tr').forEach(tr => {

            const placeholderDragOver = (e) => {}

            const placeholderDragEnter = (e) => {
                e.preventDefault();
                e.target.classList.add('table-info');
                tr.dataset.insert = 'true';
            }

            const placeholderDragLeave = (e) => {
                e.preventDefault();
                e.target.classList.remove('table-info');
                tr.dataset.insert = 'false';
            }

            tr.addEventListener('dragstart', (e) => {
                // e.preventDefault();
                tr.classList.add('cursor-grabbing');

                const tds = e.target.querySelectorAll('td');

                let allowed = false;
                tds.map(td => {
                    // if the mouse is over a td that has a class of 'table-drag', then allow the drag
                    // get mouse positions
                    const { x, y } = e;
                    const { left, top, bottom, right } = td.getBoundingClientRect();
                    if (x > left && x < right && y > top && y < bottom) {
                        if (td.classList.contains('table-drag')) allowed = true;
                    }

                    // else return;
                });

                if (!allowed) {
                    e.preventDefault();
                    return;
                }

                currentDrag = tr.dataset.rowPos;

                const { left, right, top, bottom } = tr.getBoundingClientRect();
                tr.style.position = 'fixed';
                tr.style.top = top + 'px';
                tr.style.left = left + 'px';
                tr.style.width = right - left + 'px';
                tr.style.height = bottom - top + 'px';
                // tr.classList.add('invisible');

                tds.forEach(td => {
                    td.style.width = td.clientWidth + 'px';
                    td.style.height = td.clientHeight + 'px';
                    // const { left, right, top, bottom } = td.getBoundingClientRect();

                    // td.style.position = 'fixed';
                    // td.style.top = top + 'px';
                    // td.style.left = left + 'px';
                    // td.style.width = right - left + 'px';
                    // td.style.height = bottom - top + 'px';
                });

                trPositions = [];
                blankPositions = [];

                // insert a blank placeholder row between each row
                table.querySelector('tbody').querySelectorAll('tr').forEach(_tr => {

                    const blank = document.createElement('div');
                    blank.classList.add('table-insert-blank');
                    blank.style.height = '20px';

                    blank.addEventListener('dragover', placeholderDragOver);
                    blank.addEventListener('dragenter', placeholderDragEnter);
                    blank.addEventListener('dragleave', placeholderDragLeave);
                    blank.addEventListener('drop', placeholderDragLeave);
                    blank.dataset.insertPos = _tr.dataset.rowPos;
                    blank.setAttribute('colspan', headers.length);

                    table.querySelector('tbody').insertBefore(blank, _tr);


                    const {
                        left,
                        right,
                        top,
                        bottom
                    } = _tr.getBoundingClientRect();
                    trPositions.push({
                        left,
                        right,
                        top,
                        bottom
                    });

                    const {
                        left: _left,
                        right: _right,
                        top: _top,
                        bottom: _bottom
                    } = blank.getBoundingClientRect();

                    blankPositions.push({
                        left: _left,
                        right: _right,
                        top: _top,
                        bottom: _bottom
                    });
                });

                const blank = document.createElement('div');
                // blank.classList.add('w-100');
                // blank.classList.add('bg-fade-fast');
                blank.classList.add('table-insert-blank');
                blank.style.height = '20px';
                blank.dataset.insertPos = trPositions.length;
                blank.setAttribute('colspan', headers.length);

                blank.addEventListener('dragover', placeholderDragOver);
                blank.addEventListener('dragenter', placeholderDragEnter);
                blank.addEventListener('dragleave', placeholderDragLeave);
                blank.addEventListener('drop', placeholderDragLeave);
                blank.dataset.insertPos = data.length;
                blank.setAttribute('colspan', headers.length);

                table.querySelector('tbody').appendChild(blank);

                const {
                    left: _left,
                    right: _right,
                    top: _top,
                    bottom: _bottom
                } = blank.getBoundingClientRect();

                blankPositions.push({
                    left: _left,
                    right: _right,
                    top: _top,
                    bottom: _bottom
                });

                // console.log(trPositions);
                // console.log(blankPositions);

                const { x, y } = e;
                tr.dataset.startX = x;
                tr.dataset.startY = y;

                onDragStart();
            });

            tr.addEventListener('drag', (e) => {
                // e.preventDefault();
                const { x, y, clientX, clientY } = e;

                let newY = y - (+tr.dataset.startY || y) + 'px';
                let newX = x - (+tr.dataset.startX || x) + 'px';

                tr.style.transform = 'translate(' + newX + ', ' + newY + ')';

                blankPositions.forEach((pos, i) => {
                    const { left: blLeft, right: blRight, top: blTop, bottom: blBottom } = pos;
                    try {
                        const { left: trLeft, right: trRight, top: trTop, bottom: trBottom } = trPositions[i];
                        if (clientY > trTop && clientY < trBottom && clientX > trLeft && clientX < trRight) {
                            if (i == currentDrag) return;
                            // console.log('dragged into tr: ', i);
                            tr.dataset.swap = i;
                            tr.dataset.insert = null;

                            table.querySelectorAll('tr').forEach(_tr => {
                                tr.classList.remove('bg-info');
                                tr.classList.remove('bg-fade-fast');
                            });

                            table.querySelectorAll('div').forEach(_div => {
                                _div.classList.remove('bg-secondary');
                                _div.classList.remove('bg-fade-fast');
                            });

                            table.querySelector('tr[data-row-pos="' + i + '"]').classList.add('bg-fade-fast');
                            table.querySelector('tr[data-row-pos="' + i + '"]').classList.add('bg-info');
                            return;
                        }
                    } catch {}
                    if (clientY > blTop && clientY < blBottom && clientX > blLeft && clientX < blRight) {
                        // console.log('dragged into blank: ', i);
                        tr.dataset.insert = i;
                        tr.dataset.swap = null;

                        table.querySelectorAll('tr').forEach(_tr => {
                            tr.classList.remove('bg-fade-fast');
                            tr.classList.remove('bg-info');
                        });

                        table.querySelectorAll('div').forEach(_div => {
                            _div.classList.remove('bg-fade-fast');
                            _div.classList.remove('bg-secondary');
                        });
                        table.querySelector('div[data-insert-pos="' + i + '"]').classList.add('bg-fade-fast');
                        table.querySelector('div[data-insert-pos="' + i + '"]').classList.add('bg-secondary');
                        return;
                    }
                    // else {
                    // tr.dataset.swap = null;
                    // tr.dataset.insert = null;
                    try {
                        table.querySelector('tr[data-row-pos="' + i + '"]').classList.remove('bg-info');
                        table.querySelector('tr[data-row-pos="' + i + '"]').classList.remove('bg-fade-fast');
                    } catch {}
                    table.querySelector('div[data-insert-pos="' + i + '"]').classList.remove('bg-fade-fast');
                    table.querySelector('div[data-insert-pos="' + i + '"]').classList.remove('bg-secondary');
                    // }
                });
                onDrag();
                // console.log(tr.dataset.swap, tr.dataset.insert);
            });

            tr.addEventListener('dragend', (e) => {
                // e.preventDefault();
                // document.body.style.cursor = 'auto';
                tr.classList.remove('cursor-grabbing');
                onDragEnd();

                const { clientX, clientY } = e;
                const { left, right, top, bottom } = table.getBoundingClientRect();

                if (!(clientY > top && clientY < bottom && clientX > left && clientX < right)) {
                    tr.dataset.swap = null;
                    tr.dataset.insert = null;
                }

                let { swap, insert } = tr.dataset;
                tr.style.transform = '';
                tr.style.position = '';
                tr.style.top = '';
                tr.style.left = '';
                tr.style.width = '';
                tr.style.height = '';

                table.querySelectorAll('div.table-insert-blank').forEach(_div => _div.remove());
                if (swap != 'null') {
                    swap = +swap;
                    // swap rows in data

                    const swapRow = data[swap];
                    data[swap] = data[currentDrag];
                    data[currentDrag] = swapRow;
                    setTable(table, headers, data, options);
                    onSwap(data);
                    return;
                }

                if (insert != 'null') {
                    insert = +insert;
                    const insertRow = data[currentDrag];

                    const currentIndex = data.indexOf(insertRow);

                    // delete row from data
                    data.splice(currentDrag, 1);

                    // insert row into data
                    if (insert > currentIndex) data.splice(insert - 1, 0, insertRow);
                    else data.splice(insert - 2, 0, insertRow);

                    setTable(table, headers, data, options);
                    onInsert(data);
                    return;
                }
            });
        });

    }

    return renderedTable;
}




function placeHolderDrop(e, table, tr) {
    e.preventDefault();
    const { insert } = tr.dataset;
    if (insert == 'true') {
        // insert the row before the placeholder row
        // e.target is the placeholder row
        e.target.parentNode.insertBefore(tr, e.target);
        table.querySelectorAll('.table-placeholder').forEach(placeholder => placeholder.remove());
        resetDrag(tr);
    }
}

function tableToObject(table, headers, options) {
    let invert;
    if (options) {
        invert = options.invert;
    }
    let data = [];
    try {
        if (invert) {
            headers.forEach((h, i) => {
                if (i == 0) return;
                let output = {
                    column: h.variableName ? h.variableName : h.title,
                    data: []
                };
                table.querySelectorAll(`tbody td[data-col-pos="${i}"]`).forEach((col, row) => {
                    let rowData = {}
                    let rowDataTitle = headers[0].getData(table.querySelector(`tbody td[data-col-pos="0"][data-row-pos="${row}"]`));
                    rowData[rowDataTitle] = h.getData(col);
                    output.data.push(rowData);
                });
                data.push(output);
            });
        } else {
            table.querySelectorAll('tbody tr').forEach(tr => {
                let output = {};
                headers.forEach(h => {
                    let td = tr.querySelector(`td[data-header="${h.title}"]`);

                    let variableName = h.variableName ? h.variableName : h.title;

                    output[variableName] = h.getData(td);
                });
                data.push(output);
            });
        }


        return data;
    } catch (err) {
        return [];
    }
}

class Table {
    constructor({
        rows,
        thead,
        table,
        tfoot
    }) {
        this.rows = rows;
        this.thead = thead;
        this.table = table;
        this.tfoot = tfoot;

        this.headers = thead.querySelectorAll('th');

        this.originalRows = [...rows];

        this.tableId = table.id;
    }

    addRow(tr, index) {
        let before = this.rows.slice(0, index - 1);
        let after = this.rows.slice(index, this.rows.length - 1);

        this.rows = [
            ...before,
            tr,
            ...after
        ];
    }

    reset() {
        this.table.innerHTML = '';

        let tbody = document.createElement('tbody');
        this.originalRows.forEach(tr => {
            tbody.appendChild(tr);
        });

        this.table.appendChild(thead);
        this.table.appendChild(tbody);

        if (tfoot) {
            this.table.appendChild(tfoot);
        }
    }

    set() {
        this.table.innerHTML = '';

        let tbody = document.createElement('tbody');
        this.rows.forEach(tr => {
            tbody.appendChild(tr);
        });

        this.table.appendChild(thead);
        this.table.appendChild(tbody);

        if (tfoot) {
            this.table.appendChild(tfoot);
        }
    }

    createTableSwap() {

    }
}

function getTableElements(table) {
    if (!table.querySelector) throw new Error('Table must be a node!');

    let rows = [];

    let thead = table.querySelector('thead');

    table.querySelectorAll('tbody tr').forEach(tr => {
        rows.push(tr);
    });

    let tfoot = table.querySelector('tfoot');

    return new Table({
        rows,
        thead,
        table,
        tfoot
    });
}

function temp() {
    console.clear();
    setTable(document.querySelector('#pl--pick-list'), [{
            title: 'Foo',
            getData: (row) => row.foo
        },
        {
            title: 'Bar',
            getData: (row) => row.bar
        }
    ], [{
            foo: 'Foo 1',
            bar: 'Bar 1'
        },
        {
            foo: 'Foo 2',
            bar: 'Bar 2'
        },
        {
            foo: 'Foo 3',
            bar: 'Bar 3'
        }
    ], {
        reorder: {
            dragPosition: 'start'
        }
    });
}


/*        */


/*        const trs = table.querySelectorAll('tr');
        const blankList = new Array(trs.length + 1);
        const trsList = new Array(trs.length);
        trs.forEach(tr => {
            const trMouseover = (e) => {
                e.preventDefault();
                e.target.classList.add('table-info');

                tr.dataset.swap = 'true';
                tr.dataset.swapPos = e.target.dataset.rowPos;
            };
            const trMouseout = (e) => {
                e.preventDefault();
                e.target.classList.remove('table-info');

                tr.dataset.swap = 'false';
                tr.dataset.swapPos = '';
            };
            const mouseup = (e) => {
                e.preventDefault();
                tr.dataset.dragging = '';
                tr.dataset.initDragging = '';
                tr.classList.remove('position-fixed');

                tr.style.top = '';
                tr.style.left = '';

                tr.dataset.initX = '';
                tr.dataset.initY = '';

                tr.style.zIndex = '';

                if (tr.dataset.insert == 'true') {
                    const dataInsert = data[tr.dataset.rowPos];
                    // delete data[tr.dataset.rowPos];
                    // insert data at insertPos
                    // keep all other data
                    data.splice(tr.dataset.insertPos, 0, dataInsert);
                    setTable(table, headers, data, options);
                    return;
                }
                if (tr.dataset.swap == 'true') {
                    // swap data at swapPos and rowPos
                    const dataSwap = data[tr.dataset.rowPos];
                    data[tr.dataset.rowPos] = data[tr.dataset.swapPos];
                    data[tr.dataset.swapPos] = dataSwap;
                    setTable(table, headers, data, options);
                    return;
                }
                setTable(table, headers, data, options);
            };
            const mousedown = (e) => {
                const parents = getAllParentElements(e.target);
                if (!parents.some(e => e.classList.contains('table-drag'))) return;

                tr.dataset.initDragging = true;

                // get mouse/touch position
                if (e.type == 'touchstart') {
                    const touch = e.touches[0];
                    tr.dataset.initX = touch.clientX;
                    tr.dataset.initY = touch.clientY;
                } else {
                    tr.dataset.initX = e.clientX;
                    tr.dataset.initY = e.clientY;
                }

                tr.style.zIndex = '99999999999';
            };
            const mousemove = (e) => {
                e.preventDefault();
                if (tr.dataset.initDragging == 'true') {
                    tr.dataset.initDragging = '';
                    tr.classList.add('position-fixed');
                    tr.dataset.dragging = 'true';

                    trs.forEach((_tr, i) => {
                        const blank = document.createElement('tr');
                        blank.classList.add('table-insert');
                        blank.classList.add('table-light');
                        blank.dataset.insertPos = i;


                        table.querySelector('tbody').insertBefore(blank, _tr);
                        blankList[i] = blank.getClientRects();
                        trsList[i] = _tr.getClientRects();
                    });
                    if (!tr.dataset.dragging == 'true') return;

                    const blank = document.createElement('tr');
                    blank.classList.add('table-insert');
                    blank.classList.add('table-light');

                    table.querySelector('tbody').insertBefore(blank, _tr);
                    blankList[blankList.length - 1] = blank.getClientRects();
                }

                // get mouse/touch position
                let x, y;
                if (e.type == 'touchmove') {
                    const touch = e.touches[0];
                    x = touch.clientX;
                    y = touch.clientY;
                } else {
                    x = e.clientX;
                    y = e.clientY;
                }
                tr.style.top = y - tr.dataset.initY + 'px';
                tr.style.left = x - tr.dataset.initX + 'px';
            };

            tr.addEventListener('mouseover', trMouseover);
            tr.addEventListener('mouseout', trMouseout);
            tr.addEventListener('mouseup', mouseup);
            tr.addEventListener('mousedown', mousedown);
            tr.addEventListener('mousemove', mousemove);
        });
*/
/**
 * 
 * @param {String} text text to copy into clipboard 
 * @param {Boolean} notify whether or not to notify the user that the text was copied
 */
function copyText(text, notify = false) {
    navigator.clipboard.writeText(text);
    if (notify) createNotification('Clipboard', `Copied text: ${text}`, 'success');
}

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
let totalLoadTime = 0;

let allRequests = {
    post: {},
    get: {}
};

class CustomRequest {
    constructor(obj) {
        Object.assign(this, obj);

        const splitUrl = this.url.split('/');

        const setObj = (obj, i) => {
            obj[camelCase(splitUrl[i])] = obj[camelCase(splitUrl[i])] || {};

            if (i == splitUrl.length - 1) {
                return obj[camelCase(splitUrl[i])];
            } else {
                setObj(obj[camelCase(splitUrl[i])], i + 1);
            }
        }

        let l = setObj(allRequests[this.method], 0);

        if (JSON.stringify(l)) {
            console.warn('Issue setting up request object');
            console.log(allRequests, l);
            return;
        }

        if (Array.isArray(l)) {
            l.push(this);
        } else {
            l = [this];
        }
    }

    async send() {
        return await requestFromServer(this);
    }

    static async request(obj) {
        const r = new CustomRequest(obj);
        return await r.send();
    }
}

let requestId = 0;
async function requestFromServer({
    url,
    method = 'POST',
    func,
    headers,
    body,
    params,
    noHeaders,
    receive = 'JSON'
}) {
    const requestStart = Date.now();
    const originalUrl = url;
    if (!url) {
        console.error('Error: No URL provided, no request sent');
        return;
    }
    if ((method.toUpperCase() == "GET" || method.toUpperCase() == "HEAD") && body != undefined) {
        console.error('Cannot have body in GET or HEAD request, no request sent');
        return;
    }

    let _headers = {};
    if (body && !noHeaders) _headers = {...headers,
        "Content-Type": "application/json",
    };
    headers = _headers
    headers['Accept'] = "application/json";

    // iterates through params and puts them on the urlString as an encodedURI Variable
    if (params) {
        url += '?'
        Object.keys(params).forEach(param => {
            url += encodeURI(`${param}=${params[param]}&`);
        });
        url = url.slice(0, url.length - 1);
    }
    console.log(`${method} Request: ${url}`);
    let options = {
        method: method.toUpperCase(),
        body: JSON.stringify(body),
        headers: headers,
    }
    const reqData = {
        time: {
            start: requestStart
        },
        url: originalUrl,
        method: method.toUpperCase(),
        params: params ? params : null,
        body: body ? body : null,
        headers: headers ? headers : null,
        status: 'pending'
    }
    if (!Array.isArray(allRequests[method.toLowerCase()][camelCase(originalUrl.slice(1).replace(/\//g, ' ').replace(/-/g, ' '))])) {
        allRequests[method.toLowerCase()][camelCase(originalUrl.slice(1).replace(/\//g, ' ').replace(/-/g, ' '))] = [];
    }

    allRequests[method.toLowerCase()][camelCase(originalUrl.slice(1).replace(/\//g, ' ').replace(/-/g, ' '))].push(reqData);

    return fetch(url, options).then(res => {
        if (receive == 'JSON') return res.json();
        if (receive == 'TEXT') return res.text();
        if (receive == 'BLOB') return res.blob();
    }).then(async(data) => {

        // console.log(`Data for: ${method} - ${originalUrl}`);
        // console.log(data);

        if (data.status == 'epic-failure') return;

        // Creates notification
        const { status, title, msg, url, wait, clearCart, notificationLength } = data;
        if (msg) {
            if (title) createNotification(title, msg, status, notificationLength);
            else currentPage.notify(msg, status);
        }

        if (url) setTimeout(() => { location.pathname = url }, wait ? wait * 1000 : 0);

        if (func) {
            if (func.constructor.name == 'AsyncFunction') {
                try {
                    await func(data);
                } catch (err) {
                    console.error(err);
                }
            } else {
                try {
                    func(data);
                } catch (err) {
                    console.error(err);
                }
            }
        }


        if (clearCart) window.localStorage.removeItem('cart'); // specific to my code
        const requestEnd = Date.now();
        const requestDelta = requestEnd - requestStart;
        // console.log(`Time for ${method} - ${originalUrl}: ${requestDelta}`);
        totalLoadTime += requestDelta;
        // console.log(`Total Load Time: ${totalLoadTime}`);

        reqData.time.end = requestEnd;
        reqData.time.delta = requestDelta;
        reqData.response = data;
        reqData.status = 'fulfilled';


        // allRequests[method.toLowerCase()][camelCase(originalUrl.slice(1).replace(/\//g, ' ').replace(/-/g, ' '))].push({
        //     time: {
        //         start: requestStart,
        //         end: requestEnd,
        //         delta: requestDelta
        //     },
        //     response: data,
        //     url: originalUrl,
        //     method: method.toUpperCase(),
        //     params: params ? params : null,
        //     body: body ? body : null,
        //     headers: headers ? headers : null
        // });

        requestId++;
        return data;
    });
}
class StateStack {
    /**
     *  @example
     *  ```
     *  class YourClass extends StateStack {
     *      // the function onChange() is called every time the state changes, and is passed the new state
     *      // override this function to do what you want with the new state
     *      onChange(newState) {
     *          // do something with the new state
     *      }
     * 
     *      // the function onReject() is called when the state changes to a rejected state
     *      // override this function if you don't want an error thrown
     *      onReject() {
     *          // do something on rejection
     *      }
     *  
     *      // the function onClear() is called when the stack is cleared
     *      // override this function to do what you want with the stack being cleared
     *      onClear() {
     *          // do something on clearing
     *      }
     *  }
     * 
     *  // create a new instance of YourClass
     *  const yourClass = new YourClass();
     * 
     *  // add a new state to the stack
     *  yourClass.addState(yourState); // yourState can be anything you want, it will be passed to onChange()
     * 
     *  // go to the 'next' or 'prev' state
     *  // these will call onChange() with the new state, or if there are no states, it will call onReject()
     *  yourClass.next();
     *  yourClass.prev();
     * 
     *  // resolves the current state
     *  yourClass.resolve();
     *  ```
     */
    constructor() {
        this.states = [];
        this.currentState = null;
        this.currentIndex = -1;
        this.branches = [];
        this.currentBranch = -1;
    }

    // branch(states, index) {
    //     // newStates = all states after and including index
    //     const newStates = states.slice(index);
    //     this.branches.push({
    //         states,
    //         index
    //     });
    // }

    // findBranch(index) {
    //     const branch = this.branches.find(b => b.index == index);
    //     if (branch) return branch;
    //     return null;
    // }

    /**
     * 
     * @param {Any} state Anything
     * @returns Copied state with no dependencies
     */
    copyState(state) {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * 
     * @param {Any} state This can be anything, it will be passed to onChange()
     */
    addState(state) {
        if (this.currentIndex < this.states.length - 1) {
            // remove all states after currentIndex
            this.states = this.states.splice(0, this.currentIndex + 1);

            this.states.push(this.copyState(state));
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        } else {
            this.states.push(this.copyState(state));
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        }

        this.resolve();
    }

    /**
     *  @description Destroys the stack and calls onClear()
     */
    clearStates() {
        this.states = [];
        this.currentIndex = -1;
        this.currentState = null;
        this.onClear();
    }

    // clearBranches() {
    //     this.branches = [];
    // }

    /**
     * @description Goes to the next state in the stack
     */
    next() {
        if (this.states.length > 0 && this.currentIndex < this.states.length - 1) {
            this.currentState = this.states[this.currentIndex + 1];
            this.currentIndex++;

            this.resolve();
        } else {
            this.onReject(this.currentState);
        }
    }

    /**
     * @description Goes to the previous state in the stack
     */
    prev() {
        if (this.states.length > 0 && this.currentIndex > 0) {
            this.currentState = this.states[this.currentIndex - 1];
            this.currentIndex--;
            // this.findBranch(this.currentIndex);
            this.resolve();
        } else {
            this.onReject(this.currentState);
        }
    }

    /**
     * @description Gets the number of states in the current stack
     */
    get numStacks() {
        return this.states.length;
    }

    // nextBranch() {
    //     if (this.branches.length > 0 && this.currentBranch < this.branches.length - 1) {
    //         this.currentBranch++;
    //         this.currentState = this.branches[this.currentBranch].states[this.branches[this.currentBranch].index];
    //         this.currentIndex = this.branches[this.currentBranch].index;
    //         this.resolve();
    //     } else {
    //         this.rejectCallback();
    //     }
    // }

    // prevBranch() {
    //     if (this.branches.length > 0 && this.currentBranch > 0) {
    //         this.currentBranch--;
    //         this.currentState = this.branches[this.currentBranch].states[this.branches[this.currentBranch].index];
    //         this.currentIndex = this.branches[this.currentBranch].index;
    //         this.resolve();
    //     } else {
    //         this.rejectCallback();
    //     }
    // }

    /**
     * @description Resolves the current state
     */
    resolve() {
        this.onChange(this.currentState);
    }

    /**
     *  @description Customizable callback for when the state changes
     */
    onChange() {

    }

    /**
     *  @description Customizable callback for when the state changes to a rejected state
     */
    onReject() {
        throw new Error('State does not exist, nothing has changed');
    }

    /**
     * @description Customizable callback for when the stack is cleared
     */
    onClear() {

    }
}
/**
 * 
 * @param {Date} date Date object
 * @returns Time in am/pm instead of 24hr
 */
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function AMPMtoMinutes(time) {
    const [t, ap] = time.split(' ');
    const [h, m] = t.split(':');
    const delta = ap == 'AM' ? 0 : 12;

    let minutes = ((+h + +delta) * 60) + +m;
    return minutes;
}

function minutesToAMPM(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    let ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    m = m < 10 ? '0' + m : m;
    var strTime = h + ':' + m + ' ' + ap;
    return strTime;
}

function convertDayToDate(dayInput) {
    try {
        // dayInput is a string in the format of '07/19/2022, 5:30 PM'
        // output must be a Date object
        const [date, time] = dayInput.split(', ');
        const [month, day, year] = date.split('/');
        const [_time, ampm] = time.split(' ');
        const [hour, minute] = _time.split(':');
        const delta = ampm.toUpperCase() == 'AM' ? 0 : 12;
        const hours = (+hour + +delta);
        const minutes = +minute;
        const seconds = 0;
        const milliseconds = 0;
        return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
    } catch (e) {
        console.log(e);
        console.log(dayInput);
        alert('Your date input is invalid, it must be in the format of: "mm/dd/yyyy, hh:mm AM/PM"');
    }
}

/**
 * 
 * @param {Date} date 
 * @returns {string} Date in the format of '07/19/2022, 5:30 PM'
 */
function convertDateToDay(date) {
    // date is a Date object
    // output must be a string in the format of '07/19/2022, 5:30 PM'
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return `${month}/${day}/${year}, ${strTime}`;
}

function convertDayNoTimeToDate(dayInput) {
    try {
        // dayInput is a string in the format of '07/19/2022'
        // output must be a Date object
        const [month, day, year] = dayInput.split('/');
        return new Date(year, month - 1, day);
    } catch (e) {
        console.log(e);
        console.log(dayInput);
        alert('Your date input is invalid, it must be in the format of: "mm/dd/yyyy"');
    }
}



class WeekSet {
    constructor(element, onclick) {
        this.id = element.id;
        this.week = element;
        this.days = element.querySelectorAll('.week-day');
        this.type = element.dataset.btnGroupType;
        this.selectedDays = [];
        this.selectedIndexes = [];
        this.selectedDay = null;
        this.selectedIndex = null;

        if (this.type == 'toggle') {
            this.setToggleWeekdays();
        } else {
            this.setMultiSelectWeekdays();
        }

        if (onclick) {
            this.days.forEach(wd => {
                wd.addEventListener('click', onclick);
            });
        }
    }

    setToggleWeekdays() {
        this.days.forEach(wd => {
            wd.addEventListener('click', () => {
                let isSelected = wd.classList.contains('selected');
                this.week.querySelectorAll('.week-day').forEach(wd => {
                    wd.classList.remove('selected');
                });
                if (isSelected) {
                    this.week.dataset.day = null;
                    this.week.dataset.index = null;
                    this.selectedDay = null;
                    this.selectedIndex = null;
                } else {
                    wd.classList.add('selected');

                    this.week.dataset.day = wd.dataset.weekDay;
                    this.week.dataset.index = wd.dataset.weekIndex;
                    this.selectedDay = wd.dataset.weekDay;
                    this.selectedIndex = wd.dataset.weekIndex;

                    console.log(this.selectedDay);
                    console.log(this.selectedIndex);
                }
            });
        });
        // this.selectIndex(0);
    }

    setMultiSelectWeekdays() {
        this.days.forEach(wd => {
            wd.addEventListener('click', () => {
                if (wd.dataset.weekDay == 'all') {
                    let time = 0;
                    if (this.week.dataset.allSelected == 'true') {
                        this.week.querySelectorAll('.week-day').forEach(el => {
                            setTimeout(() => {
                                el.classList.remove('selected');
                            }, time);
                            time += 30;
                        });
                        this.week.dataset.allSelected = false;
                        this.allSelected = false;
                        this.selectedDays = [];
                    } else {
                        this.week.querySelectorAll('.week-day').forEach(el => {
                            setTimeout(() => {
                                el.classList.add('selected');
                            }, time);
                            time += 30;
                        });
                        this.week.dataset.allSelected = true;
                        this.allSelected = true;
                        this.selectedDays = week.map(d => d.toLowerCase());
                        this.selectedIndexes = week.map((d, i) => i);
                    }
                } else {
                    if (wd.classList.contains('selected')) {
                        this.week.dataset.allSelected = false;
                        this.allSelected = false;
                        this.week.querySelector('.week-day[data-week-day="all"]').classList.remove('selected');
                        wd.classList.remove('selected');
                        this.selectedDays.splice(this.selectedDays.indexOf(wd.dataset.weekDay), 1);
                        this.selectedIndexes.splice(this.selectedIndexes.indexOf(wd.dataset.weekIndex), 1);
                    } else {
                        let test = true;
                        this.week.querySelectorAll('.week-day').forEach(el => {
                            if (el.dataset.weekDay == 'all') return;
                            if (el.dataset.weekDay == wd.dataset.weekDay) return;
                            if (!el.classList.contains('selected')) test = false;
                        });
                        if (test) {
                            this.week.dataset.allSelected = true;
                            this.allSelected = true;
                            this.selectedDays = week.map(d => d.toLowerCase());
                            this.selectedIndexes = week.map((d, i) => i);
                            this.week.querySelector('.week-day[data-week-day="all"]').classList.add('selected');
                        } else this.week.querySelector('.week-day[data-week-day="all"]').classList.remove('selected');
                        wd.classList.add('selected');
                    }
                }
                this.selectedDays.sort();
                this.selectedIndexes.sort();
            });
        });
    }

    // Select day from text input
    selectDay(day) {
        let index = week.find(d => d.toLowerCase() == day.toLowerCase());


        this.days.forEach(el => {
            if (el.dataset.weekIndex == index) el.classList.add('selected');
            else el.classList.remove('selected');
        });

        this.selectedDay = week[index].toLowerCase();
        this.selectedIndex = index;

        this.week.dataset.day = this.selectedDay;
        this.week.dataset.index = this.selectedIndex;

        this.selectedDays.push(this.selectedDay);
        this.selectedIndexes.push(this.selectedIndex);

        this.selectedDays.sort();
        this.selectedIndexes.sort();

        this.filterUnique();

        if (this.selectedDays.length == 7) {
            this.week.dataset.allSelected = true;
            this.allSelected = true;
            this.week.querySelector('.week-day[data-week-day="all"]').classList.add('selected');
        }
    }

    // Select index from text input
    selectIndex(index) {
        this.days.forEach(el => {
            if (el.dataset.weekIndex == index) el.classList.add('selected');
            else el.classList.remove('selected');
        });

        this.selectedDay = week[index].toLowerCase();
        this.selectedIndex = index;

        this.week.dataset.day = this.selectedDay;
        this.week.dataset.index = this.selectedIndex;

        this.selectedDays.push(this.selectedDay);
        this.selectedIndexes.push(this.selectedIndex);

        this.selectedDays.sort();
        this.selectedIndexes.sort();

        this.filterUnique();

        if (this.selectedDays.length == 7) {
            this.week.dataset.allSelected = true;
            this.allSelected = true;
            this.week.querySelector('.week-day[data-week-day="all"]').classList.add('selected');
        }
    }

    filterUnique() {
        this.selectedDays = this.selectedDays.filter((item, pos) => {
            return this.selectedDays.indexOf(item) == pos;
        });
        this.selectedIndexes = this.selectedIndexes.filter((item, pos) => {
            return this.selectedIndexes.indexOf(item) == pos;
        });
    }

    addClickListener(cb) {
        this.days.forEach(el => {
            el.addEventListener('click', cb);
        });
    }

    get getSelectedIndex() {
        let i = 0;

        document.querySelectorAll(`#${this.id} .week-day`).forEach((el, index) => {
            if (el.classList.contains('selected')) i = index;
        });

        return i;
    }

    get getSelectedDay() {
        return week[this.selectedDay];
    }

    get getSelectedIndexes() {
        let days = [];

        document.querySelectorAll(`#${this.id} .week-day`).forEach((el, index) => {
            if (el.classList.contains('selected')) days.push(index);
        });

        return days;
    }

    get getSelectedDays() {
        return this.getSelectedIndexes.map(i => week[i]);
    }
}