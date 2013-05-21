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
                $("#" + languageInputId).kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: this.languageList()
                });
                $("#" + speakingInputId).kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: this.proficiencyList(),
                    value: this.speakingProficiency
                });
                $("#" + listeningInputId).kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: this.proficiencyList(),
                    value: this.listeningProficiency
                });
                $("#" + readingInputId).kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: this.proficiencyList(),
                    value: this.readingProficiency
                });
                $("#" + writingInputId).kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: this.proficiencyList(),
                    value: this.writingProficiency
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
                    $.get(App.Routes.WebApi.LanguageExpertises.getProficiencies()).done(function (data, textStatus, jqXHR) {
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
                    $.when(languagesPact, proficienciesPact, dataPact).done(function (languages, proficiencies, data) {
                        _this.languageList = languages;
                        _this.proficiencyList = proficiencies;
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
