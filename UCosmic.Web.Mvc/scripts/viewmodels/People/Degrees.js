var People;
(function (People) {
    var ViewModels;
    (function (ViewModels) {
        var DegreeViewModel = (function () {
            function DegreeViewModel() {
                this.purgeSpinner = new App.Spinner();
            }
            DegreeViewModel.prototype._purge = function (expertiseId) {
                var _this = this;
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.My.Degrees.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                        _this.purgeSpinner.stop();
                    },
                    error: function (xhr) {
                        _this.purgeSpinner.stop();
                        App.Failures.message(xhr, 'while deleting your degree', true);
                    }
                });
            };
            DegreeViewModel.prototype.purge = function (expertiseId, thisData, event) {
                var _this = this;
                this.purgeSpinner.start();
                if (this.$confirmDeleteDegree && this.$confirmDeleteDegree.length) {
                    this.$confirmDeleteDegree.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.$confirmDeleteDegree.dialog('close');
                                    _this.purgeSpinner.start(true);
                                    _this._purge(expertiseId);
                                    if ($(event.target).closest("ul").children().length == 2) {
                                        $("#degrees_no_results").css("display", "block");
                                    }
                                    $(event.target).closest("li").remove();
                                },
                                'data-confirm-delete-link': true,
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmDeleteDegree.dialog('close');
                                },
                                'data-css-link': true,
                            }
                        ],
                        close: function () {
                            _this.purgeSpinner.stop();
                        },
                    });
                }
                else {
                    if (confirm('Are you sure you want to delete this formal education?')) {
                        this._purge(expertiseId);
                    }
                    else {
                        this.purgeSpinner.stop();
                    }
                }
            };
            DegreeViewModel.prototype.edit = function (id) {
                window.location.href = App.Routes.Mvc.My.Degrees.edit(id);
            };
            DegreeViewModel.prototype.addDegree = function () {
                window.location.href = App.Routes.Mvc.My.Degrees.create();
            };
            return DegreeViewModel;
        })();
        ViewModels.DegreeViewModel = DegreeViewModel;
    })(ViewModels = People.ViewModels || (People.ViewModels = {}));
})(People || (People = {}));
