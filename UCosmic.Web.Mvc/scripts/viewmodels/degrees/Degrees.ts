/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../degrees/ServiceApiModel.d.ts" />

module ViewModels.Degrees
{
    export class DegreeSearchInput
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
    export class DegreeList
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
            var expertiseSearchInput: DegreeSearchInput = new DegreeSearchInput();

            expertiseSearchInput.personId = this.personId;
            expertiseSearchInput.orderBy = "";
            expertiseSearchInput.pageNumber = 1;
            expertiseSearchInput.pageSize = 2147483647; /* C# Int32.Max */

            $.get(App.Routes.WebApi.Degrees.get(), expertiseSearchInput)
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
        deleteEducationById(expertiseId: number): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.Degrees.del(expertiseId),
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
        deleteEducation(data: any, event: any, viewModel: any): void {
            $("#confirmDegreeDeleteDialog").dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                            {
                                text: "Yes, confirm delete", click: function (): void {
                                    viewModel.deleteEducationById(data.id());
                                    $(this).dialog("close");

                                    /* TBD - Don't reload page. */
                                    location.href = App.Routes.Mvc.My.Profile.get(3);
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
        editEducation(data: any, event: any, expertiseId: number): void {
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
        newEducation(data: any, event: any): void {
            location.href = App.Routes.Mvc.My.Profile.degreeEdit("new");
        }
    }
}
