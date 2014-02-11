var People;
(function (People) {
    (function (ViewModels) {
        var UrlViewModel = (function () {
            function UrlViewModel(model, personId) {
                this.externalLinks = ko.mapping.fromJS([]);
                this.isEditing = ko.observable(false);
                this.createLink = ko.observable("");
                this.createDescription = ko.observable("");
                this.createValidationMessage = ko.observable("");
                this.editLink = ko.observable("");
                this.editDescription = ko.observable("");
                this.editValidationMessage = ko.observable("");
                this.purgeSpinner = new App.Spinner();
                this.$edit_urls_dialog = $("#edit_urls_dialog");
                this.personId = personId;
                this.externalLinks = ko.mapping.fromJS(model);
                this.purge = this.purge.bind(this);
            }
            UrlViewModel.prototype._purge = function (link) {
                var _this = this;
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: Routes.Api.People.ExternalUrls.single(this.personId, link.UrlId()),
                    success: function (data, textStatus, jqXHR) {
                        _this.purgeSpinner.stop();
                        _this.externalLinks.remove(link);
                    },
                    error: function (xhr) {
                        _this.purgeSpinner.stop();
                        App.Failures.message(xhr, 'while deleting your external link', true);
                    }
                });
            };
            UrlViewModel.prototype.purge = function (expertiseId, thisData, event) {
                var _this = this;
                if (this.purgeSpinner.isRunning) {
                    return;
                }
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
                this.purgeSpinner.start();
            };

            UrlViewModel.prototype.edit = function (item, event) {
                var context = ko.contextFor(event.target).$parent;
                context.editLink(item.Value());
                context.editUrlId = item.UrlId();
                $("#edit_description").data("kendoComboBox").value(item.Description());
                context.editDescription(item.Description());

                context.$edit_urls_dialog.data("kendoWindow").open().title("Urls");
                context.purgeSpinner.start();
                context.editItem = item;
            };
            UrlViewModel.prototype.isValidUrl = function (url) {
                return url.match(/^(ht)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
            };

            UrlViewModel.prototype.validateLinks = function (description, link, message) {
                message('');
                if (description.length == 0) {
                    message('Link type is required. ');
                }
                if (link.length == 0) {
                    message(message() + 'External link is required. ');
                } else if (!this.isValidUrl(link)) {
                    message(message() + 'External link is not a valid url.');
                }
                return message();
            };

            UrlViewModel.prototype.addUrl = function () {
                var _this = this;
                if (this.validateLinks(this.createDescription(), this.createLink(), this.createValidationMessage).length > 0) {
                    return;
                }
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
                    },
                    success: function (response, statusText, xhr) {
                        data = {
                            Value: _this.createLink(),
                            Description: _this.createDescription(),
                            UrlId: parseInt(xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1))
                        };
                        _this.externalLinks.push(ko.mapping.fromJS(data));
                        _this.createDescription("");
                        $("#create_description").data("kendoComboBox").value('');
                        _this.createLink("");
                    }
                });
            };
            UrlViewModel.prototype.editUrl = function () {
                var _this = this;
                if (this.validateLinks(this.editDescription(), this.editLink(), this.editValidationMessage).length > 0) {
                    return;
                }
                this.$edit_urls_dialog.data("kendoWindow").close();
                this.purgeSpinner.stop();
                var url = Routes.Api.People.ExternalUrls.single(this.personId, this.editUrlId);
                var data = {
                    Value: this.editLink(),
                    Description: this.editDescription()
                };
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    error: function (xhr) {
                        App.Failures.message(xhr, xhr.responseText, true);
                    },
                    success: function (xhr) {
                        _this.editItem.Value(_this.editLink());
                        _this.editItem.Description(_this.editDescription());
                    }
                });
            };

            UrlViewModel.prototype.bindJquery = function () {
                var _this = this;
                $(".description").kendoComboBox({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [
                        { text: "Facebook", value: "Facebook" },
                        { text: "LinkedIn", value: "LinkedIn" },
                        { text: "Departmental Homepage", value: "Departmental Homepage" }
                    ]
                });
                this.$edit_urls_dialog.kendoWindow({
                    width: 360,
                    top: 100,
                    open: function () {
                        $("html, body").css("overflow", "hidden");
                    },
                    close: function () {
                        $("html, body").css("overflow", "");
                        _this.purgeSpinner.stop();
                    },
                    visible: false,
                    draggable: false,
                    resizable: false
                });
                this.$edit_urls_dialog.parent().addClass("url-kendo-window");
                var dialog = this.$edit_urls_dialog.data("kendoWindow");
                dialog.center();

                $(window).resize(function () {
                    dialog.center();
                });
            };
            return UrlViewModel;
        })();
        ViewModels.UrlViewModel = UrlViewModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
