/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.Affiliations
{
    export interface IAffiliation {
    }

    export interface IAffiliationPage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

    export class AffiliationSearchInput
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
    export class AffiliationList
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

            var dataPact = $.Deferred();
            var expertiseSearchInput: AffiliationSearchInput = new AffiliationSearchInput();

            expertiseSearchInput.personId = this.personId;
            expertiseSearchInput.orderBy = "";
            expertiseSearchInput.pageNumber = 1;
            expertiseSearchInput.pageSize = 10;

            $.get(App.Routes.WebApi.Affiliations.get(), expertiseSearchInput)
                .done((data: IAffiliation[], textStatus: string, jqXHR: JQueryXHR): void => {
                    { dataPact.resolve(data); }
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    { dataPact.reject(jqXhr, textStatus, errorThrown); }
                });

            $.when(dataPact)
                .done((data: IAffiliationPage) => {
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
        deleteAffiliationById(expertiseId: number): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.Affiliations.del(expertiseId),
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
        deleteAffiliation(data: any, event: any, viewModel: any): void {
            $("#confirmAffiliationDeleteDialog").dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                            {
                                text: "Yes, confirm delete", click: function (): void {
                                    viewModel.deleteAffiliationById(data.id());
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
        editAffiliation(data: any, event: any, expertiseId: number): void {
            $.ajax({
                type: "GET",
                url: App.Routes.WebApi.Affiliations.getEditState(expertiseId),
                success: (editState: any, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    if ( editState.isInEdit ) {
                        $( "#AffiliationBeingEditedDialog" ).dialog( {
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
        newAffiliation(data: any, event: any): void {
            $.ajax({
                type: "POST",
                url: App.Routes.WebApi.Affiliations.post(),
                success: (newAffiliationId: string, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    location.href = App.Routes.Mvc.My.Profile.affiliationEdit(newAffiliationId);
                },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus + "|" + errorThrown);
                }
            });
        }
    }
}
