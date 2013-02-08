var ViewModels;
(function (ViewModels) {
    (function (Employee) {
        var PersonalInfo3 = (function () {
            function PersonalInfo3(inDocumentElementId, inDataContext) {
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
                this._facultyRank = ko.observable();
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
            PersonalInfo3.prototype.GetIsActive = function () {
                return this._isActive();
            };
            PersonalInfo3.prototype.SetIsActive = function (inValue) {
                this._isActive(inValue);
            };
            PersonalInfo3.prototype.GetIsDisplayNameDerived = function () {
                return this._isDisplayNameDerived();
            };
            PersonalInfo3.prototype.SetIsDisplayNameDerived = function (inValue) {
                this._isDisplayNameDerived(inValue);
            };
            PersonalInfo3.prototype.GetDisplayName = function () {
                return this._displayName();
            };
            PersonalInfo3.prototype.SetDisplayName = function (inValue) {
                this._displayName(inValue);
            };
            PersonalInfo3.prototype.GetSalutation = function () {
                return this._salutation();
            };
            PersonalInfo3.prototype.SetSalutation = function (inValue) {
                this._salutation(inValue);
            };
            PersonalInfo3.prototype.GetFirstName = function () {
                return this._firstName();
            };
            PersonalInfo3.prototype.SetFirstName = function (inValue) {
                this._firstName(inValue);
            };
            PersonalInfo3.prototype.GetMiddleName = function () {
                return this._middleName();
            };
            PersonalInfo3.prototype.SetMiddleName = function (inValue) {
                this._middleName(inValue);
            };
            PersonalInfo3.prototype.GetLastName = function () {
                return this._lastName();
            };
            PersonalInfo3.prototype.SetLastName = function (inValue) {
                this._lastName(inValue);
            };
            PersonalInfo3.prototype.GetSuffix = function () {
                return this._suffix();
            };
            PersonalInfo3.prototype.SetSuffix = function (inValue) {
                this._suffix(inValue);
            };
            PersonalInfo3.prototype.GetGender = function () {
                return this._gender();
            };
            PersonalInfo3.prototype.SetGender = function (inValue) {
                this._gender(inValue);
            };
            PersonalInfo3.prototype.GetPicture = function () {
                return this._picture();
            };
            PersonalInfo3.prototype.SetPicture = function (inValue) {
                this._picture(inValue);
            };
            PersonalInfo3.prototype.GetJobTitles = function () {
                return this._jobTitles();
            };
            PersonalInfo3.prototype.SetJobTitles = function (inValue) {
                this._jobTitles(inValue);
            };
            PersonalInfo3.prototype.GetFacultyRanks = function () {
                return this._facultyRanks();
            };
            PersonalInfo3.prototype.SetFacultyRanks = function (inValue) {
                this._facultyRanks(inValue);
            };
            PersonalInfo3.prototype.FacultyRanks_Add = function (inRank) {
                this._facultyRanks.push(inRank);
            };
            PersonalInfo3.prototype.GetFacultyRank = function () {
                return this._facultyRank();
            };
            PersonalInfo3.prototype.SetFacultyRank = function (inValue) {
                this._facultyRank(inValue);
            };
            PersonalInfo3.prototype.GetAdministrativeAppointments = function () {
                return this._administrativeAppointments();
            };
            PersonalInfo3.prototype.SetAdministrativeAppointments = function (inValue) {
                this._administrativeAppointments(inValue);
            };
            PersonalInfo3.prototype._initialize = function (inDocumentElementId) {
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
            PersonalInfo3.prototype.ToViewModel = function (inSelf, data) {
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
                me.SetJobTitles((data.employeeJobTitles != null) ? data.employeeJobTitles : "");
                me.SetGender(data.gender);
                me._employeeId = data.employeeId;
                if(data.employeeFacultyRank != null) {
                    var i = 0;
                    while((i < me.GetFacultyRanks().length) && (me.GetFacultyRanks()[i].id != data.employeeFacultyRank.id)) {
                        i += 1;
                    }
                    if(i < me.GetFacultyRanks().length) {
                        me.SetFacultyRank(me.GetFacultyRanks()[i]);
                    }
                } else {
                    me.SetFacultyRank(null);
                }
                me.SetAdministrativeAppointments((data.employeeAdministrativeAppointments != null) ? data.employeeAdministrativeAppointments : "");
                me.SetPicture(data.picture);
            };
            PersonalInfo3.prototype.FromViewModel = function (inSelf) {
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
                    employeeJobTitles: me.GetJobTitles(),
                    gender: me.GetGender(),
                    employeeId: me._employeeId,
                    employeeFacultyRank: (me.GetFacultyRank() != null) ? {
                        id: me.GetFacultyRank().id,
                        rank: me.GetFacultyRank().rank
                    } : null,
                    employeeAdministrativeAppointments: (me.GetAdministrativeAppointments().length > 0) ? me.GetAdministrativeAppointments() : null,
                    picture: me.GetPicture()
                };
            };
            PersonalInfo3.prototype.saveInfo = function (formElement) {
                this._dataContext.Put(this.FromViewModel(this)).then(function (data) {
                }, function (errorThrown) {
                });
                $("#accordion").accordion('activate', 1);
            };
            PersonalInfo3.prototype.savePicture = function (formElement) {
                $("#accordion").accordion('activate', 0);
            };
            PersonalInfo3.prototype._setupKendoWidgets = function () {
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
            PersonalInfo3.prototype._setupDisplayNameDerivation = function () {
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
            return PersonalInfo3;
        })();
        Employee.PersonalInfo3 = PersonalInfo3;        
    })(ViewModels.Employee || (ViewModels.Employee = {}));
    var Employee = ViewModels.Employee;
})(ViewModels || (ViewModels = {}));
