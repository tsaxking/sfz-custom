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