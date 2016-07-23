class Agent {
    enabledAgent: AgentInterface = null;
    constructor() {
        this.initializeChromeListeners();
    }

    initializeChromeListeners() {
        chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders.bind(this), {
            urls: ["<all_urls>"]
        }, ["blocking", "requestHeaders"]);

        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequest.bind(this), {
            urls: ["<all_urls>"]
        }, ["blocking"]);

        chrome.storage.onChanged.addListener((changes, domain) => {
            let customUserAgents = changes[Config.ChromeOptionsKey].newValue.customUserAgents || [];
            let builtinUserAgents = changes[Config.ChromeOptionsKey].newValue.builtinUserAgents || [];

            this.enabledAgent = customUserAgents.concat(builtinUserAgents)
                .reduce((previous, current) => {
                    return (previous ? previous : (current.enabled ? current : null));
                }, null);
        });

        chrome.storage.sync.get(Config.ChromeOptionsKey, (options) => {
            if (!options[Config.ChromeOptionsKey].customUserAgents) {
                options[Config.ChromeOptionsKey].customUserAgents = [];
            }

            if (!options[Config.ChromeOptionsKey].builtinUserAgents) {
                options[Config.ChromeOptionsKey].builtinUserAgents = [];
            }

            let customUserAgents = options[Config.ChromeOptionsKey].customUserAgents;
            let builtinUserAgents = options[Config.ChromeOptionsKey].builtinUserAgents;

            this.enabledAgent = customUserAgents.concat(builtinUserAgents)
                .reduce((previous, current) => {
                    return (previous ? previous : (current.enabled ? current : null));
                }, null);

            chrome.storage.sync.set(options);
        });
    }

    onBeforeSendHeaders(details : chrome.webRequest.WebRequestHeadersDetails) {
        if (!this.enabledAgent) return;

        let headers = details.requestHeaders;
        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];

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
    }

    onBeforeRequest(details : chrome.webRequest.WebRequestBodyDetails) : void {

    }
}

let agent = new Agent();