var ViewModels;
(function (ViewModels) {
    (function (My) {
        var Profile = (function () {
            function Profile() {
                this._isInitialized = false;
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
                this._initialize();
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
                    _this._revisionId = viewModel.revisionId;
                    _this._employeeId = viewModel.employeeId;
                    var viewModelMapping = {
                        ignore: [
                            'revisionId', 
                            'employeeId'
                        ]
                    };
                    ko.mapping.fromJS(viewModel, viewModelMapping, _this);
                    $(_this).trigger('ready');
                    _this._isInitialized = true;
                    _this.$facultyRanks().kendoDropDownList();
                }, function (xhr, textStatus, errorThrown) {
                });
            };
            Profile.prototype.saveInfo = function (formElement) {
                var apiModel = ko.mapping.toJS(this);
                apiModel.revisionId = this._revisionId;
                apiModel.employeeId = this._employeeId;
                $.ajax({
                    url: App.Routes.WebApi.My.Profile.put(),
                    type: 'PUT',
                    data: apiModel
                }).done(function () {
                }).fail(function () {
                });
                $("#accordion").accordion('activate', 1);
            };
            Profile.prototype.savePicture = function (formElement) {
                $("#accordion").accordion('activate', 0);
            };
            Profile.prototype._setupKendoWidgets = function () {
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
                            localization: {
                                select: 'Choose a photo to upload...'
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
