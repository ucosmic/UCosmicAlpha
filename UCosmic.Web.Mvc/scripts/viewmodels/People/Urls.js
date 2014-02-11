var People;
(function (People) {
    (function (ViewModels) {
        var UrlViewModel = (function () {
            function UrlViewModel(model, personId) {
                this.externalLinks = ko.mapping.fromJS([]);
                this.isEditing = ko.observable(false);
                this.createLink = ko.observable("");
                this.createDescription = ko.observable("");
                this.editLink = ko.observable("");
                this.editDescription = ko.observable("");
                this.purgeSpinner = new App.Spinner();
                this.personId = personId;
                this.bindJquery();
                this.externalLinks = ko.mapping.fromJS(model);
            }
            UrlViewModel.prototype._purge = function (expertiseId) {
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
                        App.Failures.message(xhr, 'while deleting your external link', true);
                    }
                });
            };
            UrlViewModel.prototype.purge = function (expertiseId, thisData, event) {
                var _this = this;
                this.purgeSpinner.start();
                if (this.$confirmDeleteUrl && this.$confirmDeleteUrl.length) {
                    this.$confirmDeleteUrl.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.$confirmDeleteUrl.dialog('close');
                                    _this.purgeSpinner.start(true);
                                    _this._purge(expertiseId);

                                    if ($(event.target).closest("ul").children().length == 2) {
                                        $("#url_no_results").css("display", "block");
                                    }
                                    $(event.target).closest("li").remove();
                                },
                                'data-confirm-delete-link': true
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmDeleteUrl.dialog('close');
                                },
                                'data-css-link': true
                            }
                        ],
                        close: function () {
                            _this.purgeSpinner.stop();
                        }
                    });
                } else {
                    if (confirm('Are you sure you want to delete this url expertise?')) {
                        this._purge(expertiseId);
                    } else {
                        this.purgeSpinner.stop();
                    }
                }
            };
            UrlViewModel.prototype.edit = function (id) {
            };
            UrlViewModel.prototype.addUrl = function () {
                var url = Routes.Api.People.ExternalUrls.plural(this.personId);
                var data = {
                    Value: this.createLink(),
                    Description: this.createDescription()
                };
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: data,
                    error: function (xhr, statusText, errorThrown) {
                        App.Failures.message(xhr, xhr.responseText, true);
                    }
                });
            };
            UrlViewModel.prototype.editUrl = function () {
            };

            UrlViewModel.prototype.bindJquery = function () {
                $(".description").kendoComboBox({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [
                        { text: "Facebook", value: "Facebook" },
                        { text: "LinkedIn", value: "LinkedIn" },
                        { text: "Departmental Homepage", value: "Departmental Homepage" }
                    ]
                });
            };
            return UrlViewModel;
        })();
        ViewModels.UrlViewModel = UrlViewModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
