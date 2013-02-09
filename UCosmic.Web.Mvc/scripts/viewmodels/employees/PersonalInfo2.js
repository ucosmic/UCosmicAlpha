var ViewModels;
(function (ViewModels) {
    (function (Employee) {
        var PersonalInfo2 = (function () {
            function PersonalInfo2(inDocumentElementId, inDataContext) {
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
                this.employeeFacultyRankId = ko.observable();
                this.employeeJobTitles = ko.observable();
                this.employeeAdministrativeAppointments = ko.observable();
                this.gender = ko.observable();
                this.isActive = ko.observable();
                this.$photo = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this._dataContext = inDataContext;
                this._initialize(inDocumentElementId);
                this._setupKendoWidgets();
                this._setupDisplayNameDerivation();
            }
            PersonalInfo2.prototype._initialize = function (inDocumentElementId) {
                var _this = this;
                var facultyRanksPact = this._dataContext.GetFacultyRanks();
                var viewModelPact = this._dataContext.Get();
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
            PersonalInfo2.prototype.saveInfo = function (formElement) {
                var apiModel = ko.mapping.toJS(this);
                apiModel.revisionId = this._revisionId;
                apiModel.employeeId = this._employeeId;
                this._dataContext.Put(apiModel).then(function (data) {
                }, function (errorThrown) {
                });
                $("#accordion").accordion('activate', 1);
            };
            PersonalInfo2.prototype.savePicture = function (formElement) {
                $("#accordion").accordion('activate', 0);
            };
            PersonalInfo2.prototype._setupKendoWidgets = function () {
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
            PersonalInfo2.prototype._setupDisplayNameDerivation = function () {
                var _this = this;
                this.displayName.subscribe(function (newValue) {
                    if(!_this.isDisplayNameDerived()) {
                        _this._userDisplayName = newValue;
                    } else {
                        if(_this.isDisplayNameDerived() && !_this._userDisplayName) {
                            _this._userDisplayName = _this.displayName();
                        }
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
                            _this.displayName(_this._userDisplayName);
                        }
                    }
                }).extend({
                    throttle: 400
                });
            };
            return PersonalInfo2;
        })();
        Employee.PersonalInfo2 = PersonalInfo2;        
    })(ViewModels.Employee || (ViewModels.Employee = {}));
    var Employee = ViewModels.Employee;
})(ViewModels || (ViewModels = {}));
