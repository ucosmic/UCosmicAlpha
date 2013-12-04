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
/// <reference path="../../app/Routes.d.ts" />
/// <reference path="../../app/DataCacher.ts" />
/// <reference path="../../app/Models.d.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />
/// <reference path="../establishments/Server.ts" />
/// <reference path="../employees/Models.d.ts" />
/// <reference path="../employees/Server.ts" />
/// <reference path="../people/Server.ts" />
/// <reference path="../people/Models.d.ts" />
/// <reference path="../../app/FormSelect.ts" />
var RootViewModels = ViewModels;

var People;
(function (People) {
    (function (ViewModels) {
        var AffiliatedEstablishmentEditor = (function () {
            function AffiliatedEstablishmentEditor(owner, options, establishment) {
                var _this = this;
                this.owner = owner;
                this.select = new App.FormSelect({ kendoOptions: {} });
                var caption = this._getOptionsCaption(options);
                var selectOptions = this._getSelectOptions(options);

                this.select.caption(caption);
                this.select.options(selectOptions.slice(0));
                this.select.value(establishment ? establishment.id : undefined);

                this.select.value.subscribe(function (newValue) {
                    _this._onSelectedValueChanged(newValue);
                });
            }
            AffiliatedEstablishmentEditor.prototype._getOptionsCaption = function (options) {
                var _this = this;
                // the option label for the first dropdown is different because it is required
                // this is the first editor all options' parentId's are equal to default establishment
                var isFirst = Enumerable.From(options).All(function (x) {
                    return x.parentId == _this.owner.owner.defaultAffiliation.establishmentId;
                });
                var caption = isFirst ? '[Select main affiliation]' : '[Select sub-affiliation or leave empty]';
                return caption;
            };

            AffiliatedEstablishmentEditor.prototype._getSelectOptions = function (options) {
                // convert options from array of establishments to text/value pair array
                var selectOptions = Enumerable.From(options).Select(function (x) {
                    return {
                        text: x.contextName || x.officialName,
                        value: x.id
                    };
                }).ToArray();
                return selectOptions;
            };

            AffiliatedEstablishmentEditor.prototype._onSelectedValueChanged = function (newValue) {
                var siblingEditors = this.owner.establishmentEditors();
                if (newValue) {
                    this.owner.bindEstablishmentEditors(newValue);
                } else {
                    // need to find most granular that is still selected
                    var index = Enumerable.From(siblingEditors).IndexOf(this);
                    var ancestors = siblingEditors.slice(0, index).reverse();
                    var ancestor = Enumerable.From(ancestors).FirstOrDefault(undefined, function (x) {
                        return x.select.value() && x.select.value() > 0;
                    });
                    if (ancestor) {
                        this.owner.bindEstablishmentEditors(ancestor.select.value());
                    } else {
                        this.owner.bindEstablishmentEditors(this.owner.owner.defaultAffiliation.establishmentId);
                    }
                }
            };
            return AffiliatedEstablishmentEditor;
        })();
        ViewModels.AffiliatedEstablishmentEditor = AffiliatedEstablishmentEditor;

        var Affiliation = (function () {
            function Affiliation(owner, dataOrPersonId) {
                var _this = this;
                //#region Observable Interface Implementation
                this.affiliationId = ko.observable();
                this.personId = ko.observable();
                this.establishmentId = ko.observable();
                this.isDefault = ko.observable();
                this.jobTitles = ko.observable();
                this.facultyRank = ko.observable();
                this.establishments = ko.observableArray();
                this.hideValidationMessages = ko.observable(true);
                //#endregion
                //#region Data Mutation
                this.saveSpinner = new App.Spinner({ delay: 200 });
                this.purgeSpinner = new App.Spinner();
                //#endregion
                //#region Cascading Establishments
                this.establishmentEditors = ko.observableArray();
                this.firstEstablishmentId = ko.computed(function () {
                    var establishmentEditors = _this.establishmentEditors();
                    if (establishmentEditors.length) {
                        var firstEstablishmentEditor = establishmentEditors[0];
                        var value = firstEstablishmentEditor.select.value();
                        return value;
                    }
                    return -1;
                });
                this.lastEstablishmentId = ko.computed(function () {
                    var establishmentEditors = _this.establishmentEditors();
                    if (establishmentEditors.length) {
                        var lastEstablishmentEditor = Enumerable.From(establishmentEditors).LastOrDefault(undefined, function (x) {
                            return x.select.value() && x.select.value() > 0;
                        });
                        if (lastEstablishmentEditor)
                            return lastEstablishmentEditor.select.value();
                    }
                    return -1;
                });
                //#endregion
                //#region Faculty Rank DropDown
                this.facultyRankSelect = new App.FormSelect({ kendoOptions: {} });
                this.hasFacultyRanks = ko.observable(false);
                //#endregion
                //#region Postition Title Text
                this.jobTitlesHtml = ko.computed(function () {
                    return _this._computeJobTitles();
                });
                this.owner = owner;
                if (isNaN(dataOrPersonId)) {
                    this.data = dataOrPersonId;
                }
                if (this.data) {
                    ko.mapping.fromJS(this.data, {}, this);
                    this.isEditing = ko.observable(false);
                } else {
                    this.personId(dataOrPersonId);
                    this.isEditing = ko.observable(true);
                }

                // wait for faculty rank data and then bind to select options
                setTimeout(function () {
                    _this._loadFacultyRankOptions();
                }, 0);
                this._initValidation();
            }
            Affiliation.prototype.edit = function () {
                this.bindEstablishmentEditors(this.establishmentId());
                this.isEditing(true);
            };

            Affiliation.prototype.cancel = function () {
                var affiliationId = this.affiliationId();
                if (!affiliationId) {
                    this.owner.editableAffiliations.remove(this);
                    return;
                }

                ko.mapping.fromJS(this.data, {}, this);

                // restore faculty rank to its previous value
                var selectedFacultyRank = this.facultyRank();
                if (selectedFacultyRank)
                    this.facultyRankSelect.value(selectedFacultyRank.facultyRankId());
                this.isEditing(false);
            };

            Affiliation.prototype._initValidation = function () {
                var _this = this;
                // job titles cannot exceed 500 characters
                this.jobTitles.extend({
                    maxLength: {
                        message: 'Position Title(s) cannot contain more than 500 characters.',
                        params: 500
                    }
                });

                // the first establishment editor cannot be empty
                this.firstEstablishmentId.extend({
                    required: {
                        message: 'At least one main affiliation is required.'
                    }
                });

                // cannot have duplicate affiliations
                this.lastEstablishmentId.extend({
                    validation: {
                        validator: function (value) {
                            if (value < 1)
                                return true;
                            var duplicateSiblingAffiliation = Enumerable.From(_this.owner.editableAffiliations()).FirstOrDefault(undefined, function (x) {
                                return x !== _this && x.establishmentId() == value;
                            });
                            return typeof duplicateSiblingAffiliation === 'undefined';
                        },
                        message: 'You already have another affiliation with this organizational unit.'
                    }
                });

                ko.validation.group(this);
            };

            Affiliation.prototype.save = function () {
                var _this = this;
                if (!this.isValid()) {
                    this.hideValidationMessages(false);
                    this.errors.showAllMessages();
                    return;
                }

                this.hideValidationMessages(true);
                var data = {
                    establishmentId: this.lastEstablishmentId(),
                    facultyRankId: this.facultyRankSelect.value(),
                    jobTitles: this.jobTitles()
                };
                this.saveSpinner.start();
                People.Servers.PutAffiliation(data, this.establishmentId() || data.establishmentId).done(function () {
                    _this.owner.affiliationData.reload();
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to save your affiliation', true);
                    _this.saveSpinner.stop();
                });
            };

            Affiliation.prototype.purge = function () {
                var _this = this;
                this.purgeSpinner.start();
                if (this.owner.$confirmDeleteAffiliation && this.owner.$confirmDeleteAffiliation.length) {
                    this.owner.$confirmDeleteAffiliation.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.owner.$confirmDeleteAffiliation.dialog('close');
                                    _this.purgeSpinner.start(true);
                                    _this._purge();
                                },
                                'data-css-link': true,
                                'data-confirm-delete-link': true
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.owner.$confirmDeleteAffiliation.dialog('close');
                                },
                                'data-css-link': true
                            }
                        ],
                        close: function () {
                            _this.purgeSpinner.stop();
                        }
                    });
                } else {
                    if (confirm('Are you sure you want to delete this affiliation?')) {
                        this._purge();
                    } else {
                        this.purgeSpinner.stop();
                    }
                }
            };

            Affiliation.prototype._purge = function () {
                var _this = this;
                People.Servers.DeleteAffiliation(this.establishmentId()).done(function () {
                    _this.owner.affiliationData.reload();
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to delete your affiliation', true);
                    _this.purgeSpinner.stop();
                });
            };

            Affiliation.prototype.bindEstablishmentEditors = function (establishmentId) {
                var _this = this;
                // can't bind the editors until the default affiliation's offspring are loaded
                this.owner.establishmentData.ready().done(function (offspring) {
                    _this._bindEstablishmentEditors(establishmentId, offspring);
                });
            };

            Affiliation.prototype._bindEstablishmentEditors = function (establishmentId, offspring) {
                this.establishmentEditors([]);

                // the establishmentId passed as an argument represents the most granular establishment
                // create it first, then walk up using parentId's until the default establishment is reached
                var currentEstablishmentId = establishmentId;
                while (currentEstablishmentId && currentEstablishmentId != this.owner.defaultAffiliation.establishmentId) {
                    var currentEstablishment = this._bindEstablishmentEditor(currentEstablishmentId, offspring);
                    currentEstablishmentId = currentEstablishment.parentId;
                }

                // the above loop only renders from the most granular selected establishment and its ancestors
                // if there are more granular unselected options, need to render them as last binding
                this._bindEstablishmentEditor(establishmentId, offspring, true);
            };

            Affiliation.prototype._bindEstablishmentEditor = function (establishmentId, offspring, isLast) {
                if (typeof isLast === "undefined") { isLast = false; }
                // first try to find the establishment api model
                var establishment = this._getEstablishmentById(establishmentId, offspring);

                // when establishment exists and this IS NOT the last binding, get establishment's siblings
                // when establishment exists and this IS the last binding, get establishment's children
                // when establishment is undefined, get default affiliation establishment's children
                var options = this._getEstablishmentEditorOptions(establishment ? !isLast ? establishment.parentId : establishment.id : this.owner.defaultAffiliation.establishmentId, offspring);

                if (options.length) {
                    // when this is the last binding, do not pass the establishment
                    var editor = new AffiliatedEstablishmentEditor(this, options, !isLast ? establishment : undefined);

                    if (!isLast) {
                        this.establishmentEditors.unshift(editor);
                    } else {
                        this.establishmentEditors.push(editor);
                    }
                    this.owner.load().done(function () {
                        editor.select.applyKendo();
                    });
                }
                return establishment;
            };

            Affiliation.prototype._getEstablishmentById = function (establishmentId, offspring) {
                // will be undefined when establishmentId == defaultAffiliation.establishmentId
                var establishment = Enumerable.From(offspring).SingleOrDefault(undefined, function (x) {
                    return x.id == establishmentId;
                });
                return establishment;
            };

            Affiliation.prototype._getEstablishmentEditorOptions = function (parentId, offspring) {
                var options = Enumerable.From(offspring).Where(function (x) {
                    return x.parentId == parentId;
                }).OrderBy(function (x) {
                    return x.rank;
                }).ThenBy(function (x) {
                    return x.contextName || x.officialName;
                }).ToArray();
                return options;
            };

            Affiliation.prototype._loadFacultyRankOptions = function () {
                var _this = this;
                // the employee module settings data needs to be loaded
                // so that we can get the faculty rank options (if there are any)
                this.owner.employeeSettingsData.ready().done(function (settings) {
                    _this._bindFacultyRankOptions(settings);
                });
            };

            Affiliation.prototype._bindFacultyRankOptions = function (settings) {
                var _this = this;
                if (settings && settings.facultyRanks && settings.facultyRanks.length) {
                    this.hasFacultyRanks(true);
                    var options = this._getFacultyRankSelectOptions(settings);
                    this.facultyRankSelect.caption('[None]');
                    this.facultyRankSelect.options(options);
                    var facultyRank = this.facultyRank();
                    if (facultyRank)
                        this.facultyRankSelect.value(facultyRank.facultyRankId());
                    this.owner.load().done(function () {
                        _this.facultyRankSelect.applyKendo();
                    });
                }
            };

            Affiliation.prototype._getFacultyRankSelectOptions = function (settings) {
                // sort by rank && convert to text/value pair for select options binding
                var options = Enumerable.From(settings.facultyRanks).OrderBy(function (x) {
                    return x.rank;
                }).Select(function (x) {
                    var selectOption = {
                        text: x.text,
                        value: x.facultyRankId
                    };
                    return selectOption;
                }).ToArray();
                return options;
            };

            Affiliation.prototype._computeJobTitles = function () {
                var jobTitles = this.jobTitles();
                jobTitles = jobTitles || '';
                jobTitles = jobTitles.replace(/\n/g, '<br />');
                return jobTitles;
            };
            return Affiliation;
        })();
        ViewModels.Affiliation = Affiliation;

        var Profile = (function () {
            //#endregion
            //#region Construction
            function Profile(personId) {
                var _this = this;
                //#region Properties
                this._sammy = Sammy();
                this._activitiesViewModel = null;
                this._geographicExpertisesViewModel = null;
                this._languageExpertisesViewModel = null;
                this._degreesViewModel = null;
                this._internationalAffiliationsViewModel = null;
                this.hasPhoto = ko.observable();
                this.photoUploadError = ko.observable();
                this.photoSrc = ko.observable(App.Routes.WebApi.My.Photo.get({ maxSide: 128, refresh: new Date().toUTCString() }));
                this.photoUploadSpinner = new App.Spinner({ delay: 400 });
                this.photoDeleteSpinner = new App.Spinner({ delay: 400 });
                this.isDisplayNameDerived = ko.observable();
                this.displayName = ko.observable();
                this._userDisplayName = '';
                this.personId = 0;
                this.salutation = ko.observable();
                this.firstName = ko.observable();
                this.middleName = ko.observable();
                this.lastName = ko.observable();
                this.suffix = ko.observable();
                //isFacultyRankEditable: () => boolean;
                //isFacultyRankVisible: () => boolean;
                //facultyRankText: () => string;
                //facultyRanks: KnockoutObservableArray<RootViewModels.Employees.IServerFacultyRankApiModel> = ko.observableArray();
                //facultyRankId: KnockoutObservable<any> = ko.observable(null);
                this.defaultEstablishmentHasCampuses = ko.observable(false);
                this.preferredTitle = ko.observable();
                this.gender = ko.observable();
                this.isActive = ko.observable();
                this.$photo = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this.editMode = ko.observable(false);
                this.saveSpinner = new App.Spinner({ delay: 200 });
                this.startInEdit = ko.observable(false);
                this.startTabName = ko.observable("Activities");
                this.editableAffiliations = ko.observableArray();
                this.affiliationsSpinner = new App.Spinner({ delay: 400, runImmediately: true });
                this.isEditingAffiliation = ko.computed(function () {
                    var editableAffiliations = _this.editableAffiliations();
                    var editingAffiliation = Enumerable.From(editableAffiliations).FirstOrDefault(undefined, function (x) {
                        return x.isEditing();
                    });
                    return typeof editingAffiliation !== 'undefined';
                });
                this.affiliationData = new App.DataCacher(function () {
                    return _this._loadAffiliationData();
                });
                this.establishmentData = new App.DataCacher(function () {
                    return _this._loadEstablishmentData();
                });
                this.employeeSettingsData = new App.DataCacher(function () {
                    return _this._loadEmployeeSettingsData();
                });
                this.personId2 = personId;

                // go ahead and load affiliations
                this.affiliationData.ready();
            }
            Profile.prototype._loadAffiliationData = function () {
                var _this = this;
                var promise = $.Deferred();

                // get this person's affiliations from the server
                People.Servers.GetAffiliationsByPerson().done(function (affiliations) {
                    // default affiliation does not need to be observable
                    _this.defaultAffiliation = Enumerable.From(affiliations).Single(function (x) {
                        return x.isDefault;
                    });
                    _this.preferredTitle(_this.defaultAffiliation.jobTitles);

                    // the default affiliation is not editable, filter it out
                    var editableAffiliations = Enumerable.From(affiliations).Except([_this.defaultAffiliation]).OrderBy(function (x) {
                        return x.affiliationId;
                    }).ToArray();

                    // map editable affiliations into observable array of Affiliation viewmodels
                    ko.mapping.fromJS(editableAffiliations, {
                        create: function (options) {
                            return new Affiliation(_this, options.data);
                        }
                    }, _this.editableAffiliations);

                    _this.establishmentData.ready();
                    _this.employeeSettingsData.ready();
                    _this.affiliationsSpinner.stop();
                    promise.resolve(affiliations);
                });
                return promise;
            };

            Profile.prototype._loadEstablishmentData = function () {
                var promise = $.Deferred();
                Establishments.Servers.GetOffspring(this.defaultAffiliation.establishmentId).done(function (offspring) {
                    promise.resolve(offspring);
                });
                return promise;
            };

            Profile.prototype._loadEmployeeSettingsData = function () {
                var promise = $.Deferred();
                Employees.Servers.GetSettingsByPerson().done(function (settings) {
                    promise.resolve(settings);
                });
                return promise;
            };

            Profile.prototype.addAffiliation = function () {
                var affiliation = new Affiliation(this, this.personId);
                this.editableAffiliations.push(affiliation);
                affiliation.bindEstablishmentEditors(undefined);
            };

            Profile.prototype.load = function (startTab) {
                if (typeof startTab === "undefined") { startTab = ''; }
                var _this = this;
                if (this._loadPromise)
                    return this._loadPromise;
                this._loadPromise = $.Deferred();

                // start both requests at the same time
                //var facultyRanksPact = $.Deferred();
                //$.get(App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get())
                //    .done((data: RootViewModels.Employees.IServerFacultyRankApiModel[], textStatus: string, jqXHR: JQueryXHR): void => {
                //        facultyRanksPact.resolve(data);
                //    })
                //    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                //        facultyRanksPact.reject(jqXHR, textStatus, errorThrown);
                //    });
                var viewModelPact = $.Deferred();
                $.get('/api/user/person').done(function (data, textStatus, jqXHR) {
                    viewModelPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });

                // only process after both requests have been resolved
                viewModelPact.done(function (viewModel) {
                    //this.facultyRanks(facultyRanks); // populate the faculty ranks menu
                    //if (facultyRanks.length == 0) {
                    //    this.facultyRankId(null);
                    //}
                    ko.mapping.fromJS(viewModel, { ignore: "id" }, _this);
                    _this.personId = viewModel.id;

                    _this._originalValues = viewModel;

                    //if (!this._isInitialized) {
                    //    $(this).trigger('ready'); // ready to apply bindings
                    //    this._isInitialized = true; // bindings have been applied
                    //    this.$facultyRanks().kendoDropDownList(); // kendoui dropdown for faculty ranks
                    //}
                    //this._reloadAffiliations();
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

                    _this._loadPromise.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this._loadPromise.reject(xhr, textStatus, errorThrown);
                });

                return this._loadPromise;
            };

            Profile.prototype._startTab = function (tabName) {
                var _this = this;
                var viewModel;
                var tabStrip = $("#tabstrip").data("kendoTabStrip");

                if (tabName === "activities") {
                    if (this._activitiesViewModel == null) {
                        this._activitiesViewModel = new Activities.ViewModels.ActivityList();
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
                        this._geographicExpertisesViewModel = new RootViewModels.GeographicExpertises.GeographicExpertiseList(this.personId);
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
                        this._languageExpertisesViewModel = new RootViewModels.LanguageExpertises.LanguageExpertiseList(this.personId);
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
                        this._degreesViewModel = new RootViewModels.Degrees.DegreeList(this.personId);
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
                        this._internationalAffiliationsViewModel = new RootViewModels.InternationalAffiliations.InternationalAffiliationList(this.personId);
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

                    var affiliationPutModel = {
                        jobTitles: this.preferredTitle()
                    };
                    People.Servers.PutAffiliation(affiliationPutModel, this.defaultAffiliation.establishmentId);

                    $.ajax({
                        //url: App.Routes.WebApi.My.Profile.put(),
                        url: '/api/user/person',
                        type: 'PUT',
                        data: apiModel
                    }).done(function (responseText, statusText, xhr) {
                        App.flasher.flash(responseText);
                        _this.stopEditing();
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
        ViewModels.Profile = Profile;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
//# sourceMappingURL=Profile.js.map
