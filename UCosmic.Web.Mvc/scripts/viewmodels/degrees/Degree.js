var ViewModels;
(function (ViewModels) {
    var Degrees;
    (function (Degrees) {
        var Degree = (function () {
            function Degree(educationId, personId) {
                this.dirtyFlag = ko.observable(false);
                this.hasBoundSearch = false;
                this.personId = ko.observable();
                this.personId(parseInt(personId));
                this._initialize(parseInt(educationId));
            }
            Degree.prototype._initialize = function (degreeId) {
                this.id = ko.observable(degreeId);
            };
            Degree.prototype.setupWidgets = function (institutionSelectorId) {
                var _this = this;
                $("#" + institutionSelectorId).kendoAutoComplete({
                    minLength: 3,
                    filter: "contains",
                    ignoreCase: true,
                    placeholder: "[Enter Institution]",
                    dataTextField: "officialName",
                    dataSource: new kendo.data.DataSource({
                        serverFiltering: true,
                        transport: {
                            read: function (options) {
                                $.ajax({
                                    url: App.Routes.WebApi.Establishments.get(),
                                    data: {
                                        keyword: options.data.filter.filters[0].value,
                                        pageNumber: 1,
                                        pageSize: App.Constants.int32Max
                                    },
                                    success: function (results) {
                                        options.success(results.items);
                                    }
                                });
                            }
                        }
                    }),
                    change: function (e) {
                    },
                    select: function (e) {
                        var me = $("#" + institutionSelectorId).data("kendoAutoComplete");
                        var dataItem = me.dataItem(e.item.index());
                        _this.institutionOfficialName(dataItem.officialName);
                        _this.institutionId(dataItem.id);
                        if ((dataItem.countryName != null) && (dataItem.countryName.length > 0)) {
                            _this.institutionCountryOfficialName(dataItem.countryName);
                        }
                        else {
                            _this.institutionCountryOfficialName(null);
                        }
                    }
                });
            };
            Degree.prototype.setupValidation = function () {
                this.title.extend({
                    required: {
                        params: true,
                        message: 'Degree is required.',
                    },
                    minLength: 1,
                    maxLength: 256,
                });
                this.yearAwarded.extend({ min: 1900 });
                this.institutionId.extend({ required: true });
                ko.validation.group(this);
            };
            Degree.prototype.setupSubscriptions = function () {
                var _this = this;
                this.title.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.fieldOfStudy.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.yearAwarded.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.institutionId.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                    _this.almaMaterErrorMsg('');
                });
            };
            Degree.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                this.almaMaterErrorMsg = ko.observable('');
                if (this.id() == 0) {
                    this.version = ko.observable(null);
                    this.title = ko.observable(null);
                    this.fieldOfStudy = ko.observable(null);
                    this.yearAwarded = ko.observable(null);
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    this.institutionId = ko.observable(null);
                    this.institutionOfficialName = ko.observable(null);
                    this.institutionCountryOfficialName = ko.observable(null);
                    this.institutionTranslatedName = ko.observable(null);
                    this.institutionOfficialNameDoesNotMatchTranslation = ko.observable(null);
                    this.almaMaterButtonText = ko.observable('Choose my alma mater');
                    deferred.resolve();
                }
                else {
                    var dataPact = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.My.Degrees.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        },
                    });
                    $.when(dataPact).done(function (data) {
                        ko.mapping.fromJS(data, {}, _this);
                        _this.institutionOfficialNameDoesNotMatchTranslation = ko.observable(!((_this.institutionOfficialName() === _this.institutionTranslatedName()) || _this.institutionOfficialName() == undefined));
                        _this.almaMaterButtonText = ko.observable('Change my alma mater');
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                return deferred;
            };
            Degree.prototype.save = function (viewModel, event) {
                var _this = this;
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                    if (!this.institutionId()) {
                        this.almaMaterErrorMsg('You must choose your alma mater.');
                    }
                    return;
                }
                if (this.yearAwarded() != null) {
                    var yearAwaredStr = this.yearAwarded().toString();
                    yearAwaredStr = $.trim(yearAwaredStr);
                    if (yearAwaredStr.length == 0) {
                        this.yearAwarded(null);
                    }
                }
                var mapSource = {
                    id: this.id,
                    version: this.version,
                    personId: this.personId,
                    whenLastUpdated: this.whenLastUpdated,
                    whoLastUpdated: this.whoLastUpdated,
                    title: this.title,
                    fieldOfStudy: this.fieldOfStudy,
                    yearAwarded: this.yearAwarded,
                    institutionId: this.institutionId
                };
                var model = ko.mapping.toJS(mapSource);
                var url = (viewModel.id() == 0) ? App.Routes.WebApi.My.Degrees.post() : App.Routes.WebApi.My.Degrees.put(viewModel.id());
                var type = (viewModel.id() == 0) ? "POST" : "PUT";
                $.ajax({
                    type: type,
                    async: false,
                    url: url,
                    data: model,
                    success: function (data, textStatus, jqXhr) {
                    },
                    error: function (xhr) {
                        App.Failures.message(xhr, 'while trying to save your degree', true);
                    },
                    complete: function (jqXhr, textStatus) {
                        location.href = Routes.Mvc.Employees.Degrees.detail(_this.personId());
                    }
                });
            };
            Degree.prototype.cancel = function (item, event, mode) {
                var _this = this;
                if (this.dirtyFlag() == true) {
                    var $dialog = $('#cancelConfirmDialog');
                    $dialog.dialog({
                        modal: true,
                        resizable: false,
                        width: 'auto',
                        buttons: [
                            {
                                text: 'Yes, cancel & lose changes',
                                click: function () {
                                    location.href = Routes.Mvc.Employees.Degrees.detail(_this.personId());
                                    $dialog.dialog('close');
                                },
                            },
                            {
                                text: 'No, do not cancel',
                                click: function () {
                                    $dialog.dialog('close');
                                },
                                'data-css-link': true,
                            },
                        ],
                    });
                }
                else {
                    location.href = Routes.Mvc.Employees.Degrees.detail(this.personId());
                }
            };
            Degree.prototype.removeParticipant = function (establishmentResultViewModel, e) {
                this.institutionId(null);
                this.institutionOfficialName(null);
                this.institutionCountryOfficialName(null);
                this.institutionTranslatedName(null);
                this.institutionOfficialNameDoesNotMatchTranslation(null);
                return false;
            };
            Degree.prototype.addParticipant = function (establishmentResultViewModel) {
                if (!this.hasBoundSearch) {
                    var search = new Establishments.ViewModels.Search;
                    search.sammy.setLocation('#/page/1/');
                    this.nav = new ViewModels.Degrees.EstablishmentSearchNav(this.institutionId, this.institutionOfficialName, this.institutionCountryOfficialName, this.institutionTranslatedName, this.id, this.institutionOfficialNameDoesNotMatchTranslation);
                    this.nav.bindSearch();
                }
                else {
                    this.nav.establishmentSearchViewModel.sammy.setLocation('#/page/');
                }
                this.hasBoundSearch = true;
            };
            return Degree;
        })();
        Degrees.Degree = Degree;
    })(Degrees = ViewModels.Degrees || (ViewModels.Degrees = {}));
})(ViewModels || (ViewModels = {}));
