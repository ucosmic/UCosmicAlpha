var ViewModels;
(function (ViewModels) {
    (function (Employee) {
        var PersonalInfo = (function () {
            function PersonalInfo(inDocumentElementId, inDataContext) {
                this._isInitialized = false;
                this._isActive = ko.observable();
                this._isDisplayNameDerived = ko.observable();
                this._displayName = ko.observable();
                this._userDisplayName = '';
                this._salutation = ko.observable();
                this._firstName = ko.observable();
                this._firstNameSubscription = null;
                this._middleName = ko.observable();
                this._lastName = ko.observable();
                this._lastNameSubscription = null;
                this._suffix = ko.observable();
                this._gender = ko.observable();
                this._picture = ko.observable();
                this._jobTitles = ko.observable();
                this._facultyRanks = ko.observableArray();
                this._facultyRankId = ko.observable();
                this._administrativeAppointments = ko.observable();
                this.$photo = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this._dataContext = inDataContext;
                this._initialize(inDocumentElementId);
                this._setupKendoWidgets();
                this._setupDisplayNameDerivation();
            }
            PersonalInfo.prototype.GetIsActive = function () {
                return this._isActive();
            };
            PersonalInfo.prototype.SetIsActive = function (inValue) {
                this._isActive(inValue);
            };
            PersonalInfo.prototype.GetIsDisplayNameDerived = function () {
                return this._isDisplayNameDerived();
            };
            PersonalInfo.prototype.SetIsDisplayNameDerived = function (inValue) {
                this._isDisplayNameDerived(inValue);
            };
            PersonalInfo.prototype.GetDisplayName = function () {
                return this._displayName();
            };
            PersonalInfo.prototype.SetDisplayName = function (inValue) {
                this._displayName(inValue);
            };
            PersonalInfo.prototype.GetSalutation = function () {
                return this._salutation();
            };
            PersonalInfo.prototype.SetSalutation = function (inValue) {
                this._salutation(inValue);
            };
            PersonalInfo.prototype.GetFirstName = function () {
                return this._firstName();
            };
            PersonalInfo.prototype.SetFirstName = function (inValue) {
                this._firstName(inValue);
            };
            PersonalInfo.prototype.GetMiddleName = function () {
                return this._middleName();
            };
            PersonalInfo.prototype.SetMiddleName = function (inValue) {
                this._middleName(inValue);
            };
            PersonalInfo.prototype.GetLastName = function () {
                return this._lastName();
            };
            PersonalInfo.prototype.SetLastName = function (inValue) {
                this._lastName(inValue);
            };
            PersonalInfo.prototype.GetSuffix = function () {
                return this._suffix();
            };
            PersonalInfo.prototype.SetSuffix = function (inValue) {
                this._suffix(inValue);
            };
            PersonalInfo.prototype.GetGender = function () {
                return this._gender();
            };
            PersonalInfo.prototype.SetGender = function (inValue) {
                this._gender(inValue);
            };
            PersonalInfo.prototype.GetPicture = function () {
                return this._picture();
            };
            PersonalInfo.prototype.SetPicture = function (inValue) {
                this._picture(inValue);
            };
            PersonalInfo.prototype.GetJobTitles = function () {
                return this._jobTitles();
            };
            PersonalInfo.prototype.SetJobTitles = function (inValue) {
                this._jobTitles(inValue);
            };
            PersonalInfo.prototype.GetFacultyRanks = function () {
                return this._facultyRanks();
            };
            PersonalInfo.prototype.SetFacultyRanks = function (inValue) {
                this._facultyRanks(inValue);
            };
            PersonalInfo.prototype.FacultyRanks_Add = function (inRank) {
                this._facultyRanks.push(inRank);
            };
            PersonalInfo.prototype.GetFacultyRankId = function () {
                return this._facultyRankId();
            };
            PersonalInfo.prototype.SetFacultyRankId = function (inValue) {
                this._facultyRankId(inValue);
            };
            PersonalInfo.prototype.GetAdministrativeAppointments = function () {
                return this._administrativeAppointments();
            };
            PersonalInfo.prototype.SetAdministrativeAppointments = function (inValue) {
                this._administrativeAppointments(inValue);
            };
            PersonalInfo.prototype._initialize = function (inDocumentElementId) {
                var _this = this;
                var getFacultyRanksPact = this._dataContext.GetFacultyRanks();
                getFacultyRanksPact.then(function (facultyRanks) {
                    for(var i = 0; i < facultyRanks.length; i += 1) {
                        _this.FacultyRanks_Add(facultyRanks[i]);
                    }
                }, function (error) {
                });
                $.when(getFacultyRanksPact).then(function (data) {
                    _this._dataContext.Get().then(function (data) {
                        _this.ToViewModel(_this, data);
                        ko.applyBindings(_this, $("#" + inDocumentElementId).get(0));
                        _this._isInitialized = true;
                        _this.$facultyRanks().kendoDropDownList();
                    }, function (data) {
                    });
                }, function (data) {
                });
            };
            PersonalInfo.prototype.ToViewModel = function (inSelf, data) {
                var me = inSelf;
                me._personId = data.revisionId;
                me.SetIsActive(data.isActive);
                me.SetIsDisplayNameDerived(data.isDisplayNameDerived);
                me.SetDisplayName((data.displayName != null) ? data.displayName : "");
                me.SetSalutation((data.salutation != null) ? data.salutation : "");
                me.SetFirstName((data.firstName != null) ? data.firstName : "");
                me.SetMiddleName((data.middleName != null) ? data.middleName : "");
                me.SetLastName((data.lastName != null) ? data.lastName : "");
                me.SetSuffix((data.suffix != null) ? data.suffix : "");
                me.SetJobTitles((data.jobTitles != null) ? data.jobTitles : "");
                me.SetGender(data.gender);
                me._employeeId = data.employeeId;
                me.SetFacultyRankId(data.facultyRankId);
                me.SetAdministrativeAppointments((data.administrativeAppointments != null) ? data.administrativeAppointments : "");
                me.SetPicture(data.picture);
            };
            PersonalInfo.prototype.FromViewModel = function (inSelf) {
                var me = inSelf;
                return {
                    revisionId: me._personId,
                    isActive: me.GetIsActive(),
                    isDisplayNameDerived: me.GetIsDisplayNameDerived(),
                    displayName: (me.GetDisplayName().length > 0) ? me.GetDisplayName() : null,
                    salutation: (me.GetSalutation().length > 0) ? me.GetSalutation() : null,
                    firstName: (me.GetFirstName().length > 0) ? me.GetFirstName() : null,
                    middleName: (me.GetMiddleName().length > 0) ? me.GetMiddleName() : null,
                    lastName: (me.GetLastName().length > 0) ? me.GetLastName() : null,
                    suffix: (me.GetSuffix().length > 0) ? me.GetSuffix() : null,
                    jobTitles: me.GetJobTitles(),
                    gender: me.GetGender(),
                    employeeId: me._employeeId,
                    facultyRankId: me.GetFacultyRankId(),
                    administrativeAppointments: (me.GetAdministrativeAppointments().length > 0) ? me.GetAdministrativeAppointments() : null,
                    picture: me.GetPicture()
                };
            };
            PersonalInfo.prototype.saveInfo = function (formElement) {
                this._dataContext.Put(this.FromViewModel(this)).then(function (data) {
                }, function (errorThrown) {
                });
                $("#accordion").accordion('activate', 1);
            };
            PersonalInfo.prototype.savePicture = function (formElement) {
                $("#accordion").accordion('activate', 0);
            };
            PersonalInfo.prototype._setupKendoWidgets = function () {
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
            PersonalInfo.prototype._setupDisplayNameDerivation = function () {
                var _this = this;
                this._displayName.subscribe(function (newValue) {
                    if(!_this._isDisplayNameDerived()) {
                        _this._userDisplayName = newValue;
                    }
                });
                ko.computed(function () {
                    if(_this._isDisplayNameDerived() && _this._isInitialized) {
                        var data = {
                            salutation: _this._salutation(),
                            firstName: _this._firstName(),
                            middleName: _this._middleName(),
                            lastName: _this._lastName(),
                            suffix: _this._suffix()
                        };
                        $.ajax({
                            url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                            type: 'GET',
                            cache: false,
                            data: data
                        }).done(function (result) {
                            _this._displayName(result);
                        });
                    } else {
                        if(_this._isInitialized) {
                            _this._displayName(_this._userDisplayName);
                        }
                    }
                }).extend({
                    throttle: 400
                });
            };
            return PersonalInfo;
        })();
        Employee.PersonalInfo = PersonalInfo;        
    })(ViewModels.Employee || (ViewModels.Employee = {}));
    var Employee = ViewModels.Employee;
})(ViewModels || (ViewModels = {}));
