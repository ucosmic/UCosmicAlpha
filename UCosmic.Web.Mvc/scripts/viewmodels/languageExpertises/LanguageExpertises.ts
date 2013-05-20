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
    export interface ILanguageExpertise {
    }

    export interface ILanguageExpertisePage {
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
    export class LanguageExpertiseList implements KnockoutValidationGroup
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
            var expertiseSearchInput: ExpertiseSearchInput = new ExpertiseSearchInput();

            expertiseSearchInput.personId = this.personId;
            expertiseSearchInput.orderBy = "";
            expertiseSearchInput.pageNumber = 1;
            expertiseSearchInput.pageSize = 10;

            $.get(App.Routes.WebApi.LanguageExpertises.get(), expertiseSearchInput)
                .done((data: ILanguageExpertise[], textStatus: string, jqXHR: JQueryXHR): void => {
                    { dataPact.resolve(data); }
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    { dataPact.reject(jqXhr, textStatus, errorThrown); }
                });

            $.when(dataPact)
                .done((data: ILanguageExpertisePage) => {
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
                url: App.Routes.WebApi.LanguageExpertises.get(expertiseId),
                success: (editState: any, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    if ( editState.isInEdit ) {
                        $( "#languageExpertiseBeingEditedDialog" ).dialog( {
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
                url: App.Routes.WebApi.LanguageExpertises.post(),
                success: (newExpertiseId: string, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    location.href = App.Routes.Mvc.My.Profile.languageExpertiseEdit(newExpertiseId);
                },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus + "|" + errorThrown);
                }
            });
        }
    }
}
