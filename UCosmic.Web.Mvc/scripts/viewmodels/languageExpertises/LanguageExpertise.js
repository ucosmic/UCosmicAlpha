var ViewModels;
(function (ViewModels) {
    var LanguageExpertises;
    (function (LanguageExpertises) {
        var LanguageExpertise = (function () {
            function LanguageExpertise(expertiseId, personId) {
                this.dirtyFlag = ko.observable(false);
                this.isOther = ko.observable(false);
                this.personId = ko.observable(parseInt(personId));
                this._initialize(parseInt(expertiseId));
            }
            LanguageExpertise.prototype._initialize = function (expertiseId) {
                this.id = ko.observable(expertiseId);
            };
            LanguageExpertise.prototype.setupWidgets = function (languageInputId, speakingInputId, listeningInputId, readingInputId, writingInputId) {
                var _this = this;
                $("#" + languageInputId).kendoDropDownList({
                    animation: false,
                    dataTextField: "name",
                    dataValueField: "id",
                    optionLabel: "Select...",
                    dataSource: this.languageList,
                    value: this.languageId() != null ? this.languageId() : 0,
                    change: function (e) {
                        if (e.sender.selectedIndex > 0) {
                            var item = _this.languageList[e.sender.selectedIndex - 1];
                            if (item.name == "Other") {
                                _this.languageId(null);
                            }
                            else {
                                _this.languageId(item.id);
                            }
                        }
                        else {
                            _this.languageId(null);
                        }
                    }
                });
                this.languageDroplist = $("#" + languageInputId).data("kendoDropDownList");
                if (this.languageId() == null) {
                    this.languageDroplist.select(function (dataItem) {
                        return dataItem.name === "Other";
                    });
                }
                $("#" + speakingInputId).kendoDropDownList({
                    animation: false,
                    dataTextField: "title",
                    dataValueField: "weight",
                    height: 500,
                    dataSource: this.proficiencyInfo.speakingMeanings,
                    value: this.speakingProficiency().toString(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + listeningInputId).kendoDropDownList({
                    animation: false,
                    dataTextField: "title",
                    dataValueField: "weight",
                    height: 500,
                    dataSource: this.proficiencyInfo.listeningMeanings,
                    value: this.listeningProficiency().toString(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + readingInputId).kendoDropDownList({
                    animation: false,
                    dataTextField: "title",
                    dataValueField: "weight",
                    height: 500,
                    dataSource: this.proficiencyInfo.readingMeanings,
                    value: this.readingProficiency().toString(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + writingInputId).kendoDropDownList({
                    animation: false,
                    dataTextField: "title",
                    dataValueField: "weight",
                    height: 500,
                    dataSource: this.proficiencyInfo.writingMeanings,
                    value: this.writingProficiency().toString(),
                    template: kendo.template($("#proficiency-template").html())
                });
            };
            LanguageExpertise.prototype.setupValidation = function () {
                this.languageId.extend({
                    notEqual: {
                        params: 0,
                        message: 'Please select a language or \'Other\' from this menu. ',
                    }
                });
                ko.validation.group(this);
            };
            LanguageExpertise.prototype.setupSubscriptions = function () {
                var _this = this;
                this.languageId.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.other.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.dialect.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.speakingProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.listeningProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.readingProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.writingProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
            };
            LanguageExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var proficienciesPact = $.Deferred();
                $.get(App.Routes.WebApi.LanguageExpertise.Proficiencies.get()).done(function (data, textStatus, jqXHR) {
                    proficienciesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    proficienciesPact.reject(jqXHR, textStatus, errorThrown);
                });
                var languagesPact = $.Deferred();
                $.get(App.Routes.WebApi.Languages.get()).done(function (data, textStatus, jqXHR) {
                    languagesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    languagesPact.reject(jqXHR, textStatus, errorThrown);
                });
                if (this.id() == 0) {
                    this.version = ko.observable(null);
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    this.languageId = ko.observable(0);
                    this.dialect = ko.observable(null);
                    this.other = ko.observable(null);
                    this.speakingProficiency = ko.observable(0);
                    this.listeningProficiency = ko.observable(0);
                    this.readingProficiency = ko.observable(0);
                    this.writingProficiency = ko.observable(0);
                    $.when(languagesPact, proficienciesPact).done(function (languages, proficiencyInfo, data) {
                        _this.languageList = languages;
                        _this.languageList.push({ name: "Other", code: "", id: 0 });
                        _this.proficiencyInfo = proficiencyInfo;
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                else {
                    var dataPact = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.LanguageExpertise.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        },
                    });
                    $.when(languagesPact, proficienciesPact, dataPact).done(function (languages, proficiencyInfo, data) {
                        _this.languageList = languages;
                        _this.languageList.push({ name: "Other", code: "", id: 0 });
                        _this.proficiencyInfo = proficiencyInfo;
                        ko.mapping.fromJS(data, {}, _this);
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                return deferred;
            };
            LanguageExpertise.prototype.save = function (viewModel, event) {
                var _this = this;
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                    return;
                }
                var selectedLanguageIndex = this.languageDroplist.select() - 1;
                var selectedLanguageName = this.languageList[selectedLanguageIndex].name;
                if (selectedLanguageName === "Other") {
                    if ((this.other() == null) || (this.other().length == 0)) {
                        this.isOther(true);
                        return;
                    }
                }
                var mapSource = {
                    id: this.id,
                    version: this.version,
                    personId: this.personId,
                    whenLastUpdated: this.whenLastUpdated,
                    whoLastUpdated: this.whoLastUpdated,
                    languageId: this.languageId,
                    dialect: this.dialect,
                    other: this.other,
                    speakingProficiency: this.speakingProficiency,
                    listeningProficiency: this.listeningProficiency,
                    readingProficiency: this.readingProficiency,
                    writingProficiency: this.writingProficiency,
                };
                var model = ko.mapping.toJS(mapSource);
                var url = (viewModel.id() == 0) ? App.Routes.WebApi.LanguageExpertise.post() : App.Routes.WebApi.LanguageExpertise.put(viewModel.id());
                var type = (viewModel.id() == 0) ? "POST" : "PUT";
                $.ajax({
                    type: type,
                    async: false,
                    url: url,
                    data: model,
                    success: function (data, textStatus, jqXhr) {
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        alert(textStatus + " | " + errorThrown);
                    },
                    complete: function (jqXhr, textStatus) {
                        location.href = Routes.Mvc.Employees.LanguageExpertise.detail(_this.personId());
                    }
                });
            };
            LanguageExpertise.prototype.cancel = function (item, event, mode) {
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
                                    location.href = Routes.Mvc.Employees.LanguageExpertise.detail(_this.personId());
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
                    location.href = Routes.Mvc.Employees.LanguageExpertise.detail(this.personId());
                }
            };
            return LanguageExpertise;
        })();
        LanguageExpertises.LanguageExpertise = LanguageExpertise;
    })(LanguageExpertises = ViewModels.LanguageExpertises || (ViewModels.LanguageExpertises = {}));
})(ViewModels || (ViewModels = {}));
