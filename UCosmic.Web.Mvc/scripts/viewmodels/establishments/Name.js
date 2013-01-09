var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var ServerNameApiModel = (function () {
            function ServerNameApiModel(ownerId) {
                this.id = 0;
                this.ownerId = 0;
                this.text = '';
                this.isOfficialName = false;
                this.isFormerName = false;
                this.languageCode = '';
                this.languageName = '';
                this.ownerId = ownerId;
            }
            return ServerNameApiModel;
        })();
        Establishments.ServerNameApiModel = ServerNameApiModel;        
        var EstablishmentNameTextValidator = (function () {
            function EstablishmentNameTextValidator() {
                this._ruleName = 'validEstablishmentNameText';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            EstablishmentNameTextValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if(!vm.isTextValidatableAsync()) {
                    callback(true);
                } else {
                    if(!this._isAwaitingResponse) {
                        var route = App.Routes.WebApi.Establishments.Names.validateText(vm.ownerId(), vm.id());
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
            return EstablishmentNameTextValidator;
        })();        
        new EstablishmentNameTextValidator();
        var Name = (function () {
            function Name(js, owner) {
                var _this = this;
                this.id = ko.observable();
                this.ownerId = ko.observable();
                this.text = ko.observable();
                this.isOfficialName = ko.observable();
                this.isFormerName = ko.observable();
                this.languageName = ko.observable();
                this.languageCode = ko.observable();
                this.editMode = ko.observable();
                this.$textElement = undefined;
                this.$languagesElement = undefined;
                this.$confirmPurgeDialog = undefined;
                this.saveSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, false));
                this.purgeSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, false));
                this.textValidationSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, false));
                this.saveEditorClicked = false;
                this.owner = owner;
                if(!js) {
                    js = new ServerNameApiModel(this.owner.id);
                }
                if(js.id === 0) {
                    js.ownerId = this.owner.id;
                }
                this.originalValues = js;
                ko.mapping.fromJS(js, {
                }, this);
                this.isOfficialNameEnabled = ko.computed(function () {
                    return !_this.originalValues.isOfficialName;
                });
                this.isTextValidatableAsync = ko.computed(function () {
                    return _this.text() !== _this.originalValues.text;
                });
                this.text.extend({
                    required: {
                        message: 'Establishment name is required.'
                    },
                    maxLength: 400,
                    validEstablishmentNameText: this
                });
                this.text.isValidating.subscribe(function (isValidating) {
                    if(isValidating) {
                        _this.textValidationSpinner.start();
                    } else {
                        _this.textValidationSpinner.stop();
                        if(_this.saveEditorClicked) {
                            _this.saveEditor();
                        }
                    }
                });
                this.selectedLanguageCode = ko.observable(this.originalValues.languageCode);
                this.owner.languages.subscribe(function () {
                    _this.selectedLanguageCode(_this.languageCode());
                });
                this.isOfficialName.subscribe(function (newValue) {
                    if(newValue) {
                        _this.isFormerName(false);
                    }
                });
                this.mutationSuccess = function (response) {
                    _this.owner.requestNames(function () {
                        _this.owner.editingName(0);
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
            Name.prototype.clickOfficialNameCheckbox = function () {
                var _this = this;
                if(this.originalValues.isOfficialName) {
                    this.owner.$genericAlertDialog.find('p.content').html('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
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
            Name.prototype.showEditor = function () {
                var editingName = this.owner.editingName();
                if(!editingName) {
                    this.owner.editingName(this.id() || -1);
                    this.editMode(true);
                    this.$textElement.trigger('autosize');
                    this.$textElement.focus();
                }
            };
            Name.prototype.saveEditor = function () {
                this.saveEditorClicked = true;
                if(!this.isValid()) {
                    this.saveEditorClicked = false;
                    this.errors.showAllMessages();
                } else {
                    if(!this.text.isValidating()) {
                        this.saveEditorClicked = false;
                        this.saveSpinner.start();
                        if(this.id()) {
                            $.ajax({
                                url: App.Routes.WebApi.Establishments.Names.put(this.owner.id, this.id()),
                                type: 'PUT',
                                data: this.serializeData()
                            }).done(this.mutationSuccess).fail(this.mutationError);
                        } else {
                            if(this.owner.id) {
                                $.ajax({
                                    url: App.Routes.WebApi.Establishments.Names.post(this.owner.id),
                                    type: 'POST',
                                    data: this.serializeData()
                                }).done(this.mutationSuccess).fail(this.mutationError);
                            }
                        }
                    }
                }
            };
            Name.prototype.cancelEditor = function () {
                this.owner.editingName(0);
                if(this.id()) {
                    ko.mapping.fromJS(this.originalValues, {
                    }, this);
                    this.editMode(false);
                } else {
                    this.owner.names.shift();
                }
            };
            Name.prototype.purge = function (vm, e) {
                var _this = this;
                e.stopPropagation();
                if(this.owner.editingName()) {
                    return;
                }
                if(this.isOfficialName()) {
                    this.owner.$genericAlertDialog.find('p.content').html('You cannot delete an establishment\'s official name.<br />To delete this name, first assign another name as official.');
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
                                    url: App.Routes.WebApi.Establishments.Names.del(_this.owner.id, _this.id()),
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
            Name.prototype.serializeData = function () {
                return {
                    id: this.id(),
                    ownerId: this.ownerId(),
                    text: $.trim(this.text()),
                    isOfficialName: this.isOfficialName(),
                    isFormerName: this.isFormerName(),
                    languageCode: this.selectedLanguageCode()
                };
            };
            return Name;
        })();
        Establishments.Name = Name;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
