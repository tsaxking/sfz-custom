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