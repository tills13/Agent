var app = angular.module('agent', ['angular.filter']);
var OptionsController = (function () {
    function OptionsController($scope) {
        this.enabledAgent = null;
        this.customUserAgents = null;
        this.builtinUserAgents = null;
        this.scope = $scope;
        this.reloadAgents();
    }
    OptionsController.prototype.reloadAgents = function () {
        var _this = this;
        this.loadAgents(function (customUserAgents, builtinUserAgents) {
            if (customUserAgents === void 0) { customUserAgents = []; }
            if (builtinUserAgents === void 0) { builtinUserAgents = []; }
            _this.enabledAgent = customUserAgents.concat(builtinUserAgents)
                .reduce(function (previous, current) {
                return (previous ? previous : (current.enabled ? current : null));
            }, null);
            _this.customUserAgents = customUserAgents;
            _this.builtinUserAgents = builtinUserAgents;
        });
    };
    OptionsController.prototype.loadAgents = function (callback) {
        var _this = this;
        chrome.storage.sync.get(Config.ChromeOptionsKey, function (options) {
            options = options[Config.ChromeOptionsKey] || {};
            var customUserAgents = options['customUserAgents'] || [];
            var builtinUserAgents = options['builtinUserAgents'] || [];
            if (callback) {
                _this.scope.$apply(function () { return callback(customUserAgents, builtinUserAgents); });
            }
        });
    };
    OptionsController.prototype.createAgent = function (agent) {
        var _this = this;
        chrome.storage.sync.get(Config.ChromeOptionsKey, function (options) {
            if (!options[Config.ChromeOptionsKey]) {
                options[Config.ChromeOptionsKey] = {};
            }
            options[Config.ChromeOptionsKey]['customUserAgents'] = _this.customUserAgents.concat(agent);
            chrome.storage.sync.set(options, _this.reloadAgents.bind(_this));
        });
    };
    OptionsController.prototype.deleteAgent = function (agent) {
        var _this = this;
        chrome.storage.sync.get(Config.ChromeOptionsKey, function (options) {
            if (!options[Config.ChromeOptionsKey])
                return;
            var agents = options[Config.ChromeOptionsKey].customUserAgents || [];
            for (var i = 0; i < agents.length; i++) {
                if (agents[i].name == agent.name) {
                    agents.splice(i, 1);
                    options[Config.ChromeOptionsKey].customUserAgents = agents;
                    chrome.storage.sync.set(options, _this.reloadAgents.bind(_this));
                    break;
                }
            }
        });
    };
    OptionsController.prototype.toggleEnabled = function (agent) {
        var _this = this;
        chrome.storage.sync.get(Config.ChromeOptionsKey, function (options) {
            if (!options[Config.ChromeOptionsKey])
                return;
            var agents = options[Config.ChromeOptionsKey].customUserAgents || [];
            for (var i = 0; i < agents.length; i++) {
                agents[i].enabled = agents[i].name == agent.name ? !agents[i].enabled : false;
            }
            options[Config.ChromeOptionsKey].customUserAgents = agents;
            chrome.storage.sync.set(options, _this.reloadAgents.bind(_this));
        });
    };
    OptionsController.prototype.editAgent = function (agent) {
    };
    return OptionsController;
}());
app.controller('OptionsController', ['$scope', OptionsController]);
app.directive('agent', function () {
    return { templateUrl: 'templates/agent.html' };
});
