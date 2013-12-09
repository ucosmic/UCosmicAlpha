/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />
var ViewModels;
(function (ViewModels) {
    (function (LanguageExpertises) {
        var LanguageExpertiseSearchInput = (function () {
            function LanguageExpertiseSearchInput() {
            }
            return LanguageExpertiseSearchInput;
        })();
        LanguageExpertises.LanguageExpertiseSearchInput = LanguageExpertiseSearchInput;

        var LanguageExpertiseList = (function () {
            function LanguageExpertiseList(personId) {
                this.personId = personId;
            }
            LanguageExpertiseList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var expertiseSearchInput = new LanguageExpertiseSearchInput();

                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = App.Constants.int32Max;

                $.get(App.Routes.WebApi.LanguageExpertise.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
                     {
                        ko.mapping.fromJS(data, {}, _this);
                        deferred.resolve();
                    }
                }).fail(function (jqXhr, textStatus, errorThrown) {
                     {
                        deferred.reject(jqXhr, textStatus, errorThrown);
                    }
                });

                return deferred;
            };

            LanguageExpertiseList.prototype.deleteExpertiseById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.LanguageExpertise.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };

            LanguageExpertiseList.prototype.deleteExpertise = function (data, event, viewModel) {
                $("#confirmLanguageExpertiseDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete", click: function () {
                                viewModel.deleteExpertiseById(data.id());
                                $(this).dialog("close");

                                /* TBD - Don't reload page. */
                                location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                            }
                        },
                        {
                            text: "No, cancel delete", click: function () {
                                $(this).dialog("close");
                            }
                        }
                    ]
                });
            };

            LanguageExpertiseList.prototype.editUrl = function (expertiseId) {
                return App.Routes.Mvc.My.LanguageExpertise.edit(expertiseId);
            };

            LanguageExpertiseList.prototype.formatLocations = function (locations) {
                var formattedLocations = "";

                for (var i = 0; i < locations.length; i += 1) {
                    if (i > 0) {
                        formattedLocations += ", ";
                    }
                    formattedLocations += locations[i].placeOfficialName();
                }

                return formattedLocations;
            };
            return LanguageExpertiseList;
        })();
        LanguageExpertises.LanguageExpertiseList = LanguageExpertiseList;
    })(ViewModels.LanguageExpertises || (ViewModels.LanguageExpertises = {}));
    var LanguageExpertises = ViewModels.LanguageExpertises;
})(ViewModels || (ViewModels = {}));
