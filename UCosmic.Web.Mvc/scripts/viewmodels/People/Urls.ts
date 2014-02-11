module People.ViewModels {
    export class UrlViewModel {

        constructor(model, personId) {
            this.personId = personId;
            this.externalLinks = ko.mapping.fromJS(model);
            this.purge = <() => void > this.purge.bind(this);
            //this.bindJquery();
        }
        externalLinks = ko.mapping.fromJS([]);
        isEditing = ko.observable<Boolean>(false);
        personId;

        createLink = ko.observable<String>("");
        createDescription = ko.observable<String>("");
        createValidationMessage = ko.observable<String>("");
        editLink = ko.observable<String>("");
        editDescription = ko.observable<String>("");
        editValidationMessage = ko.observable<String>("");
        editUrlId: number;
        editItem;
        purgeSpinner = new App.Spinner();
        $confirmDeleteUrl: JQuery;
        $edit_urls_dialog = $("#edit_urls_dialog");
        private _purge(link): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: Routes.Api.People.ExternalUrls.single(this.personId, link.UrlId()),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                    this.externalLinks.remove(link);
                },
                error: (xhr: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                    App.Failures.message(xhr, 'while deleting your external link', true);
                }
            });
        }
        purge(expertiseId, thisData, event): void {
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
                            click: (): void => {
                                this.$confirmDeleteUrl.dialog('close');
                                this.purgeSpinner.start(true);
                                this._purge(expertiseId);
                            },
                            'data-confirm-delete-link': true,
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.$confirmDeleteUrl.dialog('close');
                            },
                            'data-css-link': true,
                        }
                    ],
                    close: (): void => {
                        this.purgeSpinner.stop();
                    },
                });
            }
            else {
                if (confirm('Are you sure you want to delete this url expertise?')) {
                    this._purge(expertiseId);
                }
                else {
                    this.purgeSpinner.stop();
                }
            }
            this.purgeSpinner.start();
        }

        //can't do because kendo goes and overrides this.
        //verticallyCenterWindow(kendoWindow): void {
        //    var windowHeight = window.innerHeight;
        //    var kendoWindowHeight = kendoWindow.height();
        //    var top = (windowHeight / 2) - (kendoWindowHeight / 2);
        //    kendoWindow.css("top", top+"px");
        //}

        edit(item, event): void {
            var context = ko.contextFor(event.target).$parent;
            context.editLink(item.Value());
            context.editUrlId = item.UrlId();
            $("#edit_description").data("kendoComboBox").value(item.Description());
            context.editDescription(item.Description());
            //context.verticallyCenterWindow(context.$edit_urls_dialog.parent());
            context.$edit_urls_dialog.data("kendoWindow").open().title("Urls");
            context.purgeSpinner.start();
            context.editItem = item;
            //window.location.href = App.Routes.Mvc.My.GeographicExpertise.edit(id)
        }
        isValidUrl(url): boolean {
            return url.match(/^(ht)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
        }

        validateLinks(description, link, message): string {
            message('');
            if (description.length == 0) {
                message('Link type is required. ');
            }
            if (link.length == 0) {
                message(message() + 'External link is required. ');
            }else if (!this.isValidUrl(link)) {
                message(message() + 'External link is not a valid url.')
            }
            return message();
        }

        addUrl(): void {
            if (this.validateLinks(this.createDescription(), this.createLink(), this.createValidationMessage).length > 0) {
                return;
            }
            var url = Routes.Api.People.ExternalUrls.plural(this.personId);
            var data = {
                Value: this.createLink(),
                Description: this.createDescription()
            }
            $.ajax({
                type: 'POST',
                url: url,
                data: data,
                error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                    App.Failures.message(xhr, xhr.responseText, true);
                },
                success: (response: any, statusText: string, xhr: JQueryXHR) => {
                    data = {
                        Value: this.createLink(),
                        Description: this.createDescription(),
                        UrlId: parseInt(xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1))
                    }
                    this.externalLinks.push(ko.mapping.fromJS(data));
                    this.createDescription("");
                    $("#create_description").data("kendoComboBox").value('');
                    this.createLink("")
                }
            });
        }
        editUrl(): void {
            if (this.validateLinks(this.editDescription(), this.editLink(), this.editValidationMessage).length > 0) {
                return;
            }
            this.$edit_urls_dialog.data("kendoWindow").close();
            this.purgeSpinner.stop();
            var url = Routes.Api.People.ExternalUrls.single(this.personId, this.editUrlId);
            var data = {
                Value: this.editLink(),
                Description: this.editDescription()
            }
            $.ajax({
                type: 'PUT',
                url: url,
                data: data,
                error: (xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, xhr.responseText, true);
                },
                success: (xhr: JQueryXHR) => {
                    this.editItem.Value(this.editLink());
                    this.editItem.Description(this.editDescription());
                }
            });
        }


        bindJquery(): void {
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
                    open: () => {
                        $("html, body").css("overflow", "hidden");
                        //this.verticallyCenterWindow(this.$edit_urls_dialog.parent());
                    },
                    close: () => {
                        $("html, body").css("overflow", "");
                        this.purgeSpinner.stop();

                        //var editableAffiliations = this.editableAffiliations();
                        //var editingAffiliation = Enumerable.From(editableAffiliations)
                        //    .FirstOrDefault(undefined, function (x: AffiliationSpike): boolean {
                        //        return x.isEditing();
                        //    });
                        //if (this.cancelClicked) {
                        //    editingAffiliation.cancel();
                        //}
                        //this.cancelClicked = true;
                    },
                    visible: false,
                    draggable: false,
                    resizable: false
                });
            this.$edit_urls_dialog.parent().addClass("url-kendo-window");
            var dialog = this.$edit_urls_dialog.data("kendoWindow");
            dialog.center();

            $(window).resize(() => {
                //this.verticallyCenterWindow(this.$edit_urls_dialog.parent());
                dialog.center();
            });
        }

    }
}