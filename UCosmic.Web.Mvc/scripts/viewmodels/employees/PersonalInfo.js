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
                this._middleName = ko.observable();
                this._lastName = ko.observable();
                this._suffix = ko.observable();
                this._workingTitle = ko.observable();
                this._gender = ko.observable();
                this._facultyRanks = ko.observableArray();
                this._facultyRank = ko.observable();
                this._administrativeAppointments = ko.observable();
                this._picture = ko.observable();
                this._dataContext = inDataContext;
                this._initialize(inDocumentElementId);
            }
            Object.defineProperty(PersonalInfo.prototype, "RevisionId", {
                get: function () {
                    return this._revisionId;
                },
                set: function (inValue) {
                    this._revisionId = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "IsActive", {
                get: function () {
                    return this._isActive;
                },
                set: function (inValue) {
                    this._isActive = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "IsDisplayNameDerived", {
                get: function () {
                    return this._isDisplayNameDerived;
                },
                set: function (inValue) {
                    this._isDisplayNameDerived = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "DisplayName", {
                get: function () {
                    return this._displayName;
                },
                set: function (inValue) {
                    this._displayName = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "Salutations", {
                get: function () {
                    return this._salutations;
                },
                set: function (inValue) {
                    this._salutations = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "Salutation", {
                get: function () {
                    return this._salutation;
                },
                set: function (inValue) {
                    this._salutation = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "FirstName", {
                get: function () {
                    return this._firstName;
                },
                set: function (inValue) {
                    this._firstName = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "MiddleName", {
                get: function () {
                    return this._middleName;
                },
                set: function (inValue) {
                    this._middleName = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "LastName", {
                get: function () {
                    return this._lastName;
                },
                set: function (inValue) {
                    this._lastName = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "Suffix", {
                get: function () {
                    return this._suffix;
                },
                set: function (inValue) {
                    this._suffix = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "WorkingTitle", {
                get: function () {
                    return this._workingTitle;
                },
                set: function (inValue) {
                    this._workingTitle = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "Gender", {
                get: function () {
                    return this._gender;
                },
                set: function (inValue) {
                    this._gender = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "FacultyRanks", {
                get: function () {
                    return this._facultyRanks;
                },
                set: function (inValue) {
                    this._facultyRanks = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "FacultyRank", {
                get: function () {
                    return this._facultyRank;
                },
                set: function (inValue) {
                    this._facultyRank = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "AdministrativeAppointments", {
                get: function () {
                    return this._administrativeAppointments;
                },
                set: function (inValue) {
                    this._administrativeAppointments = inValue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PersonalInfo.prototype, "Picture", {
                get: function () {
                    return this._picture;
                },
                set: function (inValue) {
                    this._picture = inValue;
                },
                enumerable: true,
                configurable: true
            });
            PersonalInfo.prototype._initialize = function (inDocumentElementId) {
                var me = this;
                this._dataContext.GetSalutations(me, function (self, salutations) {
                    for(var i = 0; i < salutations.length; i += 1) {
                        me.Salutations.push(salutations[i]);
                    }
                });
                this._dataContext.GetFacultyRanks(me, function (self, facultyRanks) {
                    for(var i = 0; i < facultyRanks.length; i += 1) {
                        me.FacultyRanks.push(facultyRanks[i]);
                    }
                });
                this._dataContext.Get(me, function (self, data) {
                    me.ToViewModel(me, data);
                    ko.applyBindings(me, $("#" + inDocumentElementId).get(0));
                });
            };
            PersonalInfo.prototype.ToViewModel = function (inSelf, data) {
                var me = inSelf;
                debugger;

                me.RevisionId = data.revisionId;
                me.IsActive = ko.observable(data.isActive);
                me.IsDisplayNameDerived = ko.observable(data.isDisplayNameDerived);
                me.DisplayName = ko.observable(data.displayName);
                me.Salutation = ko.observable(data.salutation);
                me.FirstName = ko.observable(data.firstName);
                me.MiddleName = ko.observable(data.middleName);
                me.LastName = ko.observable(data.lastName);
                me.Suffix = ko.observable(data.suffix);
                me.WorkingTitle = ko.observable(data.workingTitle);
                me.Gender = ko.observable(data.gender);
                if(data.facultyRank != null) {
                    me.FacultyRank = ko.observable({
                        employeeFacultyRankId: data.facultyRank.employeeFacultyRankId,
                        rank: data.facultyRank.rank
                    });
                }
                me.AdministrativeAppointments = ko.observable(data.administrativeAppointments);
                me.Picture = ko.observable(data.picture);
            };
            PersonalInfo.prototype.FromViewModel = function (inSelf) {
                var me = inSelf;
                debugger;

                return {
                    revisionId: me.RevisionId,
                    isActive: me.IsActive,
                    isDisplayNameDerived: me.IsDisplayNameDerived,
                    displayName: me.DisplayName,
                    salutation: me.Salutation,
                    firstName: me.FirstName,
                    middleName: me.MiddleName,
                    lastName: me.LastName,
                    suffix: me.Suffix,
                    workingTitle: me.WorkingTitle,
                    gender: me.Gender,
                    facultyRank: (me.FacultyRank() != null) ? {
                        employeeFacultyRankId: me.FacultyRank().employeeFacultyRankId,
                        rank: me.FacultyRank().rank
                    } : null,
                    administrativeAppointments: me.AdministrativeAppointments,
                    picture: me.Picture
                };
            };
            PersonalInfo.prototype.SaveForm = function (formElement) {
                this._dataContext.Put(this, this.FromViewModel);
            };
            return PersonalInfo;
        })();
        Employee.PersonalInfo = PersonalInfo;        
    })(ViewModels.Employee || (ViewModels.Employee = {}));
    var Employee = ViewModels.Employee;
})(ViewModels || (ViewModels = {}));
