var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var ServerUrlApiModel = (function () {
            function ServerUrlApiModel(ownerId) {
                this.id = 0;
                this.ownerId = 0;
                this.value = '';
                this.isOfficialUrl = false;
                this.isFormerUrl = false;
                this.ownerId = ownerId;
            }
            return ServerUrlApiModel;
        })();
        Establishments.ServerUrlApiModel = ServerUrlApiModel;        
        var EstablishmentUrlValueValidator = (function () {
            function EstablishmentUrlValueValidator() {
                this._ruleName = 'validEstablishmentUrlValue';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            EstablishmentUrlValueValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if(!vm.isValueValidatableAsync()) {
                    callback(true);
                } else {
                    if(!this._isAwaitingResponse && vm.value()) {
                        var route = App.Routes.WebApi.Establishments.Urls.validateValue(vm.ownerId(), vm.id());
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
                    }
                }
            };
            return EstablishmentUrlValueValidator;
        })();        
        new EstablishmentUrlValueValidator();
        var Url = (function () {
            function Url(js, owner) {
                var _this = this;
                this.id = ko.observable();
                this.ownerId = ko.observable();
                this.value = ko.observable();
                this.isOfficialUrl = ko.observable();
                this.isFormerUrl = ko.observable();
                this.editMode = ko.observable();
                this.$valueElement = undefined;
                this.$confirmPurgeDialog = undefined;
                this.saveSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, false));
                this.purgeSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, false));
                this.valueValidationSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, false));
                this.saveEditorClicked = false;
                this.owner = owner;
                if(!js) {
                    js = new ServerUrlApiModel(this.owner.id);
                }
                if(js.id === 0) {
                    js.ownerId = this.owner.id;
                }
                this.originalValues = js;
                ko.mapping.fromJS(js, {
                }, this);
                this.isOfficialUrlEnabled = ko.computed(function () {
                    return !_this.originalValues.isOfficialUrl;
                });
                this.isValueValidatableAsync = ko.computed(function () {
                    return _this.value() !== _this.originalValues.value;
                });
                this.value.extend({
                    maxLength: 200,
                    validEstablishmentUrlValue: this
                });
                if(this.owner.id) {
                    this.value.extend({
                        required: {
                            message: 'Establishment URL is required.'
                        }
                    });
                }
                this.value.isValidating.subscribe(function (isValidating) {
                    if(isValidating) {
                        _this.valueValidationSpinner.start();
                    } else {
                        _this.valueValidationSpinner.stop();
                        if(_this.saveEditorClicked) {
                            _this.saveEditor();
                        }
                    }
                });
                this.isOfficialUrl.subscribe(function (newValue) {
                    if(newValue) {
                        _this.isFormerUrl(false);
                    }
                });
                this.valueHref = ko.computed(function () {
                    var url = _this.value();
                    if(!url) {
                        return url;
                    }
                    return 'http://' + url;
                });
                this.mutationSuccess = function (response) {
                    _this.owner.requestUrls(function () {
                        _this.owner.editingUrl(0);
                        _this.editMode(false);
                        _this.saveSpinner.stop();
                        _this.purgeSpinner.stop();
                        App.flasher.flash(response);
                    });
                };
                this.mutationError = function (xhr) {
                    if(xhr.status === 400) {
                        _this.owner.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                        _this.owner.$genericAlertDialog.dialog({
                            title: 'Alert Message',
                            dialogClass: 'jquery-ui',
                            width: 'auto',
                            resizable: false,
                            modal: true,
                            buttons: {
                                'Ok': function () {
                                    _this.owner.$genericAlertDialog.dialog('close');
                                }
                            }
                        });
                    }
                    _this.saveSpinner.stop();
                    _this.purgeSpinner.stop();
                };
                ko.validation.group(this);
            }
            Url.prototype.clickLink = function (vm, e) {
                e.stopPropagation();
                return true;
            };
            Url.prototype.clickOfficialUrlCheckbox = function () {
                var _this = this;
                if(this.originalValues.isOfficialUrl) {
                    this.owner.$genericAlertDialog.find('p.content').html('In order to choose a different official URL for this establishment, edit the URL you wish to make the new official URL.');
                    this.owner.$genericAlertDialog.dialog({
                        title: 'Alert Message',
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: {
                            'Ok': function () {
                                _this.owner.$genericAlertDialog.dialog('close');
                            }
                        }
                    });
                }
                return true;
            };
            Url.prototype.showEditor = function () {
                var editingUrl = this.owner.editingUrl();
                if(!editingUrl) {
                    this.owner.editingUrl(this.id() || -1);
                    this.editMode(true);
                    this.$valueElement.trigger('autosize');
                    this.$valueElement.focus();
                }
            };
            Url.prototype.saveEditor = function () {
                this.saveEditorClicked = true;
                if(!this.isValid()) {
                    this.saveEditorClicked = false;
                    this.errors.showAllMessages();
                } else {
                    if(!this.value.isValidating()) {
                        this.saveEditorClicked = false;
                        this.saveSpinner.start();
                        if(this.id()) {
                            $.ajax({
                                url: App.Routes.WebApi.Establishments.Urls.put(this.owner.id, this.id()),
                                type: 'PUT',
                                data: this.serializeData()
                            }).done(this.mutationSuccess).fail(this.mutationError);
                        } else {
                            if(this.owner.id) {
                                $.ajax({
                                    url: App.Routes.WebApi.Establishments.Urls.post(this.owner.id),
                                    type: 'POST',
                                    data: this.serializeData()
                                }).done(this.mutationSuccess).fail(this.mutationError);
                            }
                        }
                    }
                }
            };
            Url.prototype.cancelEditor = function () {
                this.owner.editingUrl(0);
                if(this.id()) {
                    ko.mapping.fromJS(this.originalValues, {
                    }, this);
                    this.editMode(false);
                } else {
                    this.owner.urls.shift();
                }
            };
            Url.prototype.purge = function (vm, e) {
                var _this = this;
                e.stopPropagation();
                if(this.owner.editingUrl()) {
                    return;
                }
                if(this.isOfficialUrl()) {
                    this.owner.$genericAlertDialog.find('p.content').html('You cannot delete an establishment\'s official URL.<br />To delete this URL, first assign another URL as official.');
                    this.owner.$genericAlertDialog.dialog({
                        title: 'Alert Message',
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: {
                            'Ok': function () {
                                _this.owner.$genericAlertDialog.dialog('close');
                            }
                        }
                    });
                    return;
                }
                this.purgeSpinner.start();
                var shouldRemainSpinning = false;
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    close: function () {
                        if(!shouldRemainSpinning) {
                            _this.purgeSpinner.stop();
                        }
                    },
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: function () {
                                shouldRemainSpinning = true;
                                _this.$confirmPurgeDialog.dialog('close');
                                $.ajax({
                                    url: App.Routes.WebApi.Establishments.Urls.del(_this.owner.id, _this.id()),
                                    type: 'DELETE'
                                }).done(_this.mutationSuccess).fail(_this.mutationError);
                            }
                        }, 
                        {
                            text: 'No, cancel delete',
                            click: function () {
                                _this.$confirmPurgeDialog.dialog('close');
                                _this.purgeSpinner.stop();
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };
            Url.prototype.serializeData = function () {
                return {
                    id: this.id(),
                    ownerId: this.ownerId(),
                    value: $.trim(this.value()),
                    isOfficialUrl: this.isOfficialUrl(),
                    isFormerUrl: this.isFormerUrl()
                };
            };
            return Url;
        })();
        Establishments.Url = Url;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
