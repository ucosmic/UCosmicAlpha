module People.ViewModels {
    export class UrlViewModel {

        constructor(model, personId) {
            this.personId = personId;
            this.bindJquery();
            this.externalLinks = ko.mapping.fromJS(model);
        }
        externalLinks = ko.mapping.fromJS([]);
        isEditing = ko.observable<Boolean>(false);
        personId;

        createLink = ko.observable<String>("");
        createDescription = ko.observable<String>("");
        editLink = ko.observable<String>("");
        editDescription = ko.observable<String>("");
        purgeSpinner = new App.Spinner();
        $confirmDeleteUrl: JQuery;
        private _purge(expertiseId): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.GeographicExpertise.del(expertiseId),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                },
                error: (xhr: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                    App.Failures.message(xhr, 'while deleting your external link', true);
                }
            });
        }
        purge(expertiseId, thisData, event): void {
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
                            click: (): void => {
                                this.$confirmDeleteUrl.dialog('close');
                                this.purgeSpinner.start(true);
                                this._purge(expertiseId);
                                //have to check before removing
                                if ($(event.target).closest("ul").children().length == 2) {
                                    $("#url_no_results").css("display", "block");
                                }
                                $(event.target).closest("li").remove();
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
        }
        edit(id): void {
            //window.location.href = App.Routes.Mvc.My.GeographicExpertise.edit(id)
        }
        addUrl(): void {
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
                }
            });
        }
        editUrl(): void {
            // window.location.href = App.Routes.Mvc.My.GeographicExpertise.create();
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
        }

    }
}