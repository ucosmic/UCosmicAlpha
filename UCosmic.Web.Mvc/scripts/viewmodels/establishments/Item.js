var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var Item = (function () {
            function Item(id) {
                var _this = this;
                this.namesSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.urlsSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.id = 0;
                this.$genericAlertDialog = undefined;
                this.languages = ko.observableArray();
                this.names = ko.observableArray();
                this.editingName = ko.observable(0);
                this.urls = ko.observableArray();
                this.editingUrl = ko.observable(0);
                this.id = id || 0;
                ko.computed(function () {
                    $.getJSON(App.Routes.WebApi.Languages.get()).done(function (response) {
                        var emptyValue = new ViewModels.Languages.ServerApiModel(undefined, '[Language Neutral]');
                        response.splice(0, 0, emptyValue);
                        _this.languages(response);
                    });
                }).extend({
                    throttle: 1
                });
                this.namesMapping = {
                    create: function (options) {
                        return new Establishments.Name(options.data, _this);
                    }
                };
                this.canAddName = ko.computed(function () {
                    return !_this.namesSpinner.isVisible() && _this.editingName() === 0 && _this.id !== 0;
                });
                ko.computed(function () {
                    if(_this.id) {
                        _this.requestNames();
                    } else {
                        setTimeout(function () {
                            _this.namesSpinner.stop();
                            _this.addName();
                        }, 0);
                    }
                }).extend({
                    throttle: 1
                });
                this.urlsMapping = {
                    create: function (options) {
                        return new Establishments.Url(options.data, _this);
                    }
                };
                this.canAddUrl = ko.computed(function () {
                    return !_this.urlsSpinner.isVisible() && _this.editingUrl() === 0 && _this.id !== 0;
                });
                ko.computed(function () {
                    if(_this.id) {
                        _this.requestUrls();
                    } else {
                        setTimeout(function () {
                            _this.urlsSpinner.stop();
                            _this.addUrl();
                        }, 0);
                    }
                }).extend({
                    throttle: 1
                });
            }
            Item.prototype.requestNames = function (callback) {
                var _this = this;
                this.namesSpinner.start();
                $.get(App.Routes.WebApi.EstablishmentNames.get(this.id)).done(function (response) {
                    _this.receiveNames(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveNames = function (js) {
                ko.mapping.fromJS(js || [], this.namesMapping, this.names);
                this.namesSpinner.stop();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.addName = function () {
                var apiModel = new Establishments.ServerNameApiModel(this.id);
                if(this.names().length === 0) {
                    apiModel.isOfficialName = true;
                }
                var newName = new Establishments.Name(apiModel, this);
                this.names.unshift(newName);
                newName.showEditor();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.requestUrls = function (callback) {
                var _this = this;
                this.urlsSpinner.start();
                $.get(App.Routes.WebApi.EstablishmentUrls.get(this.id)).done(function (response) {
                    _this.receiveUrls(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveUrls = function (js) {
                ko.mapping.fromJS(js || [], this.urlsMapping, this.urls);
                this.urlsSpinner.stop();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.addUrl = function () {
                var apiModel = new Establishments.ServerUrlApiModel(this.id);
                if(this.urls().length === 0) {
                    apiModel.isOfficialUrl = true;
                }
                var newUrl = new Establishments.Url(apiModel, this);
                this.urls.unshift(newUrl);
                newUrl.showEditor();
                App.Obtruder.obtrude(document);
            };
            return Item;
        })();
        Establishments.Item = Item;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;

})(ViewModels || (ViewModels = {}));

