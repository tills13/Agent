let app = angular.module('agent', ['angular.filter']);

class OptionsController {
    scope: ng.IRootScopeService;

    enabledAgent: AgentInterface = null;
    customUserAgents: AgentInterface[] = null;
    builtinUserAgents: AgentInterface[] = null;

    constructor($scope) {
        this.scope = $scope;
        this.reloadAgents();
    }

    reloadAgents() {
        this.loadAgents((customUserAgents = [], builtinUserAgents = []) => {
            this.enabledAgent = customUserAgents.concat(builtinUserAgents)
                .reduce((previous, current) => {
                    return (previous ? previous : (current.enabled ? current : null));
                }, null);
            
            this.customUserAgents = customUserAgents;
            this.builtinUserAgents = builtinUserAgents;
        });
    }

    loadAgents(callback: (customUserAgents: AgentInterface[], builtinUserAgents: AgentInterface[]) => void): void {
        chrome.storage.sync.get(Config.ChromeOptionsKey, (options) => {
            options = options[Config.ChromeOptionsKey] || {};

            let customUserAgents: AgentInterface[] = options['customUserAgents'] || [];
            let builtinUserAgents: AgentInterface[] = options['builtinUserAgents'] || [];

            if (callback) {
                this.scope.$apply(() => callback(customUserAgents, builtinUserAgents));
            }
        });
    }

    createAgent(agent: AgentInterface): void {
        chrome.storage.sync.get(Config.ChromeOptionsKey, (options) => {
            if (!options[Config.ChromeOptionsKey]) {
                options[Config.ChromeOptionsKey] = {};
            }

            options[Config.ChromeOptionsKey]['customUserAgents'] = this.customUserAgents.concat(agent);
            chrome.storage.sync.set(options, this.reloadAgents.bind(this));
        });
    }

    deleteAgent(agent: AgentInterface): void {
        chrome.storage.sync.get(Config.ChromeOptionsKey, (options) => {
            if (!options[Config.ChromeOptionsKey]) return;
            let agents: AgentInterface[] = options[Config.ChromeOptionsKey].customUserAgents || [];
            
            for (let i = 0; i < agents.length; i++) {
                if (agents[i].name == agent.name) {
                    agents.splice(i, 1);
                    options[Config.ChromeOptionsKey].customUserAgents = agents;
                    chrome.storage.sync.set(options, this.reloadAgents.bind(this));
                    break;
                }
            }
        });
    }

    toggleEnabled(agent: AgentInterface): void {
        chrome.storage.sync.get(Config.ChromeOptionsKey, (options) => {
            if (!options[Config.ChromeOptionsKey]) return;
            let agents: AgentInterface[] = options[Config.ChromeOptionsKey].customUserAgents || [];
            
            for (let i = 0; i < agents.length; i++) {
                agents[i].enabled = agents[i].name == agent.name ? !agents[i].enabled : false;
            }

            options[Config.ChromeOptionsKey].customUserAgents = agents;
            chrome.storage.sync.set(options, this.reloadAgents.bind(this));
        });
    }

    editAgent(agent: AgentInterface): void {

    }
}

app.controller('OptionsController', ['$scope', OptionsController]);
app.directive('agent', () => {
    return { templateUrl: 'templates/agent.html' };
});