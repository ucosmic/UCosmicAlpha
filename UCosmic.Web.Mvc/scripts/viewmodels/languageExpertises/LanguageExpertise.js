var ViewModels;
(function (ViewModels) {
    (function (LanguageExpertises) {
        var LanguageExpertise = (function () {
            function LanguageExpertise(expertiseId) {
                this.inititializationErrors = "";
                this.saving = false;
                this.dirtyFlag = ko.observable(false);
                this._initialize(expertiseId);
            }
            LanguageExpertise.prototype._initialize = function (expertiseId) {
                if(expertiseId === "new") {
                    this.id = ko.observable(0);
                } else {
                    this.id = ko.observable(Number(expertiseId));
                }
            };
            LanguageExpertise.prototype.setupWidgets = function (languageInputId, speakingInputId, listeningInputId, readingInputId, writingInputId) {
                var _this = this;
                $("#" + languageInputId).kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: this.languageList,
                    value: this.languageId() != null ? this.languageId() : 1,
                    change: function (e) {
                        var item = _this.languageList[e.sender.selectedIndex];
                        if(item.name == "Other") {
                            _this.languageId(null);
                        } else {
                            _this.languageId(item.id);
                        }
                    }
                });
                $("#" + speakingInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.speakingMeanings,
                    value: this.speakingProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + listeningInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.listeningMeanings,
                    value: this.listeningProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + readingInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.readingMeanings,
                    value: this.readingProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + writingInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.writingMeanings,
                    value: this.writingProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
            };
            LanguageExpertise.prototype.setupValidation = function () {
                ko.validation.rules['atLeast'] = {
                    validator: function (val, otherVal) {
                        return val.length >= otherVal;
                    },
                    message: 'At least {0} must be selected.'
                };
                ko.validation.registerExtenders();
                ko.validation.group(this);
            };
            LanguageExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                if(this.id() == 0) {
                    this.version = ko.observable(null);
                    this.personId = ko.observable(0);
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    this.languageId = ko.observable(0);
                    this.dialect = ko.observable(null);
                    this.other = ko.observable(null);
                    this.speakingProficiency = ko.observable(0);
                    this.listeningProficiency = ko.observable(0);
                    this.readingProficiency = ko.observable(0);
                    this.writingProficiency = ko.observable(0);
                    deferred.resolve();
                } else {
                    var languagesPact = $.Deferred();
                    $.get(App.Routes.WebApi.Languages.get()).done(function (data, textStatus, jqXHR) {
                        languagesPact.resolve(data);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        languagesPact.reject(jqXHR, textStatus, errorThrown);
                    });
                    var proficienciesPact = $.Deferred();
                    $.get(App.Routes.WebApi.LanguageProficiency.get()).done(function (data, textStatus, jqXHR) {
                        proficienciesPact.resolve(data);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        proficienciesPact.reject(jqXHR, textStatus, errorThrown);
                    });
                    var dataPact = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.LanguageExpertises.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        }
                    });
                    $.when(languagesPact, proficienciesPact, dataPact).done(function (languages, proficiencyInfo, data) {
                        _this.languageList = languages;
                        _this.languageList.push({
                            name: "Other",
                            code: "",
                            id: 0
                        });
                        _this.proficiencyInfo = proficiencyInfo;
                        debugger;

                        ko.mapping.fromJS(data, {
                        }, _this);
                        _this.languageId.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.other.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.dialect.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.speakingProficiency.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.listeningProficiency.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.readingProficiency.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        _this.writingProficiency.subscribe(function (newValue) {
                            _this.dirtyFlag(true);
                        });
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                return deferred;
            };
            LanguageExpertise.prototype.save = function (viewModel, event) {
                var _this = this;
                if(!this.isValid()) {
                    return;
                }
                while(this.saving) {
                    alert("Please wait while expertise is saved.");
                }
                debugger;

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
                    writingProficiency: this.writingProficiency
                };
                var model = ko.mapping.toJS(mapSource);
                var url = (viewModel.id() == 0) ? App.Routes.WebApi.LanguageExpertises.post() : App.Routes.WebApi.LanguageExpertises.put(viewModel.id());
                var type = (viewModel.id() == 0) ? "POST" : "PUT";
                this.saving = true;
                $.ajax({
                    type: type,
                    url: url,
                    data: model,
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.saving = false;
                        location.href = App.Routes.Mvc.My.Profile.get(2);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        alert(textStatus + " | " + errorThrown);
                        location.href = App.Routes.Mvc.My.Profile.get(2);
                    }
                });
            };
            LanguageExpertise.prototype.cancel = function (item, event, mode) {
                if(this.dirtyFlag() == true) {
                    $("#cancelConfirmDialog").dialog({
                        modal: true,
                        resizable: false,
                        width: 450,
                        buttons: {
                            "Do not cancel": function () {
                                $(this).dialog("close");
                            },
                            "Cancel and lose changes": function () {
                                $(this).dialog("close");
                                location.href = App.Routes.Mvc.My.Profile.get(2);
                            }
                        }
                    });
                } else {
                    location.href = App.Routes.Mvc.My.Profile.get(2);
                }
            };
            return LanguageExpertise;
        })();
        LanguageExpertises.LanguageExpertise = LanguageExpertise;        
    })(ViewModels.LanguageExpertises || (ViewModels.LanguageExpertises = {}));
    var LanguageExpertises = ViewModels.LanguageExpertises;
})(ViewModels || (ViewModels = {}));
