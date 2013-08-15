var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../../app/Flasher.ts" />
    /// <reference path="ServerApiModel.d.ts" />
    /// <reference path="../employees/ServerApiModel.d.ts" />
    /// <reference path="../activities/Activities.ts" />
    /// <reference path="../geographicExpertises/GeographicExpertises.ts" />
    /// <reference path="../languageExpertises/LanguageExpertises.ts" />
    /// <reference path="../degrees/Degrees.ts" />
    /// <reference path="../internationalAffiliations/InternationalAffiliations.ts" />
    (function (My) {
        var Affiliation = (function () {
            function Affiliation() {
                this.id = ko.observable();
                this.establishmentId = ko.observable();
                this.establishment = ko.observable();
                this.jobTitles = ko.observable();
                this.isDefault = ko.observable(false);
                this.isAcknowledged = ko.observable(false);
                this.isClaimingStudent = ko.observable(false);
                this.isClaimingEmployee = ko.observable(false);
                this.isClaimingInternationalOffice = ko.observable(false);
                this.isClaimingAdministrator = ko.observable(false);
                this.isClaimingFaculty = ko.observable(false);
                this.isClaimingStaff = ko.observable(false);
                this.campusId = ko.observable(null);
                this.collegeId = ko.observable(null);
                this.departmentId = ko.observable(null);
                this.facultyRankId = ko.observable(null);
            }
            return Affiliation;
        })();
        My.Affiliation = Affiliation;

        var Profile = (function () {
            function Profile() {
                this._sammy = Sammy();
                this._activitiesViewModel = null;
                this._geographicExpertisesViewModel = null;
                this._languageExpertisesViewModel = null;
                this._degreesViewModel = null;
                this._internationalAffiliationsViewModel = null;
                this.hasPhoto = ko.observable();
                this.photoUploadError = ko.observable();
                this.photoSrc = ko.observable(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                this.photoUploadSpinner = new App.Spinner(new App.SpinnerOptions(400));
                this.photoDeleteSpinner = new App.Spinner(new App.SpinnerOptions(400));
                this.isDisplayNameDerived = ko.observable();
                this.displayName = ko.observable();
                this._userDisplayName = '';
                this.personId = 0;
                this.salutation = ko.observable();
                this.firstName = ko.observable();
                this.middleName = ko.observable();
                this.lastName = ko.observable();
                this.suffix = ko.observable();
                this.facultyRanks = ko.observableArray();
                this.facultyRankId = ko.observable(null);
                this.defaultEstablishmentHasCampuses = ko.observable(false);
                this.preferredTitle = ko.observable();
                this.affiliations = ko.observableArray();
                this.gender = ko.observable();
                this.isActive = ko.observable();
                this.$photo = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this.editMode = ko.observable(false);
                this.saveSpinner = new App.Spinner(new App.SpinnerOptions(200));
                this.startInEdit = ko.observable(false);
                this.startTabName = ko.observable("Activities");
                this._initialize();
                //this._setupRouting();
                //this._setupValidation();
                //this._setupKendoWidgets();
                //this._setupDisplayNameDerivation();
                //this._setupCardComputeds();
                //this._sammy.run('#/activities');
            }
            Profile.prototype._initialize = function () {
            };

            Profile.prototype.load = function (startTab) {
                var _this = this;
                var deferred = $.Deferred();

                // start both requests at the same time
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

                // only process after both requests have been resolved
                $.when(facultyRanksPact, viewModelPact).done(function (facultyRanks, viewModel) {
                    _this.facultyRanks(facultyRanks);
                    if (facultyRanks.length == 0) {
                        _this.facultyRankId(null);
                    }

                    ko.mapping.fromJS(viewModel, { ignore: "personId" }, _this);
                    _this.personId = viewModel.personId;

                    _this._originalValues = viewModel;

                    //if (!this._isInitialized) {
                    //    $(this).trigger('ready'); // ready to apply bindings
                    //    this._isInitialized = true; // bindings have been applied
                    //    this.$facultyRanks().kendoDropDownList(); // kendoui dropdown for faculty ranks
                    //}
                    _this._reloadAffiliations();
                    _this._setupValidation();
                    _this._setupKendoWidgets();
                    _this._setupDisplayNameDerivation();
                    _this._setupCardComputeds();

                    if (startTab === "") {
                        _this._setupRouting();
                        _this._sammy.run("#/activities");
                    } else {
                        var url = location.href;
                        var index = url.lastIndexOf("?");
                        if (index != -1) {
                            _this._startTab(startTab);
                            _this._setupRouting();
                        } else {
                            _this._setupRouting();
                            _this._sammy.run("#/" + startTab);
                        }
                    }

                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });

                return deferred;
            };

            Profile.prototype._startTab = function (tabName) {
                var _this = this;
                var viewModel;
                var tabStrip = $("#tabstrip").data("kendoTabStrip");

                if (tabName === "activities") {
                    if (this._activitiesViewModel == null) {
                        this._activitiesViewModel = new ViewModels.Activities.ActivityList(this.personId);
                        this._activitiesViewModel.load().done(function () {
                            ko.applyBindings(_this._activitiesViewModel, $("#activities")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                    if (tabStrip.select() != 0) {
                        tabStrip.select(0);
                    }
                } else if (tabName === "geographic-expertise") {
                    if (this._geographicExpertisesViewModel == null) {
                        this._geographicExpertisesViewModel = new ViewModels.GeographicExpertises.GeographicExpertiseList(this.personId);
                        this._geographicExpertisesViewModel.load().done(function () {
                            ko.applyBindings(_this._geographicExpertisesViewModel, $("#geographic-expertises")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                    if (tabStrip.select() != 1) {
                        tabStrip.select(1);
                    }
                } else if (tabName === "language-expertise") {
                    if (this._languageExpertisesViewModel == null) {
                        this._languageExpertisesViewModel = new ViewModels.LanguageExpertises.LanguageExpertiseList(this.personId);
                        this._languageExpertisesViewModel.load().done(function () {
                            ko.applyBindings(_this._languageExpertisesViewModel, $("#language-expertises")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                    if (tabStrip.select() != 2) {
                        tabStrip.select(2);
                    }
                } else if (tabName === "formal-education") {
                    if (this._degreesViewModel == null) {
                        this._degreesViewModel = new ViewModels.Degrees.DegreeList(this.personId);
                        this._degreesViewModel.load().done(function () {
                            ko.applyBindings(_this._degreesViewModel, $("#degrees")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                    if (tabStrip.select() != 3) {
                        tabStrip.select(3);
                    }
                } else if (tabName === "affiliations") {
                    if (this._internationalAffiliationsViewModel == null) {
                        this._internationalAffiliationsViewModel = new ViewModels.InternationalAffiliations.InternationalAffiliationList(this.personId);
                        this._internationalAffiliationsViewModel.load().done(function () {
                            ko.applyBindings(_this._internationalAffiliationsViewModel, $("#international-affiliations")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + " |" + errorThrown);
                        });
                    }
                    if (tabStrip.select() != 4) {
                        tabStrip.select(4);
                    }
                }
            };

            Profile.prototype.tabClickHandler = function (event) {
                var tabName = event.item.innerText;
                if (tabName == null)
                    tabName = event.item.textContent;
                tabName = this.tabTitleToName(tabName);

                //this._startTab( tabName );
                location.href = "#/" + tabName;
            };

            Profile.prototype.tabTitleToName = function (title) {
                var tabName = null;
                if (title === "Activities")
                    tabName = "activities";
                if (title === "Geographic Expertise")
                    tabName = "geographic-expertise";
                if (title === "Language Expertise")
                    tabName = "language-expertise";
                if (title === "Formal Education")
                    tabName = "formal-education";
                if (title === "Affiliations")
                    tabName = "affiliations";
                return tabName;
            };

            Profile.prototype.startEditing = function () {
                this.editMode(true);
                if (this.$editSection.length) {
                    this.$editSection.slideDown();
                }
            };

            Profile.prototype.stopEditing = function () {
                this.editMode(false);
                if (this.$editSection.length) {
                    this.$editSection.slideUp();
                }
            };

            Profile.prototype.cancelEditing = function () {
                ko.mapping.fromJS(this._originalValues, {}, this);
                this.stopEditing();
            };

            Profile.prototype.saveInfo = function () {
                var _this = this;
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                } else {
                    var apiModel = ko.mapping.toJS(this);

                    this.saveSpinner.start();
                    $.ajax({
                        url: App.Routes.WebApi.My.Profile.put(),
                        type: 'PUT',
                        data: apiModel
                    }).done(function (responseText, statusText, xhr) {
                        App.flasher.flash(responseText);
                        _this.stopEditing();
                        _this._initialize();
                    }).fail(function () {
                        //alert('a PUT API call failed :(');
                    }).always(function () {
                        _this.saveSpinner.stop();
                    });
                }
            };

            Profile.prototype.startDeletingPhoto = function () {
                var _this = this;
                if (this.$confirmPurgeDialog && this.$confirmPurgeDialog.length) {
                    this.$confirmPurgeDialog.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.$confirmPurgeDialog.dialog('close');
                                    _this._deletePhoto();
                                }
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmPurgeDialog.dialog('close');
                                    _this.photoDeleteSpinner.stop();
                                },
                                'data-css-link': true
                            }
                        ]
                    });
                } else if (confirm('Are you sure you want to delete your profile photo?')) {
                    this._deletePhoto();
                }
            };

            Profile.prototype._deletePhoto = function () {
                var _this = this;
                this.photoDeleteSpinner.start();
                this.photoUploadError(undefined);
                $.ajax({
                    url: App.Routes.WebApi.My.Photo.del(),
                    type: 'DELETE'
                }).always(function () {
                    _this.photoDeleteSpinner.stop();
                }).done(function (response, statusText, xhr) {
                    if (typeof response === 'string')
                        App.flasher.flash(response);
                    _this.hasPhoto(false);
                    _this.photoSrc(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                }).fail(function () {
                    _this.photoUploadError(Profile.photoUploadUnexpectedErrorMessage);
                });
            };

            Profile.prototype._setupRouting = function () {
                var _this = this;
                this._sammy.route('get', '#/', function () {
                    _this._startTab('activities');
                });
                this._sammy.route('get', '#/activities', function () {
                    _this._startTab('activities');
                });
                this._sammy.route('get', '#/geographic-expertise', function () {
                    _this._startTab('geographic-expertise');
                });
                this._sammy.route('get', '#/language-expertise', function () {
                    _this._startTab('language-expertise');
                });
                this._sammy.route('get', '#/formal-education', function () {
                    _this._startTab('formal-education');
                });
                this._sammy.route('get', '#/affiliations', function () {
                    _this._startTab('affiliations');
                });
            };

            // client validation rules
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

                this.preferredTitle.extend({
                    maxLength: 500
                });

                ko.validation.group(this);
            };

            // comboboxes for salutation & suffix
            Profile.prototype._setupKendoWidgets = function () {
                var _this = this;
                var tabstrip = $('#tabstrip');
                tabstrip.kendoTabStrip({
                    select: function (e) {
                        _this.tabClickHandler(e);
                    },
                    animation: false
                }).show();

                // when the $element observables are bound, they will have length
                // use this opportinity to apply kendo extensions
                this.$nameSalutation.subscribe(function (newValue) {
                    if (newValue && newValue.length)
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
                });
                this.$nameSuffix.subscribe(function (newValue) {
                    if (newValue && newValue.length)
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
                });

                // this is getting a little long, can probably factor out event handlers / validation stuff
                this.$photo.subscribe(function (newValue) {
                    if (newValue && newValue.length) {
                        newValue.kendoUpload({
                            multiple: false,
                            showFileList: false,
                            localization: {
                                select: 'Choose a photo to upload...'
                            },
                            async: {
                                saveUrl: App.Routes.WebApi.My.Photo.post()
                            },
                            select: function (e) {
                                _this.photoUploadSpinner.start();
                                $.ajax({
                                    type: 'POST',
                                    async: false,
                                    url: App.Routes.WebApi.My.Photo.validate(),
                                    data: {
                                        name: e.files[0].name,
                                        length: e.files[0].size
                                    }
                                }).done(function () {
                                    _this.photoUploadError(undefined);
                                }).fail(function (xhr) {
                                    _this.photoUploadError(xhr.responseText);
                                    e.preventDefault();
                                    _this.photoUploadSpinner.stop();
                                });
                            },
                            complete: function () {
                                _this.photoUploadSpinner.stop();
                            },
                            success: function (e) {
                                if (e.operation == 'upload') {
                                    if (e.response && e.response.message) {
                                        App.flasher.flash(e.response.message);
                                    }
                                    _this.hasPhoto(true);
                                    _this.photoSrc(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                                }
                            },
                            error: function (e) {
                                if (e.XMLHttpRequest.responseText && e.XMLHttpRequest.responseText.length < 1000) {
                                    _this.photoUploadError(e.XMLHttpRequest.responseText);
                                } else {
                                    _this.photoUploadError(Profile.photoUploadUnexpectedErrorMessage);
                                }
                            }
                        });
                    }
                });
            };

            // logic to derive display name
            Profile.prototype._setupDisplayNameDerivation = function () {
                var _this = this;
                this.displayName.subscribe(function (newValue) {
                    if (!_this.isDisplayNameDerived()) {
                        // stash user-entered display name only when it is not derived
                        _this._userDisplayName = newValue;
                    }
                });

                ko.computed(function () {
                    if (_this.isDisplayNameDerived()) {
                        var mapSource = {
                            id: _this.personId,
                            isDisplayNameDerived: _this.isDisplayNameDerived(),
                            displayName: _this.displayName(),
                            salutation: _this.salutation(),
                            firstName: _this.firstName(),
                            middleName: _this.middleName(),
                            lastName: _this.lastName(),
                            suffix: _this.suffix()
                        };
                        var data = ko.mapping.toJS(mapSource);

                        $.ajax({
                            url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                            type: 'GET',
                            cache: false,
                            data: data
                        }).done(function (result) {
                            _this.displayName(result);
                        });
                    } else {
                        if (!_this._userDisplayName)
                            _this._userDisplayName = _this.displayName();

                        // restore user-entered display name
                        _this.displayName(_this._userDisplayName);
                    }
                }).extend({ throttle: 400 });
            };

            Profile.prototype._setupCardComputeds = function () {
                var _this = this;
                // text translation for gender codes
                this.genderText = ko.computed(function () {
                    var genderCode = _this.gender();
                    if (genderCode === 'M')
                        return 'Male';
                    if (genderCode === 'F')
                        return 'Female';
                    if (genderCode === 'P')
                        return 'Gender Undisclosed';
                    return 'Gender Unknown';
                });

                // friendly string for isActive boolean
                this.isActiveText = ko.computed(function () {
                    return _this.isActive() ? 'Active' : 'Inactive';
                });

                // do not display faculty rank editor for tenants that do not have
                // employee module settings or faculty rank options
                this.isFacultyRankEditable = ko.computed(function () {
                    return _this.facultyRanks() && _this.facultyRanks().length > 0;
                });

                if (this.facultyRankId() != null) {
                    this.facultyRankText = ko.computed(function () {
                        var id = _this.facultyRankId();
                        for (var i = 0; i < _this.facultyRanks().length; i++) {
                            var facultyRank = _this.facultyRanks()[i];
                            if (id === facultyRank.id) {
                                return facultyRank.rank;
                            }
                        }
                        return undefined;
                    });
                } else {
                    this.facultyRankText = undefined;
                }

                // do not display faculty rank on the form card when it is not set
                // or when it is set to other
                this.isFacultyRankVisible = ko.computed(function () {
                    return _this.isFacultyRankEditable() && _this.facultyRankId() && _this.facultyRankText() && _this.facultyRankText().toLowerCase() !== 'other';
                });
            };

            // --------------------------------------------------------------------------------
            /*
            *  Affiliations
            */
            // --------------------------------------------------------------------------------
            Profile.prototype._reloadAffiliations = function () {
                var _this = this;
                $.ajax({
                    async: true,
                    url: App.Routes.WebApi.My.Affiliations.get(),
                    data: { isDefault: false },
                    type: 'GET'
                }).done(function (data, statusText, xhr) {
                    ko.mapping.fromJS(data, {}, _this.affiliations);
                }).fail(function (xhr, statusText, errorThrown) {
                    App.Failures.message(xhr, 'while trying to load your affiliations', true);
                });
            };

            Profile.prototype.editAffiliation = function (data, event) {
                var me = this;

                /* Get default affiliation */
                var defaultAffiliation = null;
                $.ajax({
                    type: 'GET',
                    url: App.Routes.WebApi.My.Affiliations.getDefault(),
                    async: false
                }).done(function (response) {
                    defaultAffiliation = response;
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to determine your default affiliation', true);
                });
                if (!defaultAffiliation)
                    return;

                $("#editAffiliationDepartmentDropList").kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    change: function (e) {
                        //var item = this.dataItem[e.sender.selectedIndex];
                    },
                    dataBound: function (e) {
                        if ((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                            var item = this.dataItem(this.selectedIndex);
                            if (item == null) {
                                this.text("");
                                $("#editAffiliationDepartmenDiv").hide();
                            } else {
                                $("#editAffiliationDepartmenDiv").show();
                            }
                        } else {
                            $("#editAffiliationDepartmenDiv").hide();
                        }
                    }
                });

                var collegeDropListDataSource = null;

                if (!this.defaultEstablishmentHasCampuses()) {
                    collegeDropListDataSource = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: App.Routes.WebApi.Establishments.getChildren(defaultAffiliation.establishmentId),
                                data: { orderBy: ['rank-asc', 'name-asc'] }
                            }
                        }
                    });
                }

                $("#editAffiliationCollegeDropList").kendoDropDownList({
                    dataTextField: "officialName",
                    dataValueField: "id",
                    dataSource: collegeDropListDataSource,
                    change: function (e) {
                        var selectedIndex = e.sender.selectedIndex;
                        if (selectedIndex != -1) {
                            var item = this.dataItem(selectedIndex);
                            if (item != null) {
                                var dataSource = new kendo.data.DataSource({
                                    transport: {
                                        read: {
                                            url: App.Routes.WebApi.Establishments.getChildren(item.id),
                                            data: { orderBy: ['rank-asc', 'name-asc'] }
                                        }
                                    }
                                });

                                $("#editAffiliationDepartmentDropList").data("kendoDropDownList").setDataSource(dataSource);
                            }
                        }
                    },
                    dataBound: function (e) {
                        if ((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                            var item = this.dataItem(this.selectedIndex);
                            if (item != null) {
                                var collegeId = item.id;
                                if (collegeId != null) {
                                    var dataSource = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: App.Routes.WebApi.Establishments.getChildren(collegeId),
                                                data: { orderBy: ['rank-asc', 'name-asc'] }
                                            }
                                        }
                                    });

                                    $("#editAffiliationDepartmentDropList").data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                        }
                    }
                });

                if (this.defaultEstablishmentHasCampuses()) {
                    $("#editAffiliationCampusDropList").kendoDropDownList({
                        dataTextField: "officialName",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.Establishments.getChildren(defaultAffiliation.establishmentId),
                                    data: { orderBy: ['rank-asc', 'name-asc'] }
                                }
                            }
                        }),
                        change: function (e) {
                            var selectedIndex = e.sender.selectedIndex;
                            if ((selectedIndex != null) && (selectedIndex != -1)) {
                                var item = this.dataItem(selectedIndex);
                                if (item != null) {
                                    var dataSource = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: App.Routes.WebApi.Establishments.getChildren(item.id),
                                                data: { orderBy: ['rank-asc', 'name-asc'] }
                                            }
                                        }
                                    });

                                    $("#editAffiliationCollegeDropList").data("kendoDropDownList").setDataSource(dataSource);
                                }
                            }
                        },
                        dataBound: function (e) {
                            if ((this.selectedIndex != null) && (this.selectedIndex != -1)) {
                                var item = this.dataItem(this.selectedIndex);
                                if (item != null) {
                                    var campusId = item.id;
                                    if (campusId != null) {
                                        var dataSource = new kendo.data.DataSource({
                                            transport: {
                                                read: {
                                                    url: App.Routes.WebApi.Establishments.getChildren(campusId),
                                                    data: { orderBy: ['rank-asc', 'name-asc'] }
                                                }
                                            }
                                        });

                                        $("#editAffiliationCollegeDropList").data("kendoDropDownList").setDataSource(dataSource);
                                    }
                                } else {
                                    $("#editAffiliationCollegeDropList").data("kendoDropDownList").setDataSource(null);
                                }
                            }
                        }
                    });
                }

                if ((this.facultyRanks() != null) && (this.facultyRanks().length > 0)) {
                    $("#editAffiliationFacultyRankDropList").kendoDropDownList({
                        dataTextField: "rank",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get()
                                }
                            }
                        })
                    });
                }

                var dialogHeight = 300;
                dialogHeight -= this.defaultEstablishmentHasCampuses() ? 0 : 40;
                dialogHeight -= (this.facultyRanks() != null) && (this.facultyRanks().length > 0) ? 0 : 40;

                $("#editAffiliationDialog").dialog({
                    dialogClass: "no-close",
                    title: (data == null) ? "Create Affiliation" : "Edit Affiliation",
                    width: 750,
                    height: dialogHeight,
                    resizable: false,
                    draggable: true,
                    modal: true,
                    buttons: [
                        {
                            text: "Save",
                            click: function (item, event) {
                                me.saveAffiliation((data == null) ? null : data.id(), defaultAffiliation.establishmentId);
                            }
                        },
                        {
                            text: "Cancel",
                            click: function () {
                                $("#editAffiliationDialog").dialog("close");
                            }
                        }
                    ],
                    open: function (event, ui) {
                        if (data != null) {
                            var deleteButton = { text: "Delete", click: function (item, event) {
                                    me.deleteAffiliation(data.id());
                                } };
                            var buttons = $(this).dialog('option', 'buttons');
                            buttons.push(deleteButton);
                            $(this).dialog('option', 'buttons', buttons);

                            if (me.defaultEstablishmentHasCampuses() && data.campusId() != null) {
                                $("#editAffiliationCampusDropList").data("kendoDropDownList").value(data.campusId());
                            }
                            if (data.collegeId() != null) {
                                $("#editAffiliationCollegeDropList").data("kendoDropDownList").value(data.collegeId());
                            }
                            if (data.departmentId() != null) {
                                $("#editAffiliationDepartmentDropList").data("kendoDropDownList").value(data.departmentId());
                            }
                            if (me.isFacultyRankVisible() && data.facultyRankId() != null) {
                                $("#editAffiliationFacultyRankDropList").data("kendoDropDownList").value(data.facultyRankId());
                            }
                        }
                    }
                });
            };

            Profile.prototype.GetDropListSelectedItem = function (dropListId) {
                var item = null;

                var dropList = $("#" + dropListId).data("kendoDropDownList");
                if (dropList != null) {
                    var selectedIndex = dropList.selectedIndex;
                    if ((selectedIndex != null) && (selectedIndex != -1)) {
                        item = dropList.dataItem(selectedIndex);
                    }
                }

                return item;
            };

            Profile.prototype.saveAffiliation = function (affiliationId, establishmentId) {
                var me = this;
                var campusId1 = null;
                var collegeId1 = null;
                var departmentId1 = null;
                var facultyRankId1 = null;

                if (this.defaultEstablishmentHasCampuses()) {
                    var item1 = me.GetDropListSelectedItem("editAffiliationCampusDropList");
                    if (item1 != null) {
                        campusId1 = item1.id;
                    }
                }

                item1 = me.GetDropListSelectedItem("editAffiliationCollegeDropList");
                if (item1 != null) {
                    collegeId1 = item1.id;
                }

                item1 = me.GetDropListSelectedItem("editAffiliationDepartmentDropList");
                if (item1 != null) {
                    departmentId1 = item1.id;
                }

                if ((this.facultyRanks() != null) && (this.facultyRanks().length > 0)) {
                    item1 = me.GetDropListSelectedItem("editAffiliationFacultyRankDropList");
                    if (item1 != null) {
                        facultyRankId1 = item1.id;
                    }
                }

                var affiliation = {
                    id: affiliationId,
                    personId: me.personId,
                    establishmentId: establishmentId,
                    campusId: campusId1,
                    collegeId: collegeId1,
                    departmentId: departmentId1,
                    facultyRankId: facultyRankId1
                };

                var model = ko.mapping.toJS(affiliation);

                $.ajax({
                    async: false,
                    url: (affiliationId == null) ? App.Routes.WebApi.My.Affiliations.post() : App.Routes.WebApi.My.Affiliations.put(model.id),
                    type: (affiliationId == null) ? 'POST' : 'PUT',
                    data: model
                }).done(function (responseText, statusText, xhr) {
                    if (statusText === "success") {
                        $("#editAffiliationDialog").dialog("close");

                        //debugger;
                        //var tab = $("#tabstrip").data("kendoTabStrip").select()[0];
                        //var tabName = tab.innerText; // IE
                        //if (tabName == null) tabName = tab.textContent; // FF
                        //tabName = me.tabTitleToName(tabName);
                        //location.href = App.Routes.Mvc.My.Profile.post(true,tabName);
                        //location.href = App.Routes.Mvc.My.Profile.get();
                        me._reloadAffiliations();
                    } else {
                        $("#affiliationErrorDialog").dialog({
                            title: xhr.statusText,
                            width: 400,
                            height: 250,
                            modal: true,
                            resizable: false,
                            draggable: false,
                            buttons: {
                                Ok: function () {
                                    $("#affiliationErrorDialog").dialog("close");
                                }
                            },
                            open: function (event, ui) {
                                $("#affiliationErrorDialogMessage").text(xhr.responseText);
                            }
                        });
                    }
                }).fail(function (xhr, statusText, errorThrown) {
                    $("#editAffiliationDialog").dialog("close");
                    var info = xhr.responseText && xhr.responseText.length < 1000 ? xhr.responseText : 'An unexpected error occurred, please try again. If you continue to experience this issue, use the Feedback & Support link on this page to report it.';
                    alert(info);
                });
            };

            Profile.prototype.deleteAffiliation = function (affiliationId) {
                var me = this;
                $("#confirmAffiliationDeleteDialog").dialog({
                    width: 300,
                    height: 200,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    buttons: {
                        "Delete": function () {
                            $(this).dialog("close");

                            var affiliation = {
                                id: affiliationId,
                                personId: me.personId,
                                establishmentId: null,
                                campusId: null,
                                collegeId: null,
                                departmentId: null,
                                facultyRankId: null
                            };

                            var model = ko.mapping.toJS(affiliation);

                            $.ajax({
                                type: "DELETE",
                                url: App.Routes.WebApi.My.Affiliations.del(model.id)
                            }).done(function (data, statusText, xhr) {
                                if (statusText !== "success") {
                                    $("#affiliationErrorDialog").dialog({
                                        title: xhr.statusText,
                                        width: 400,
                                        height: 250,
                                        modal: true,
                                        resizable: false,
                                        draggable: false,
                                        buttons: {
                                            Ok: function () {
                                                $("#affiliationErrorDialog").dialog("close");
                                            }
                                        },
                                        open: function (event, ui) {
                                            $("#affiliationErrorDialogMessage").text(xhr.responseText);
                                        }
                                    });
                                }

                                $("#editAffiliationDialog").dialog("close");
                                me._reloadAffiliations();
                            }).fail(function (xhr, statusText, errorThrown) {
                                alert(xhr.responseText);
                                $("#editAffiliationDialog").dialog("close");
                            });
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            };

            Profile.prototype.deleteProfile = function (data, event) {
                var me = this;
                $("#confirmProfileDeleteDialog").dialog({
                    width: 300,
                    height: 200,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    buttons: {
                        "Delete": function () {
                            $.ajax({
                                async: false,
                                type: "DELETE",
                                url: App.Routes.WebApi.People.del(me.personId),
                                success: function (data, statusText, jqXHR) {
                                    alert(jqXHR.statusText);
                                },
                                error: function (jqXHR, statusText, errorThrown) {
                                    alert(statusText);
                                },
                                complete: function (jqXHR, statusText) {
                                    $("#confirmProfileDeleteDialog").dialog("close");
                                }
                            });
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            };
            Profile.photoUploadUnexpectedErrorMessage = 'UCosmic experienced an unexpected error managing your photo, please try again. If you continue to experience this issue, please use the Feedback & Support link on this page to report it.';
            return Profile;
        })();
        My.Profile = Profile;
    })(ViewModels.My || (ViewModels.My = {}));
    var My = ViewModels.My;
})(ViewModels || (ViewModels = {}));
