/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />


module ViewModels.LanguageExpertises
{
    export class LanguageExpertiseSearchInput
    {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
    }

    // ================================================================================
    /* 
    */
    // ================================================================================
    export class LanguageExpertiseList
    {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
        items: KnockoutObservableArray;

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------                        
        constructor(personId: number)
        {
            this.personId = personId;
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise
        {
            var deferred: JQueryDeferred = $.Deferred();
            var expertiseSearchInput: LanguageExpertiseSearchInput = new LanguageExpertiseSearchInput();

            expertiseSearchInput.personId = this.personId;
            expertiseSearchInput.orderBy = "";
            expertiseSearchInput.pageNumber = 1;
            expertiseSearchInput.pageSize = 2147483647; /* C# Int32.Max */

            $.get(App.Routes.WebApi.LanguageExpertises.get(), expertiseSearchInput)
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

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        deleteExpertiseById(expertiseId: number): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.LanguageExpertises.del(expertiseId),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void =>
                { },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus);
                }
            });
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
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
                                    location.href = App.Routes.Mvc.My.Profile.get(2);
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

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        editExpertise(data: any, event: any, expertiseId: number): void {
            var element = event.target;
            var url = null;

            while ( ( element != null ) && ( element.nodeName != 'TR' ) ) {
                element = element.parentElement;
            }

            if ( element != null ) {
                url = element.attributes["href"].value;
            }

            if ( url != null ) {
                location.href = url;
            }
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        newExpertise(data: any, event: any): void {
            location.href = App.Routes.Mvc.My.Profile.geographicExpertiseEdit("new");
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        formatLocations(locations: any): string
        {
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
