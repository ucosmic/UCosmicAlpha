var ViewModels;
(function (ViewModels) {
    (function (Employee) {
        var PersonalInfo = (function () {
            function PersonalInfo(inDocumentElementId, inDataContext) {
                this._isActive = ko.observable();
                this._isDisplayNameDerived = ko.observable();
                this._displayName = ko.observable();
                this._salutations = ko.observableArray();
                this._salutation = ko.observable();
                this._firstName = ko.observable();
                this._firstNameSubscription = null;
                this._middleName = ko.observable();
                this._lastName = ko.observable();
                this._lastNameSubscription = null;
                this._suffixes = ko.observableArray();
                this._suffix = ko.observable();
                this._workingTitle = ko.observable();
                this._gender = ko.observable();
                this._facultyRanks = ko.observableArray();
                this._facultyRank = ko.observable();
                this._administrativeAppointments = ko.observable();
                this._picture = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this._dataContext = inDataContext;
                this._initialize(inDocumentElementId);
                this.$nameSalutation.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoComboBox({
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: App.Routes.WebApi.People.NameSalutations.get()
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
                                        url: App.Routes.WebApi.People.NameSuffixes.get()
                                    }
                                }
                            })
                        });
                    }
                });
            }
            PersonalInfo.prototype.GetRevisionId = function () {
                return this._revisionId;
            };
            PersonalInfo.prototype.SetRevisionId = function (inValue) {
                this._revisionId = inValue;
            };
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
            PersonalInfo.prototype.GetSalutations = function () {
                return this._salutations();
            };
            PersonalInfo.prototype.SetSalutations = function (inValue) {
                this._salutations(inValue);
            };
            PersonalInfo.prototype.Salutations_Add = function (inSalutation) {
                this._salutations.push(inSalutation);
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
            PersonalInfo.prototype.GetSuffixes = function () {
                return this._suffixes();
            };
            PersonalInfo.prototype.SetSuffixes = function (inValue) {
                this._suffixes(inValue);
            };
            PersonalInfo.prototype.Suffixes_Add = function (inSuffix) {
                this._suffixes.push(inSuffix);
            };
            PersonalInfo.prototype.GetSuffix = function () {
                return this._suffix();
            };
            PersonalInfo.prototype.SetSuffix = function (inValue) {
                this._suffix(inValue);
            };
            PersonalInfo.prototype.GetWorkingTitle = function () {
                return this._workingTitle();
            };
            PersonalInfo.prototype.SetWorkingTitle = function (inValue) {
                this._workingTitle(inValue);
            };
            PersonalInfo.prototype.GetGender = function () {
                return this._gender();
            };
            PersonalInfo.prototype.SetGender = function (inValue) {
                this._gender(inValue);
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
            PersonalInfo.prototype.GetFacultyRank = function () {
                return this._facultyRank();
            };
            PersonalInfo.prototype.SetFacultyRank = function (inValue) {
                this._facultyRank(inValue);
            };
            PersonalInfo.prototype.GetAdministrativeAppointments = function () {
                return this._administrativeAppointments();
            };
            PersonalInfo.prototype.SetAdministrativeAppointments = function (inValue) {
                this._administrativeAppointments(inValue);
            };
            PersonalInfo.prototype.GetPicture = function () {
                return this._picture();
            };
            PersonalInfo.prototype.SetPicture = function (inValue) {
                this._picture(inValue);
            };
            PersonalInfo.prototype._initialize = function (inDocumentElementId) {
                var _this = this;
                var getSalutationsPact = this._dataContext.GetSalutations();
                getSalutationsPact.then(function (salutations) {
                    for(var i = 0; i < salutations.length; i += 1) {
                        _this.Salutations_Add(salutations[i]);
                    }
                }, function (error) {
                });
                var getSuffixesPact = this._dataContext.GetSuffixes();
                getSuffixesPact.then(function (suffixes) {
                    for(var i = 0; i < suffixes.length; i += 1) {
                        _this.Suffixes_Add(suffixes[i]);
                    }
                }, function (error) {
                });
                var getFacultyRanksPact = this._dataContext.GetFacultyRanks();
                getFacultyRanksPact.then(function (facultyRanks) {
                    for(var i = 0; i < facultyRanks.length; i += 1) {
                        _this.FacultyRanks_Add(facultyRanks[i]);
                    }
                }, function (error) {
                });
                $.when(getSalutationsPact, getSuffixesPact, getFacultyRanksPact).then(function (data) {
                    _this._dataContext.Get().then(function (data) {
                        _this.ToViewModel(_this, data);
                        ko.applyBindings(_this, $("#" + inDocumentElementId).get(0));
                        _this.$facultyRanks().kendoDropDownList();
                    }, function (data) {
                    });
                }, function (data) {
                });
            };
            PersonalInfo.prototype.ToViewModel = function (inSelf, data) {
                var me = inSelf;
                me.SetRevisionId(data.revisionId);
                me.SetIsActive(data.isActive);
                me.SetIsDisplayNameDerived(data.isDisplayNameDerived);
                me.SetDisplayName((data.displayName != null) ? data.displayName : "");
                me.SetSalutation((data.salutation != null) ? data.salutation : "");
                me.SetFirstName((data.firstName != null) ? data.firstName : "");
                me.SetMiddleName((data.middleName != null) ? data.middleName : "");
                me.SetLastName((data.lastName != null) ? data.lastName : "");
                me.SetSuffix((data.suffix != null) ? data.suffix : "");
                me.SetWorkingTitle((data.workingTitle != null) ? data.workingTitle : "");
                me.SetGender(data.gender);
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
                me.SetAdministrativeAppointments((data.administrativeAppointments != null) ? data.administrativeAppointments : "");
                me.SetPicture(data.picture);
            };
            PersonalInfo.prototype.FromViewModel = function (inSelf) {
                var me = inSelf;
                return {
                    revisionId: me.GetRevisionId(),
                    isActive: me.GetIsActive(),
                    isDisplayNameDerived: me.GetIsDisplayNameDerived(),
                    displayName: (me.GetDisplayName().length > 0) ? me.GetDisplayName() : null,
                    salutation: (me.GetSalutation().length > 0) ? me.GetSalutation() : null,
                    firstName: (me.GetFirstName().length > 0) ? me.GetFirstName() : null,
                    middleName: (me.GetMiddleName().length > 0) ? me.GetMiddleName() : null,
                    lastName: (me.GetLastName().length > 0) ? me.GetLastName() : null,
                    suffix: (me.GetSuffix().length > 0) ? me.GetSuffix() : null,
                    workingTitle: me.GetWorkingTitle(),
                    gender: me.GetGender(),
                    employeeFacultyRank: (me.GetFacultyRank() != null) ? {
                        id: me.GetFacultyRank().id,
                        rank: me.GetFacultyRank().rank
                    } : null,
                    administrativeAppointments: (me.GetAdministrativeAppointments().length > 0) ? me.GetAdministrativeAppointments() : null,
                    picture: me.GetPicture()
                };
            };
            PersonalInfo.prototype.saveInfo = function (formElement) {
                this.DeriveDisplayName();
                this._dataContext.Put(this.FromViewModel(this)).then(function (data) {
                }, function (errorThrown) {
                });
                $("#accordion").accordion('activate', 1);
            };
            PersonalInfo.prototype.saveEmails = function (formElement) {
                $("#accordion").accordion('activate', 2);
            };
            PersonalInfo.prototype.saveAffiliations = function (formElement) {
                $("#accordion").accordion('activate', 3);
            };
            PersonalInfo.prototype.savePicture = function (formElement) {
                $("#accordion").accordion('activate', 0);
            };
            PersonalInfo.prototype.derivedNameClickHandler = function (model, event) {
                if(model.GetIsDisplayNameDerived()) {
                    $("#displayName").attr("disabled", "disabled");
                    model._firstNameSubscription = model._firstName.subscribe(function (inValue) {
                        model.DeriveDisplayName(model);
                    });
                    model._lastNameSubscription = model._lastName.subscribe(function (inValue) {
                        model.DeriveDisplayName(model);
                    });
                    model.DeriveDisplayName(model);
                } else {
                    $("#displayName").removeAttr("disabled");
                    model._firstNameSubscription.dispose();
                    model._lastNameSubscription.dispose();
                }
                return true;
            };
            PersonalInfo.prototype.DeriveDisplayName = function (inModel) {
                var me = (inModel != null) ? inModel : this;
                me.SetDisplayName(me.GetFirstName() + " " + me.GetLastName());
            };
            return PersonalInfo;
        })();
        Employee.PersonalInfo = PersonalInfo;        
    })(ViewModels.Employee || (ViewModels.Employee = {}));
    var Employee = ViewModels.Employee;
})(ViewModels || (ViewModels = {}));
