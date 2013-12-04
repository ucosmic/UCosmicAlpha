var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    (function (GeographicExpertises) {
        var GeographicExpertiseSearchInput = (function () {
            function GeographicExpertiseSearchInput() {
            }
            return GeographicExpertiseSearchInput;
        })();
        GeographicExpertises.GeographicExpertiseSearchInput = GeographicExpertiseSearchInput;

        var GeographicExpertiseList = (function () {
            function GeographicExpertiseList(personId) {
                this.personId = personId;
            }
            GeographicExpertiseList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var expertiseSearchInput = new GeographicExpertiseSearchInput();

                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = App.Constants.int32Max;

                $.get(App.Routes.WebApi.GeographicExpertise.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
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

            GeographicExpertiseList.prototype.deleteExpertiseById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.GeographicExpertise.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };

            GeographicExpertiseList.prototype.deleteExpertise = function (data, event, viewModel) {
                $("#confirmGeographicExpertiseDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete",
                            click: function () {
                                viewModel.deleteExpertiseById(data.id());
                                $(this).dialog("close");

                                /* TBD - Don't reload page. */
                                location.href = App.Routes.Mvc.My.Profile.get("geographic-expertise");
                            }
                        },
                        {
                            text: "No, cancel delete",
                            click: function () {
                                $(this).dialog("close");
                            }
                        }
                    ]
                });
            };

            GeographicExpertiseList.prototype.editExpertiseUrl = function (expertiseId) {
                return App.Routes.Mvc.My.GeographicExpertise.edit(expertiseId);
            };

            GeographicExpertiseList.prototype.formatLocations = function (locations) {
                var formattedLocations = "";

                for (var i = 0; i < locations.length; i += 1) {
                    if (i > 0) {
                        formattedLocations += ", ";
                    }
                    formattedLocations += locations[i].placeOfficialName();
                }

                return formattedLocations;
            };
            return GeographicExpertiseList;
        })();
        GeographicExpertises.GeographicExpertiseList = GeographicExpertiseList;
    })(ViewModels.GeographicExpertises || (ViewModels.GeographicExpertises = {}));
    var GeographicExpertises = ViewModels.GeographicExpertises;
})(ViewModels || (ViewModels = {}));
//# sourceMappingURL=GeographicExpertises.js.map
