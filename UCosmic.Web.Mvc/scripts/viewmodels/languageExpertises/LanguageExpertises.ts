/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.LanguageExpertises {

    export class LanguageExpertiseSearchInput {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
    }

    export class LanguageExpertiseList {

        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
        items: KnockoutObservableArray<any>;

        constructor(personId: number) {
            this.personId = personId;
        }

        load(): JQueryPromise {
            var deferred: JQueryDeferred<void> = $.Deferred();
            var expertiseSearchInput: LanguageExpertiseSearchInput = new LanguageExpertiseSearchInput();

            expertiseSearchInput.personId = this.personId;
            expertiseSearchInput.orderBy = "";
            expertiseSearchInput.pageNumber = 1;
            expertiseSearchInput.pageSize = App.Constants.int32Max;

            $.get(App.Routes.WebApi.LanguageExpertise.get(), expertiseSearchInput)
                .done((data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    {
                        ko.mapping.fromJS(data, {}, this);
                        deferred.resolve();
                    }
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    {
                        deferred.reject(jqXhr, textStatus, errorThrown);
                    }
                });

            return deferred;
        }

        deleteExpertiseById(expertiseId: number): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.LanguageExpertise.del(expertiseId),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void =>
                { },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus);
                }
            });
        }

        deleteExpertise(data: any, event: any, viewModel: any): void {
            $("#confirmLanguageExpertiseDeleteDialog").dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                            {
                                text: "Yes, confirm delete", click: function (): void {
                                    viewModel.deleteExpertiseById(data.id());
                                    $(this).dialog("close");

                                    /* TBD - Don't reload page. */
                                    location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                                }
                            },
                            {
                                text: "No, cancel delete", click: function (): void {
                                    $(this).dialog("close");
                                }
                            },
                ]
            });
        }

        editUrl(expertiseId: number): string {
            return App.Routes.Mvc.My.LanguageExpertise.edit(expertiseId);
        }

        formatLocations(locations: any): string {
            var formattedLocations: string = "";

            for (var i = 0; i < locations.length; i += 1)
            {
                if (i > 0) { formattedLocations += ", "; }
                formattedLocations += locations[i].placeOfficialName();
            }

            return formattedLocations;
        }
    }
}
