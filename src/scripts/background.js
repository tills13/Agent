var Agent = (function () {
    function Agent() {
        this.enabledAgent = null;
        this.initializeChromeListeners();
    }
    Agent.prototype.initializeChromeListeners = function () {
        var _this = this;
        chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders.bind(this), {
            urls: ["<all_urls>"]
        }, ["blocking", "requestHeaders"]);
        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequest.bind(this), {
            urls: ["<all_urls>"]
        }, ["blocking"]);
        chrome.storage.onChanged.addListener(function (changes, domain) {
            var customUserAgents = changes[Config.ChromeOptionsKey].newValue.customUserAgents || [];
            var builtinUserAgents = changes[Config.ChromeOptionsKey].newValue.builtinUserAgents || [];
            _this.enabledAgent = customUserAgents.concat(builtinUserAgents)
                .reduce(function (previous, current) {
                return (previous ? previous : (current.enabled ? current : null));
            }, null);
        });
        chrome.storage.sync.get(Config.ChromeOptionsKey, function (options) {
            if (!options[Config.ChromeOptionsKey].customUserAgents) {
                options[Config.ChromeOptionsKey].customUserAgents = [];
            }
            if (!options[Config.ChromeOptionsKey].builtinUserAgents) {
                options[Config.ChromeOptionsKey].builtinUserAgents = [];
            }
            var customUserAgents = options[Config.ChromeOptionsKey].customUserAgents;
            var builtinUserAgents = options[Config.ChromeOptionsKey].builtinUserAgents;
            _this.enabledAgent = customUserAgents.concat(builtinUserAgents)
                .reduce(function (previous, current) {
                return (previous ? previous : (current.enabled ? current : null));
            }, null);
            chrome.storage.sync.set(options);
        });
    };
    Agent.prototype.onBeforeSendHeaders = function (details) {
        if (!this.enabledAgent)
            return;
        var headers = details.requestHeaders;
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            if (header.name === 'User-Agent') {
                headers.splice(i, 1);
                break;
            }
        }
        headers = headers.concat({
            name: 'User-Agent',
            value: this.enabledAgent.ua
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
