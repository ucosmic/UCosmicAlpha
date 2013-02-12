var ViewModels;
(function (ViewModels) {
    (function (My) {
        var Profile = (function () {
            function Profile() {
                var _this = this;
                this._isInitialized = false;
                this.photoSrc = ko.observable(App.Routes.WebApi.My.Profile.Photo.get(128));
                this.isDisplayNameDerived = ko.observable();
                this.displayName = ko.observable();
                this._userDisplayName = '';
                this.salutation = ko.observable();
                this.firstName = ko.observable();
                this.middleName = ko.observable();
                this.lastName = ko.observable();
                this.suffix = ko.observable();
                this.facultyRanks = ko.observableArray();
                this.facultyRankId = ko.observable();
                this.jobTitles = ko.observable();
                this.administrativeAppointments = ko.observable();
                this.gender = ko.observable();
                this.isActive = ko.observable();
                this.$photo = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this.editMode = ko.observable(false);
                this._initialize();
                this.isFacultyRanksVisible = ko.computed(function () {
                    return _this.facultyRanks() && _this.facultyRanks().length > 0;
                });
                this._setupValidation();
                this._setupKendoWidgets();
                this._setupDisplayNameDerivation();
            }
            Profile.prototype._initialize = function () {
                var _this = this;
                var facultyRanksPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get()).done(function (data, textStatus, jqXHR) {
                    facultyRanksPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    facultyRanksPact.reject(jqXHR, textStatus, errorThrown);
                });
                var viewModelPact = $.Deferred();
                $.get(App.Routes.WebApi.My.Profile.get()).done(function (data, textStatus, jqXHR) {
                    viewModelPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });
                $.when(facultyRanksPact, viewModelPact).then(function (facultyRanks, viewModel) {
                    _this.facultyRanks(facultyRanks);
                    ko.mapping.fromJS(viewModel, {
                    }, _this);
                    $(_this).trigger('ready');
                    _this._isInitialized = true;
                    _this.$facultyRanks().kendoDropDownList();
                }, function (xhr, textStatus, errorThrown) {
                });
            };
            Profile.prototype.startEditing = function () {
                this.editMode(true);
                if(this.$editSection.length) {
                    this.$editSection.slideDown();
                }
            };
            Profile.prototype.saveInfo = function (formElement) {
                var _this = this;
                if(!this.isValid()) {
                    this.errors.showAllMessages();
                } else {
                    var apiModel = ko.mapping.toJS(this);
                    $.ajax({
                        url: App.Routes.WebApi.My.Profile.put(),
                        type: 'PUT',
                        data: apiModel
                    }).done(function (responseText, statusText, xhr) {
                        App.flasher.flash(responseText);
                        if(_this.$editSection.length) {
                            _this.$editSection.slideUp();
                        }
                        _this.editMode(false);
                    }).fail(function () {
                    });
                }
            };
            Profile.prototype._setupValidation = function () {
                this.displayName.extend({
                    required: {
                        message: 'Display name is required.'
                    },
                    maxLength: 200
                });
                this.salutation.extend({
                    maxLength: 50
                });
                this.firstName.extend({
                    maxLength: 100
                });
                this.middleName.extend({
                    maxLength: 100
                });
                this.lastName.extend({
                    maxLength: 100
                });
                this.suffix.extend({
                    maxLength: 50
                });
                this.jobTitles.extend({
                    maxLength: 500
                });
                this.administrativeAppointments.extend({
                    maxLength: 500
                });
                ko.validation.group(this);
            };
            Profile.prototype._setupKendoWidgets = function () {
                var _this = this;
                this.$nameSalutation.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoComboBox({
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: App.Routes.WebApi.People.Names.Salutations.get()
                                    }
                                }
                            })
                        });
                    }
                });
                this.$nameSuffix.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoComboBox({
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: App.Routes.WebApi.People.Names.Suffixes.get()
                                    }
                                }
                            })
                        });
                    }
                });
                this.$photo.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoUpload({
                            multiple: false,
                            showFileList: false,
                            localization: {
                                select: 'Choose a photo to upload...'
                            },
                            async: {
                                saveUrl: App.Routes.WebApi.My.Profile.Photo.post(),
                                removeUrl: App.Routes.WebApi.My.Profile.Photo.kendoRemove()
                            },
                            success: function (e) {
                                _this.photoSrc(App.Routes.WebApi.My.Profile.Photo.get(128, null, true));
                            },
                            error: function (e) {
                                alert('there was an error');
                            }
                        });
                    }
                });
            };
            Profile.prototype._setupDisplayNameDerivation = function () {
                var _this = this;
                this.displayName.subscribe(function (newValue) {
                    if(!_this.isDisplayNameDerived()) {
                        _this._userDisplayName = newValue;
                    }
                });
                ko.computed(function () {
                    if(_this.isDisplayNameDerived() && _this._isInitialized) {
                        var data = ko.mapping.toJS(_this);
                        $.ajax({
                            url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                            type: 'GET',
                            cache: false,
                            data: data
                        }).done(function (result) {
                            _this.displayName(result);
                        });
                    } else {
                        if(_this._isInitialized) {
                            if(!_this._userDisplayName) {
                                _this._userDisplayName = _this.displayName();
                            }
                            _this.displayName(_this._userDisplayName);
                        }
                    }
                }).extend({
                    throttle: 400
                });
            };
            return Profile;
        })();
        My.Profile = Profile;        
    })(ViewModels.My || (ViewModels.My = {}));
    var My = ViewModels.My;
})(ViewModels || (ViewModels = {}));
