var People;
(function (People) {
    var ViewModels;
    (function (ViewModels) {
        var GlobalViewModel = (function () {
            function GlobalViewModel() {
                this.purgeSpinner = new App.Spinner();
            }
            GlobalViewModel.prototype._purge = function (expertiseId) {
                var _this = this;
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.GeographicExpertise.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                        _this.purgeSpinner.stop();
                    },
                    error: function (xhr) {
                        _this.purgeSpinner.stop();
                        App.Failures.message(xhr, 'while deleting your global expertise', true);
                    }
                });
            };
            GlobalViewModel.prototype.purge = function (expertiseId, thisData, event) {
                var _this = this;
                this.purgeSpinner.start();
                if (this.$confirmDeleteGlobal && this.$confirmDeleteGlobal.length) {
                    this.$confirmDeleteGlobal.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.$confirmDeleteGlobal.dialog('close');
                                    _this.purgeSpinner.start(true);
                                    _this._purge(expertiseId);
                                    if ($(event.target).closest("ul").children().length == 2) {
                                        $("#global_no_results").css("display", "block");
                                    }
                                    $(event.target).closest("li").remove();
                                },
                                'data-confirm-delete-link': true,
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmDeleteGlobal.dialog('close');
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
                    if (confirm('Are you sure you want to delete this global expertise?')) {
                        this._purge(expertiseId);
                    }
                    else {
                        this.purgeSpinner.stop();
                    }
                }
            };
            GlobalViewModel.prototype.edit = function (id) {
                window.location.href = App.Routes.Mvc.My.GeographicExpertise.edit(id);
            };
            GlobalViewModel.prototype.addGlobal = function () {
                window.location.href = App.Routes.Mvc.My.GeographicExpertise.create();
            };
            return GlobalViewModel;
        })();
        ViewModels.GlobalViewModel = GlobalViewModel;
    })(ViewModels = People.ViewModels || (People.ViewModels = {}));
})(People || (People = {}));
