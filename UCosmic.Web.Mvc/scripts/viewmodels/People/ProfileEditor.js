var People;
(function (People) {
    (function (ViewModels) {
        var AffiliatedEstablishmentEditorSpike = (function () {
            function AffiliatedEstablishmentEditorSpike(owner, options, establishment) {
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
            AffiliatedEstablishmentEditorSpike.prototype._getOptionsCaption = function (options) {
                var _this = this;
                var isFirst = Enumerable.From(options).All(function (x) {
                    return x.parentId == _this.owner.owner.defaultAffiliation.establishmentId;
                });
                var caption = isFirst ? '[Select main affiliation]' : '[Select sub-affiliation or leave empty]';
                return caption;
            };

            AffiliatedEstablishmentEditorSpike.prototype._getSelectOptions = function (options) {
                var selectOptions = Enumerable.From(options).Select(function (x) {
                    return {
                        text: x.contextName || x.officialName,
                        value: x.id
                    };
                }).ToArray();
                return selectOptions;
            };

            AffiliatedEstablishmentEditorSpike.prototype._onSelectedValueChanged = function (newValue) {
                var siblingEditors = this.owner.establishmentEditors();
                if (newValue) {
                    this.owner.bindEstablishmentEditors(newValue);
                } else {
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
            return AffiliatedEstablishmentEditorSpike;
        })();
        ViewModels.AffiliatedEstablishmentEditorSpike = AffiliatedEstablishmentEditorSpike;

        var AffiliationSpike = (function () {
            function AffiliationSpike(owner, dataOrPersonId) {
                var _this = this;
                this.affiliationId = ko.observable();
                this.personId = ko.observable();
                this.establishmentId = ko.observable();
                this.isDefault = ko.observable();
                this.jobTitles = ko.observable();
                this.facultyRank = ko.observable();
                this.establishments = ko.observableArray();
                this.hideValidationMessages = ko.observable(true);
                this.saveSpinner = new App.Spinner({ delay: 200 });
                this.purgeSpinner = new App.Spinner();
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
                this.facultyRankSelect = new App.FormSelect({ kendoOptions: {} });
                this.hasFacultyRanks = ko.observable(false);
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

                setTimeout(function () {
                    _this._loadFacultyRankOptions();
                }, 0);
                this._initValidation();
            }
            AffiliationSpike.prototype.edit = function (me) {
                this.owner.startEditingAffiliations();
                this.bindEstablishmentEditors(this.establishmentId());
                this.isEditing(true);
            };

            AffiliationSpike.prototype.cancel = function () {
                this.owner.cancelClicked = false;
                this.owner.$edit_affiliations_dialog.data("kendoWindow").close();
                var affiliationId = this.affiliationId();
                if (!affiliationId) {
                    this.owner.editableAffiliations.remove(this);
                    return;
                }

                ko.mapping.fromJS(this.data, {}, this);

                var selectedFacultyRank = this.facultyRank();
                if (selectedFacultyRank)
                    this.facultyRankSelect.value(selectedFacultyRank.facultyRankId());
                this.isEditing(false);
            };

            AffiliationSpike.prototype._initValidation = function () {
                var _this = this;
                this.jobTitles.extend({
                    maxLength: {
                        message: 'Position Title(s) cannot contain more than 500 characters.',
                        params: 500
                    }
                });

                this.firstEstablishmentId.extend({
                    required: {
                        message: 'At least one main affiliation is required.'
                    }
                });

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

            AffiliationSpike.prototype.save = function () {
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
                    _this.owner.cancelClicked = false;
                    _this.owner.$edit_affiliations_dialog.data("kendoWindow").close();
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to save your affiliation', true);
                    _this.saveSpinner.stop();
                });
            };

            AffiliationSpike.prototype.purge = function () {
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

            AffiliationSpike.prototype._purge = function () {
                var _this = this;
                People.Servers.DeleteAffiliation(this.establishmentId()).done(function () {
                    _this.owner.affiliationData.reload();
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to delete your affiliation', true);
                    _this.purgeSpinner.stop();
                });
            };

            AffiliationSpike.prototype.bindEstablishmentEditors = function (establishmentId) {
                var _this = this;
                this.owner.establishmentData.ready().done(function (offspring) {
                    _this._bindEstablishmentEditors(establishmentId, offspring);
                });
            };

            AffiliationSpike.prototype._bindEstablishmentEditors = function (establishmentId, offspring) {
                this.establishmentEditors([]);

                var currentEstablishmentId = establishmentId;
                while (currentEstablishmentId && currentEstablishmentId != this.owner.defaultAffiliation.establishmentId) {
                    var currentEstablishment = this._bindEstablishmentEditor(currentEstablishmentId, offspring);
                    currentEstablishmentId = currentEstablishment.parentId;
                }

                this._bindEstablishmentEditor(establishmentId, offspring, true);
            };

            AffiliationSpike.prototype._bindEstablishmentEditor = function (establishmentId, offspring, isLast) {
                if (typeof isLast === "undefined") { isLast = false; }
                var establishment = this._getEstablishmentById(establishmentId, offspring);

                var options = this._getEstablishmentEditorOptions(establishment ? !isLast ? establishment.parentId : establishment.id : this.owner.defaultAffiliation.establishmentId, offspring);

                if (options.length) {
                    var editor = new AffiliatedEstablishmentEditorSpike(this, options, !isLast ? establishment : undefined);

                    if (!isLast) {
                        this.establishmentEditors.unshift(editor);
                    } else {
                        this.establishmentEditors.push(editor);
                    }
                }
                this.owner.hasAffiliationsEditorLoaded(true);
                return establishment;
            };

            AffiliationSpike.prototype._getEstablishmentById = function (establishmentId, offspring) {
                var establishment = Enumerable.From(offspring).SingleOrDefault(undefined, function (x) {
                    return x.id == establishmentId;
                });
                return establishment;
            };

            AffiliationSpike.prototype._getEstablishmentEditorOptions = function (parentId, offspring) {
                var options = Enumerable.From(offspring).Where(function (x) {
                    return x.parentId == parentId;
                }).OrderBy(function (x) {
                    return x.rank;
                }).ThenBy(function (x) {
                    return x.contextName || x.officialName;
                }).ToArray();
                return options;
            };

            AffiliationSpike.prototype._loadFacultyRankOptions = function () {
                var _this = this;
                this.owner.employeeSettingsData.ready().done(function (settings) {
                    _this._bindFacultyRankOptions(settings);
                });
            };

            AffiliationSpike.prototype._bindFacultyRankOptions = function (settings) {
                if (settings && settings.facultyRanks && settings.facultyRanks.length) {
                    this.hasFacultyRanks(true);
                    var options = this._getFacultyRankSelectOptions(settings);
                    this.facultyRankSelect.caption('[None]');
                    this.facultyRankSelect.options(options);
                    var facultyRank = this.facultyRank();
                    if (facultyRank)
                        this.facultyRankSelect.value(facultyRank.facultyRankId());
                }
            };

            AffiliationSpike.prototype._getFacultyRankSelectOptions = function (settings) {
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

            AffiliationSpike.prototype._computeJobTitles = function () {
                var jobTitles = this.jobTitles();
                jobTitles = jobTitles || '';
                jobTitles = jobTitles.replace(/\n/g, '<br />');
                return jobTitles;
            };
            return AffiliationSpike;
        })();
        ViewModels.AffiliationSpike = AffiliationSpike;

        var ProfileSpike = (function () {
            function ProfileSpike(personId) {
                var _this = this;
                this.hasAffiliationsEditorLoaded = ko.observable(false);
                this.hasViewModelLoaded = ko.observable(false);
                this.personId = 0;
                this.isEditMode = ko.observable(false);
                this.saveSpinner = new App.Spinner({ delay: 200 });
                this.cancelClicked = true;
                this.preferredTitle = ko.observable();
                this.$edit_affiliations_dialog = $("#edit_affiliations_dialog");
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
                this.affiliationData.ready();
                this.hasViewModelLoaded(true);
            }
            ProfileSpike.prototype.facultyRankAutoUpdate = function (data) {
                if (data.value() == undefined) {
                    return null;
                }
                var match = ko.utils.arrayFirst(data.options(), function (item) {
                    return data.value() === item.value;
                });
                return match.text;
            };

            ProfileSpike.prototype.affiliatedEstablishmentsAutoUpdate = function (data) {
                if (data.value() == undefined) {
                    return null;
                }
                var match = ko.utils.arrayFirst(data.options(), function (item) {
                    return data.value() === item.value;
                });
                return match.text;
            };

            ProfileSpike.prototype.bindJquery = function () {
                var _this = this;
                var self = this, kacSelect, positioned = false;

                this.$edit_affiliations_dialog.kendoWindow({
                    width: 550,
                    open: function () {
                        $("html, body").css("overflow", "hidden");
                        _this.isEditMode(true);
                    },
                    close: function () {
                        $("html, body").css("overflow", "");
                        _this.isEditMode(false);

                        var editableAffiliations = _this.editableAffiliations();
                        var editingAffiliation = Enumerable.From(editableAffiliations).FirstOrDefault(undefined, function (x) {
                            return x.isEditing();
                        });
                        if (_this.cancelClicked) {
                            editingAffiliation.cancel();
                        }
                        _this.cancelClicked = true;
                    },
                    activate: function () {
                        if (positioned === false) {
                            _this.$edit_affiliations_dialog.parent().css({ "display": "none" });
                            _this.$edit_affiliations_dialog.parent().css({ "visibility": "visible" });
                            _this.$edit_affiliations_dialog.parent().fadeIn(200);
                            _this.$edit_affiliations_dialog.parent().css({ "left": (_this.$edit_affiliations_dialog.parent().offset().left + 215) + "px" });
                            positioned = true;
                        }
                    },
                    visible: false,
                    draggable: false,
                    resizable: false
                });
                this.$edit_affiliations_dialog.parent().css({ "visibility": "hidden" });
                this.$edit_affiliations_dialog.parent().addClass("affiliations-kendo-window");
            };

            ProfileSpike.prototype._loadAffiliationData = function () {
                var _this = this;
                var promise = $.Deferred();

                People.Servers.GetAffiliationsByPerson().done(function (affiliations) {
                    _this.defaultAffiliation = Enumerable.From(affiliations).Single(function (x) {
                        return x.isDefault;
                    });
                    _this.preferredTitle(_this.defaultAffiliation.jobTitles);

                    var editableAffiliations = Enumerable.From(affiliations).Except([_this.defaultAffiliation]).OrderBy(function (x) {
                        return x.affiliationId;
                    }).ToArray();

                    ko.mapping.fromJS(editableAffiliations, {
                        create: function (options) {
                            return new AffiliationSpike(_this, options.data);
                        }
                    }, _this.editableAffiliations);

                    _this.establishmentData.ready();
                    _this.employeeSettingsData.ready();
                    _this.affiliationsSpinner.stop();
                    promise.resolve(affiliations);
                });
                return promise;
            };

            ProfileSpike.prototype._loadEstablishmentData = function () {
                var promise = $.Deferred();
                Establishments.Servers.GetOffspring(this.defaultAffiliation.establishmentId).done(function (offspring) {
                    promise.resolve(offspring);
                });
                return promise;
            };

            ProfileSpike.prototype._loadEmployeeSettingsData = function () {
                var promise = $.Deferred();
                Employees.Servers.GetSettingsByPerson().done(function (settings) {
                    promise.resolve(settings);
                });
                return promise;
            };

            ProfileSpike.prototype.addAffiliation = function (me) {
                this.startEditingAffiliations();
                var affiliation = new AffiliationSpike(this, this.personId);
                this.editableAffiliations.push(affiliation);
                affiliation.bindEstablishmentEditors(undefined);
            };

            ProfileSpike.prototype.startEditingAffiliations = function () {
                this.$edit_affiliations_dialog.data("kendoWindow").open().title("Affiliations");
            };

            ProfileSpike.prototype.saveAffiliations = function () {
                var affiliationPutModel = {
                    jobTitles: this.preferredTitle()
                };
                People.Servers.PutAffiliation(affiliationPutModel, this.defaultAffiliation.establishmentId);
            };
            return ProfileSpike;
        })();
        ViewModels.ProfileSpike = ProfileSpike;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
