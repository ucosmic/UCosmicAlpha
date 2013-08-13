var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../degrees/ServiceApiModel.d.ts" />
    (function (Degrees) {
        var DegreeSearchInput = (function () {
            function DegreeSearchInput() {
            }
            return DegreeSearchInput;
        })();
        Degrees.DegreeSearchInput = DegreeSearchInput;

        var DegreeList = (function () {
            function DegreeList(personId) {
                this.personId = personId;
            }
            DegreeList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var expertiseSearchInput = new DegreeSearchInput();

                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = App.Constants.int32Max;

                $.get(App.Routes.WebApi.My.Degrees.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
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

            DegreeList.prototype.deleteEducationById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.My.Degrees.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };

            DegreeList.prototype.deleteEducation = function (data, event, viewModel) {
                $("#confirmDegreeDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete",
                            click: function () {
                                viewModel.deleteEducationById(data.id());
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

            DegreeList.prototype.editUrl = function (id) {
                return App.Routes.Mvc.My.Degrees.edit(id);
            };
            return DegreeList;
        })();
        Degrees.DegreeList = DegreeList;
    })(ViewModels.Degrees || (ViewModels.Degrees = {}));
    var Degrees = ViewModels.Degrees;
})(ViewModels || (ViewModels = {}));
