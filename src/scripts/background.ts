


class Agent {
    constructor() {
        this.initializeChromeListeners();
    }

    initializeChromeListeners() {
        /*chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders, {
            urls: ["<all_urls>"]
        }, ["blocking", "requestHeaders"]);

        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequest, {
            urls: ["<all_urls>"]
        }, ["blocking"]);*/
    }

    onBeforeSendHeaders(details : chrome.webRequest.WebRequestHeadersDetails) {
        let headers = details.requestHeaders;
        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];

            if (header.name === 'User-Agent') {
                headers.splice(i, 1);
                break;
            }
        }

        headers.concat({
            name: 'User-Agent',
            value: 'ntohing'
        });

        return {
            requestHeaders: headers
        };
    }

    onBeforeRequest(details : chrome.webRequest.WebRequestBodyDetails) : void {

    }
}

let agent = new Agent();