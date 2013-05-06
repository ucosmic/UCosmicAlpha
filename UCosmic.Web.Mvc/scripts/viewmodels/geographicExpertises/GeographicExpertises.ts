/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.GeographicExpertises
{
    export interface IGeographicExpertiseLocation {
        id: number;
        isCountry: bool;
        isBodyOfWater: bool;
        isEarth: bool;
        officialName: string;
    }

    export interface IGeographicExpertise {
    }

    export interface IGeographicExpertisePage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

    export class ExpertiseSearchInput
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
    export class GeographicExpertiseList implements KnockoutValidationGroup
    {

        expertiseLocationsList: IGeographicExpertiseLocation[];

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

            var locationsPact = $.Deferred();
            $.get(App.Routes.WebApi.GeographicExpertises.Locations.get())
                .done((data: IGeographicExpertiseLocation[], textStatus: string, jqXHR: JQueryXHR): void => {
                    locationsPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });


            var dataPact = $.Deferred();
            var expertiseSearchInput: ExpertiseSearchInput = new ExpertiseSearchInput();

            expertiseSearchInput.personId = this.personId;
            expertiseSearchInput.orderBy = "";
            expertiseSearchInput.pageNumber = 1;
            expertiseSearchInput.pageSize = 2147483647; /* C# Int32.Max */

            $.get(App.Routes.WebApi.GeographicExpertises.get(), expertiseSearchInput)
                .done((data: IGeographicExpertise[], textStatus: string, jqXHR: JQueryXHR): void => {
                    { dataPact.resolve(data); }
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    { dataPact.reject(jqXhr, textStatus, errorThrown); }
                });

            // only process after all requests have been resolved
            $.when(locationsPact, dataPact)
                .done((locations: IGeographicExpertiseLocation[],
                            data: IGeographicExpertisePage) => {

                    this.expertiseLocationsList = locations;

                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(xhr, textStatus, errorThrown);
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
                url: App.Routes.WebApi.GeographicExpertises.del(expertiseId),
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
            $("#confirmGeographicExpertiseDeleteDialog").dialog({
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
                                    location.href = App.Routes.Mvc.My.Profile.get();
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
            $.ajax({
                type: "GET",
                url: App.Routes.WebApi.GeographicExpertises.getEditState(expertiseId),
                success: (editState: any, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    if ( editState.isInEdit ) {
                        $( "#geographicExpertiseBeingEditedDialog" ).dialog( {
                            dialogClass: 'jquery-ui',
                            width: 'auto',
                            resizable: false,
                            modal: true,
                            buttons: {
                                Ok: function () {
                                    $( this ).dialog( "close" );
                                    return;
                                }
                            }
                        } );
                    }
                    else {
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
                },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus + "|" + errorThrown);
                }
            });
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        newExpertise(data: any, event: any): void {
            $.ajax({
                type: "POST",
                url: App.Routes.WebApi.GeographicExpertises.post(),
                success: (newExpertiseId: string, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    location.href = App.Routes.Mvc.My.Profile.geographicExpertiseEdit(newExpertiseId);
                },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus + "|" + errorThrown);
                }
            });
        }
    }
}
