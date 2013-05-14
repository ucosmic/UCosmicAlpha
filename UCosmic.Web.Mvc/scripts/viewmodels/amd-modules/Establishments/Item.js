define(["require", "exports", './SearchResult', './Search', './Name', './Location', './Url', '../Widgets/Spinner', 'languages/ServerApiModel'], function(require, exports, __SearchResult__, __Search__, __Name__, __Location__, __Url__, __Spinner__, __Languages__) {
    
    var gm = google.maps;
    var SearchResult = __SearchResult__;

    var Search = __Search__;

    var Name = __Name__;

    var Location = __Location__;

    var Url = __Url__;

    var Spinner = __Spinner__;

    var Languages = __Languages__;

    var CeebCodeValidator = (function () {
        function CeebCodeValidator() {
            this.async = true;
            this.message = 'error';
            this._isAwaitingResponse = false;
            this._ruleName = 'validEstablishmentCeebCode';
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
        CeebCodeValidator.prototype.validator = function (val, vm, callback) {
            var _this = this;
            if(this._isValidatable(vm)) {
                var route = App.Routes.WebApi.Establishments.validateCeebCode(vm.id);
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData()).always(function () {
                    _this._isAwaitingResponse = false;
                }).done(function () {
                    callback(true);
                }).fail(function (xhr) {
                    callback({
                        isValid: false,
                        message: xhr.responseText
                    });
                });
            } else if(!this._isAwaitingResponse || this._isOk(vm)) {
                callback(true);
            }
        };
        CeebCodeValidator.prototype._isValidatable = function (vm) {
            var originalValues = vm.originalValues();
            if(vm.id && vm.id !== 0) {
                return !this._isAwaitingResponse && vm && vm.ceebCode() && originalValues && originalValues.ceebCode !== vm.ceebCode();
            }
            return vm && vm.ceebCode() && !this._isAwaitingResponse;
        };
        CeebCodeValidator.prototype._isOk = function (vm) {
            var originalValues = vm.originalValues();
            if(vm.id && vm.id !== 0) {
                return vm && vm.ceebCode() !== undefined && originalValues && originalValues.ceebCode == vm.ceebCode();
            }
            return false;
        };
        return CeebCodeValidator;
    })();    
    new CeebCodeValidator();
    var UCosmicCodeValidator = (function () {
        function UCosmicCodeValidator() {
            this.async = true;
            this.message = 'error';
            this._isAwaitingResponse = false;
            this._ruleName = 'validEstablishmentUCosmicCode';
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
        UCosmicCodeValidator.prototype.validator = function (val, vm, callback) {
            var _this = this;
            if(this._isValidatable(vm)) {
                var route = App.Routes.WebApi.Establishments.validateUCosmicCode(vm.id);
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData()).always(function () {
                    _this._isAwaitingResponse = false;
                }).done(function () {
                    callback(true);
                }).fail(function (xhr) {
                    callback({
                        isValid: false,
                        message: xhr.responseText
                    });
                });
            } else if(!this._isAwaitingResponse || this._isOk(vm)) {
                callback(true);
            }
        };
        UCosmicCodeValidator.prototype._isValidatable = function (vm) {
            var originalValues = vm.originalValues();
            if(vm.id && vm.id !== 0) {
                return !this._isAwaitingResponse && vm && vm.uCosmicCode() && originalValues && originalValues.uCosmicCode !== vm.uCosmicCode();
            }
            return vm && vm.uCosmicCode() && !this._isAwaitingResponse;
        };
        UCosmicCodeValidator.prototype._isOk = function (vm) {
            var originalValues = vm.originalValues();
            if(vm.id && vm.id !== 0) {
                return vm && vm.uCosmicCode() !== undefined && originalValues && originalValues.uCosmicCode == vm.uCosmicCode();
            }
            return false;
        };
        return UCosmicCodeValidator;
    })();    
    new UCosmicCodeValidator();
    var ParentIdValidator = (function () {
        function ParentIdValidator() {
            this.async = true;
            this.message = 'error';
            this._isAwaitingResponse = false;
            this._ruleName = 'validEstablishmentParentId';
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
        ParentIdValidator.prototype.validator = function (val, vm, callback) {
            var _this = this;
            if(this._isValidatable(vm)) {
                var route = App.Routes.WebApi.Establishments.validateParentId(vm.id);
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData()).always(function () {
                    _this._isAwaitingResponse = false;
                }).done(function () {
                    callback(true);
                }).fail(function (xhr) {
                    callback({
                        isValid: false,
                        message: xhr.responseText
                    });
                });
            } else if(!this._isAwaitingResponse || this._isOk(vm)) {
                callback(true);
            }
        };
        ParentIdValidator.prototype._isValidatable = function (vm) {
            var originalValues = vm.originalValues();
            if(vm.id && vm.id !== 0) {
                return !this._isAwaitingResponse && vm && vm.parentId() && originalValues && originalValues.parentId !== vm.parentId();
            }
            return false;
        };
        ParentIdValidator.prototype._isOk = function (vm) {
            var originalValues = vm.originalValues();
            if(vm.id && vm.id !== 0) {
                return vm && vm.parentId() && originalValues && originalValues.parentId == vm.parentId();
            }
            return true;
        };
        return ParentIdValidator;
    })();    
    new ParentIdValidator();
    var Item = (function () {
        function Item(id) {
            var _this = this;
            this.id = 0;
            this.originalValues = ko.observable();
            this._isInitialized = ko.observable(false);
            this.$genericAlertDialog = undefined;
            this.createSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(0));
            this.validatingSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(200));
            this.categories = ko.observableArray();
            this.typeIdSaveSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(200));
            this.typeIdValidatingSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(200));
            this.typeId = ko.observable();
            this.typeText = ko.observable('[Loading...]');
            this.ceebCode = ko.observable();
            this.uCosmicCode = ko.observable();
            this.isEditingTypeId = ko.observable();
            this.isValidationSummaryVisible = ko.observable(false);
            this.flasherProxy = new App.FlasherProxy();
            this.languages = ko.observableArray();
            this.Names = ko.observableArray();
            this.editingName = ko.observable(0);
            this.NamesSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(0, true));
            this.urls = ko.observableArray();
            this.editingUrl = ko.observable(0);
            this.urlsSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(0, true));
            this.sideSwiper = new App.SideSwiper({
                frameWidth: 980,
                speed: 'fast',
                root: '#establishment_page'
            });
            this.parentSearch = new Search.Search(false);
            this.sammy = Sammy();
            this._findingParent = false;
            this.parentEstablishment = ko.observable();
            this.parentId = ko.observable();
            this.parentIdSaveSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(200));
            this.parentIdValidatingSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(200));
            this.id = id || 0;
            this._initNamesComputeds();
            this._initUrlsComputeds();
            this.location = new Location.Location(this.id);
            this.typeEmptyText = ko.computed(function () {
                return _this.categories().length > 0 ? '[Select a classification]' : '[Loading...]';
            });
            this.typeId.subscribe(function (newValue) {
                var categories = _this.categories();
                for(var i = 0; i < categories.length; i++) {
                    var types = categories[i].types();
                    for(var ii = 0; ii < types.length; ii++) {
                        if(types[ii].id() == _this.typeId()) {
                            _this.typeText(types[ii].text());
                            return;
                        }
                    }
                }
                _this.typeText('[Unknown]');
            });
            this.typeId.extend({
                required: {
                    message: 'Establishment type is required'
                }
            });
            this.ceebCode.subscribe(function (newValue) {
                if(_this.ceebCode()) {
                    _this.ceebCode($.trim(_this.ceebCode()));
                }
            });
            this.ceebCode.extend({
                validEstablishmentCeebCode: this
            });
            this.uCosmicCode.extend({
                validEstablishmentUCosmicCode: this
            });
            this.uCosmicCode.subscribe(function (newValue) {
                if(_this.uCosmicCode()) {
                    _this.uCosmicCode($.trim(_this.uCosmicCode()));
                }
            });
            this.isTypeIdSaveDisabled = ko.computed(function () {
                return _this.typeId.isValidating() || _this.uCosmicCode.isValidating() || _this.ceebCode.isValidating() || _this.typeIdSaveSpinner.isVisible() || _this.typeIdValidatingSpinner.isVisible() || _this.typeId.error || _this.ceebCode.error || _this.uCosmicCode.error;
            });
            this.parentId.extend({
                validEstablishmentParentId: this
            });
            var categoriesPact = $.Deferred();
            $.get(App.Routes.WebApi.Establishments.Categories.get()).done(function (data, textStatus, jqXHR) {
                categoriesPact.resolve(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                categoriesPact.reject(jqXHR, textStatus, errorThrown);
            });
            var viewModelPact = this._loadScalars();
            $.when(categoriesPact, viewModelPact).then(function (categories, viewModel) {
                ko.mapping.fromJS(categories, {
                }, _this.categories);
                _this._pullScalars(viewModel);
                if(!id) {
                    _this.isEditingTypeId(true);
                    _this.errors.showAllMessages(false);
                }
                if(!_this._isInitialized()) {
                    _this._isInitialized(true);
                }
            }, function (xhr, textStatus, errorThrown) {
            });
            ko.validation.group(this);
            this._setupSammy();
            this._setupParentComputeds();
        }
        Item.prototype.requestNames = function (callback) {
            var _this = this;
            this.NamesSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Names.get(this.id)).done(function (response) {
                _this.receiveNames(response);
                if(callback) {
                    callback(response);
                }
            });
        };
        Item.prototype.receiveNames = function (js) {
            ko.mapping.fromJS(js || [], this._NamesMapping, this.Names);
            this.NamesSpinner.stop();
            App.Obtruder.obtrude(document);
        };
        Item.prototype.addName = function () {
            var apiModel = new Name.ServerNameApiModel(this.id);
            if(this.Names().length === 0) {
                apiModel.isOfficialName = true;
            }
            var newName = new Name.Name(apiModel, this);
            this.Names.unshift(newName);
            newName.showEditor();
            App.Obtruder.obtrude(document);
        };
        Item.prototype._initNamesComputeds = function () {
            var _this = this;
            ko.computed(function () {
                $.getJSON(App.Routes.WebApi.Languages.get()).done(function (response) {
                    var emptyValue = new Languages.ServerApiModel(undefined, '[Language Neutral]');
                    response.splice(0, 0, emptyValue);
                    _this.languages(response);
                });
            }).extend({
                throttle: 1
            });
            this._NamesMapping = {
                create: function (options) {
                    return new Name.Name(options.data, _this);
                }
            };
            this.canAddName = ko.computed(function () {
                return !_this.NamesSpinner.isVisible() && _this.editingName() === 0 && _this.id !== 0;
            });
            ko.computed(function () {
                if(_this.id) {
                    _this.requestNames();
                } else {
                    setTimeout(function () {
                        _this.NamesSpinner.stop();
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
            var apiModel = new Url.ServerUrlApiModel(this.id);
            if(this.urls().length === 0) {
                apiModel.isOfficialUrl = true;
            }
            var newUrl = new Url.Url(apiModel, this);
            this.urls.unshift(newUrl);
            newUrl.showEditor();
            App.Obtruder.obtrude(document);
        };
        Item.prototype._initUrlsComputeds = function () {
            var _this = this;
            this._urlsMapping = {
                create: function (options) {
                    return new Url.Url(options.data, _this);
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
                var me = this;
                this.validatingSpinner.start();
                var officialName = this.Names()[0];
                var officialUrl = this.urls()[0];
                var location = this.location;
                if(officialName.text.isValidating() || officialUrl.value.isValidating() || this.ceebCode.isValidating() || this.uCosmicCode.isValidating()) {
                    setTimeout(function () {
                        var waitResult = _this.submitToCreate(formElement);
                        return false;
                    }, 50);
                    return false;
                }
                this.isValidationSummaryVisible(true);
                if(!this.isValid()) {
                    this.errors.showAllMessages();
                }
                if(!officialName.isValid()) {
                    officialName.errors.showAllMessages();
                }
                if(!officialUrl.isValid()) {
                    officialUrl.errors.showAllMessages();
                }
                this.validatingSpinner.stop();
                if(officialName.isValid() && officialUrl.isValid() && this.isValid()) {
                    var url = App.Routes.WebApi.Establishments.post();
                    var data = this.serializeData();
                    data.officialName = officialName.serializeData();
                    data.officialUrl = officialUrl.serializeData();
                    data.location = location.serializeData();
                    this.createSpinner.start();
                    $.post(url, data).done(function (response, statusText, xhr) {
                        window.location.href = App.Routes.Mvc.Shared.created({
                            location: xhr.getResponseHeader('Location')
                        });
                    }).fail(function (xhr, statusText, errorThrown) {
                        _this.createSpinner.stop();
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
        Item.prototype.serializeData = function () {
            var data = {
            };
            data.parentId = this.parentId();
            data.typeId = this.typeId();
            data.ceebCode = this.ceebCode();
            data.uCosmicCode = this.uCosmicCode();
            return data;
        };
        Item.prototype._loadScalars = function () {
            var deferred = $.Deferred();
            if(this.id) {
                $.get(App.Routes.WebApi.Establishments.get(this.id)).done(function (response, textStatus, jqXHR) {
                    deferred.resolve(response);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    deferred.reject(jqXHR, textStatus, errorThrown);
                });
            } else {
                deferred.resolve(undefined);
            }
            return deferred;
        };
        Item.prototype._pullScalars = function (response) {
            this.originalValues(response);
            if(response) {
                ko.mapping.fromJS(response, {
                    ignore: [
                        'id'
                    ]
                }, this);
            }
        };
        Item.prototype.clickToEditTypeId = function () {
            this.isEditingTypeId(true);
        };
        Item.prototype.clickToSaveTypeId = function () {
            var _this = this;
            if(!this.id) {
                return;
            }
            if(this.ceebCode.isValidating() || this.uCosmicCode.isValidating()) {
                this.typeIdValidatingSpinner.start();
                window.setTimeout(function () {
                    _this.clickToSaveTypeId();
                }, 50);
                return;
            }
            this.typeIdValidatingSpinner.stop();
            if(!this.isValid()) {
                this.errors.showAllMessages();
            } else {
                this.typeIdSaveSpinner.start();
                var data = this.serializeData();
                var originalValues = this.originalValues();
                data.parentId = originalValues.parentId;
                var url = App.Routes.WebApi.Establishments.put(this.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: data
                }).always(function () {
                    _this.typeIdSaveSpinner.stop();
                }).done(function (response, statusText, xhr) {
                    App.flasher.flash(response);
                    _this.typeIdSaveSpinner.stop();
                    _this.clickToCancelTypeIdEdit();
                });
            }
        };
        Item.prototype.clickToCancelTypeIdEdit = function () {
            var _this = this;
            this.isEditingTypeId(false);
            this._loadScalars().done(function (response) {
                _this._pullScalars(response);
            });
        };
        Item.prototype._setupSammy = function () {
            var _this = this;
            var self = this;
            this.parentSearch.sammyBeforeRoute = /\#\/select-parent\/page\/(.*)\//;
            this.parentSearch.sammyGetPageRoute = '#/select-parent/page/:pageNumber/';
            this.parentSearch.initDefaultPageRoute = false;
            this.parentSearch.setLocation = function () {
                var location = '#/select-parent/page/' + _this.parentSearch.pageNumber() + '/';
                if(_this.parentSearch.sammy.getLocation() !== location) {
                    _this.parentSearch.sammy.setLocation(location);
                }
            };
            this.parentSearch.clickAction = function (viewModel, e) {
                _this.parentEstablishment(viewModel);
                _this.parentId(viewModel.id());
                _this.sammy.setLocation('/Shared/' + _this.id + '/#/');
                return false;
            };
            this.parentSearch.detailHref = function () {
                return '#/';
            };
            this.parentSearch.detailTooltip = function () {
                return 'Choose this establishment as the parent';
            };
            this.parentSearch.sammy.run();
            this.sammy.get('/#/select-parent/page/:pageNumber/', function () {
                if(!self._findingParent) {
                    self._findingParent = true;
                    self._parentScrollTop = App.WindowScroller.getTop();
                    self.sideSwiper.next();
                    self.parentSearch.pageNumber(1);
                    self.parentSearch.transitionedPageNumber(1);
                } else {
                    self.parentSearch.getPage(this.params['pageNumber']);
                }
            });
            this.sammy.get('/Shared/:establishmentId/#/', function () {
                if(self._findingParent) {
                    self.sideSwiper.prev(1, function () {
                        App.WindowScroller.setTop(self._parentScrollTop);
                    });
                    self._findingParent = false;
                }
            });
            this.sammy.setLocation('#/');
        };
        Item.prototype._setupParentComputeds = function () {
            var _this = this;
            var parentId = this.parentId();
            this.isParentDirty = ko.computed(function () {
                var parentId = _this.parentId();
                var originalValues = _this.originalValues();
                if(!_this.id) {
                    return false;
                }
                if(originalValues) {
                    return parentId != originalValues.parentId;
                }
                return false;
            });
            this.hasParent = ko.computed(function () {
                return _this.parentId() !== undefined && _this.parentId() > 0;
            });
            this.isParentIdSaveDisabled = ko.computed(function () {
                return _this.parentId.isValidating() || _this.parentIdSaveSpinner.isVisible() || _this.parentIdValidatingSpinner.isVisible() || _this.parentId.error;
            });
            this.parentId.subscribe(function (newValue) {
                if(!newValue) {
                    _this.parentEstablishment(undefined);
                } else {
                    var url = App.Routes.WebApi.Establishments.get();
                    $.get(url, {
                        id: newValue
                    }).done(function (response) {
                        if(response && response.items && response.items.length) {
                            var parent = response.items[0];
                            _this.parentEstablishment(new SearchResult.SearchResult(parent, _this.parentSearch));
                        }
                    });
                }
            });
        };
        Item.prototype.clearParent = function (vm, e) {
            this.parentId(undefined);
            e.stopPropagation();
        };
        Item.prototype.clickToCancelParentIdEdit = function () {
            this.parentId(this.originalValues().parentId);
        };
        Item.prototype.clickToSaveParentId = function () {
            var _this = this;
            if(!this.id) {
                return;
            }
            if(this.parentId.isValidating()) {
                this.parentIdValidatingSpinner.start();
                window.setTimeout(function () {
                    _this.clickToSaveParentId();
                }, 50);
                return;
            }
            this.parentIdValidatingSpinner.stop();
            if(!this.isValid()) {
                this.errors.showAllMessages();
            } else {
                this.parentIdSaveSpinner.start();
                var data = this.serializeData();
                var originalValues = this.originalValues();
                data.typeId = originalValues.typeId;
                data.ceebCode = originalValues.ceebCode;
                data.uCosmicCode = originalValues.uCosmicCode;
                var url = App.Routes.WebApi.Establishments.put(this.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: data
                }).always(function () {
                    _this.parentIdSaveSpinner.stop();
                }).done(function (response, statusText, xhr) {
                    App.flasher.flash(response);
                    _this.parentIdSaveSpinner.stop();
                    var originalValues = _this.originalValues();
                    originalValues.parentId = data.parentId;
                    _this.originalValues(originalValues);
                });
            }
        };
        return Item;
    })();
    exports.Item = Item;    
})
