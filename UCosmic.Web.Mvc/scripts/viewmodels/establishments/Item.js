var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var gm = google.maps;
        var Item = (function () {
            function Item(id) {
                this.id = 0;
                this.$genericAlertDialog = undefined;
                this.createSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0));
                this.validatingSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(200));
                this.languages = ko.observableArray();
                this.names = ko.observableArray();
                this.editingName = ko.observable(0);
                this.namesSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.urls = ko.observableArray();
                this.editingUrl = ko.observable(0);
                this.urlsSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.id = id || 0;
                this._initNamesComputeds();
                this._initUrlsComputeds();
                this.location = new Establishments.Location(this.id);
            }
            Item.prototype.requestNames = function (callback) {
                var _this = this;
                this.namesSpinner.start();
                $.get(App.Routes.WebApi.Establishments.Names.get(this.id)).done(function (response) {
                    _this.receiveNames(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveNames = function (js) {
                ko.mapping.fromJS(js || [], this._namesMapping, this.names);
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
            Item.prototype._initNamesComputeds = function () {
                var _this = this;
                ko.computed(function () {
                    $.getJSON(App.Routes.WebApi.Languages.get()).done(function (response) {
                        var emptyValue = new ViewModels.Languages.ServerApiModel(undefined, '[Language Neutral]');
                        response.splice(0, 0, emptyValue);
                        _this.languages(response);
                    });
                }).extend({
                    throttle: 1
                });
                this._namesMapping = {
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
            };
            Item.prototype.requestUrls = function (callback) {
                var _this = this;
                this.urlsSpinner.start();
                $.get(App.Routes.WebApi.Establishments.Urls.get(this.id)).done(function (response) {
                    _this.receiveUrls(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveUrls = function (js) {
                ko.mapping.fromJS(js || [], this._urlsMapping, this.urls);
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
            Item.prototype._initUrlsComputeds = function () {
                var _this = this;
                this._urlsMapping = {
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
            };
            Item.prototype.submitToCreate = function (formElement) {
                var _this = this;
                if(!this.id || this.id === 0) {
                    this.validatingSpinner.start();
                    var officialName = this.names()[0];
                    var officialUrl = this.urls()[0];
                    var location = this.location;
                    if(officialName.text.isValidating() || officialUrl.value.isValidating()) {
                        setTimeout(function () {
                            var waitResult = _this.submitToCreate(formElement);
                            return false;
                        }, 5);
                        return false;
                    }
                    if(!officialName.isValid()) {
                        officialName.errors.showAllMessages();
                    }
                    if(!officialUrl.isValid()) {
                        officialUrl.errors.showAllMessages();
                    }
                    this.validatingSpinner.stop();
                    if(officialName.isValid() && officialUrl.isValid()) {
                        var url = App.Routes.WebApi.Establishments.post();
                        var data = {
                            officialName: officialName.serializeData(),
                            officialUrl: officialUrl.serializeData(),
                            location: location.serializeData()
                        };
                        this.createSpinner.start();
                        $.post(url, data).always(function () {
                            _this.createSpinner.stop();
                        }).done(function (response, statusText, xhr) {
                            var redirect = xhr.getResponseHeader('Location');
                            if(redirect) {
                                while(redirect.lastIndexOf('/') === redirect.length - 1) {
                                    redirect = redirect.substr(0, redirect.length - 1);
                                }
                                var pkStart = redirect.lastIndexOf('/') + 1;
                                var pkString = redirect.substr(pkStart);
                                var pk = parseInt(pkString);
                                var path = App.Routes.Mvc.Establishments.get(pk);
                                window.location.href = path;
                            }
                        }).fail(function (xhr, statusText, errorThrown) {
                            if(xhr.status === 400) {
                                _this.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                                _this.$genericAlertDialog.dialog({
                                    title: 'Alert Message',
                                    dialogClass: 'jquery-ui',
                                    width: 'auto',
                                    resizable: false,
                                    modal: true,
                                    buttons: {
                                        'Ok': function () {
                                            _this.$genericAlertDialog.dialog('close');
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
                return false;
            };
            return Item;
        })();
        Establishments.Item = Item;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
