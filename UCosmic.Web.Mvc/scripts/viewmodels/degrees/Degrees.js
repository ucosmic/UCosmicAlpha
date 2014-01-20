var ViewModels;
(function (ViewModels) {
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
                    ko.mapping.fromJS(data, {}, _this);
                    deferred.resolve();
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while loading your degrees', true);
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
                    error: function (xhr) {
                        App.Failures.message(xhr, 'while deleting your degree', true);
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
                            text: "Yes, confirm delete", click: function () {
                                viewModel.deleteEducationById(data.id());
                                $(this).dialog("close");

                                location.href = App.Routes.Mvc.My.Profile.get("geographic-expertise");
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

            DegreeList.prototype.editUrl = function (id) {
                return App.Routes.Mvc.My.Degrees.edit(id);
            };
            return DegreeList;
        })();
        Degrees.DegreeList = DegreeList;
    })(ViewModels.Degrees || (ViewModels.Degrees = {}));
    var Degrees = ViewModels.Degrees;
})(ViewModels || (ViewModels = {}));
