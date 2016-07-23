var Agent = (function () {
    function Agent() {
        this.initializeChromeListeners();
    }
    Agent.prototype.initializeChromeListeners = function () {
        /*chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders, {
            urls: ["<all_urls>"]
        }, ["blocking", "requestHeaders"]);

        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequest, {
            urls: ["<all_urls>"]
        }, ["blocking"]);*/
    };
    Agent.prototype.onBeforeSendHeaders = function (details) {
        var headers = details.requestHeaders;
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
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
    };
    Agent.prototype.onBeforeRequest = function (details) {
    };
    return Agent;
}());
var agent = new Agent();
