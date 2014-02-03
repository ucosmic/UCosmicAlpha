module People.ViewModels {
    export class GlobalViewModel {
        
        purgeSpinner = new App.Spinner();
        $confirmDeleteGlobal: JQuery;
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
                    App.Failures.message(xhr, 'while deleting your global expertise', true);
                }
            });
        }
        purge(expertiseId, thisData, event): void {
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
                            click: (): void => {
                                this.$confirmDeleteGlobal.dialog('close');
                                this.purgeSpinner.start(true);
                                this._purge(expertiseId);
                                //have to check before removing
                                if ($(event.target).closest("ul").children().length == 2) {
                                    $("#global_no_results").css("display", "block");
                                }
                                $(event.target).closest("li").remove();
                            },
                            'data-confirm-delete-link': true,
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.$confirmDeleteGlobal.dialog('close');
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
                if (confirm('Are you sure you want to delete this global expertise?')) {
                    this._purge(expertiseId);
                }
                else {
                    this.purgeSpinner.stop();
                }
            }
        }
        edit(id): void {
            window.location.href = App.Routes.Mvc.My.GeographicExpertise.edit(id)
        }
        addGlobal(): void {
            window.location.href = App.Routes.Mvc.My.GeographicExpertise.create();
        }
    }
}