/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../formalEducations/ServiceApiModel.d.ts"

module ViewModels.FormalEducations
{
    // ================================================================================
    /* 
    */
    // ================================================================================
    //export class FormalEducationList implements KnockoutValidationGroup
    //{
    //    personId: number;
    //    orderBy: string;
    //    pageSize: number;
    //    pageNumber: number;
    //    items: KnockoutObservableArray;

    //    // --------------------------------------------------------------------------------
    //    /* 
    //    */
    //    // --------------------------------------------------------------------------------                        
    //    constructor(personId: number)
    //    {
    //        this.personId = personId;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /* 
    //    */
    //    // --------------------------------------------------------------------------------
    //    load(): JQueryPromise
    //    {
    //        var deferred: JQueryDeferred = $.Deferred();

    //        var dataPact = $.Deferred();
    //        var expertiseSearchInput: Service.ApiModels.EducationSearchInput = new Service.ApiModels.EducationSearchInput();

    //        expertiseSearchInput.personId = this.personId;
    //        expertiseSearchInput.orderBy = "";
    //        expertiseSearchInput.pageNumber = 1;
    //        expertiseSearchInput.pageSize = 10;

    //        $.get(App.Routes.WebApi.FormalEducations.get(), expertiseSearchInput)
    //            .done((data: Service.ApiModels.IFormalEducation[], textStatus: string, jqXHR: JQueryXHR): void => {
    //                { dataPact.resolve(data); }
    //            })
    //            .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
    //                { dataPact.reject(jqXhr, textStatus, errorThrown); }
    //            });

    //        $.when(dataPact)
    //            .done((data: Service.ApiModels.IFormalEducationPage) => {
    //                deferred.resolve();
    //            })
    //            .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
    //                deferred.reject(xhr, textStatus, errorThrown);
    //            });

    //        return deferred;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /* 
    //    */
    //    // --------------------------------------------------------------------------------
    //    deleteEducationById(expertiseId: number): void {
    //        $.ajax({
    //            async: false,
    //            type: "DELETE",
    //            url: App.Routes.WebApi.FormalEducations.del(expertiseId),
    //            success: (data: any, textStatus: string, jqXHR: JQueryXHR): void =>
    //            { },
    //            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
    //            {
    //                alert(textStatus);
    //            }
    //        });
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //    */
    //    // --------------------------------------------------------------------------------
    //    deleteEducation(data: any, event: any, viewModel: any): void {
    //        $("#confirmFormalEducationDeleteDialog").dialog({
    //            dialogClass: 'jquery-ui',
    //            width: 'auto',
    //            resizable: false,
    //            modal: true,
    //            buttons: [
    //                        {
    //                            text: "Yes, confirm delete", click: function (): void {
    //                                viewModel.deleteEducationById(data.id());
    //                                $(this).dialog("close");

    //                                /* TBD - Don't reload page. */
    //                                location.href = App.Routes.Mvc.My.Profile.get();
    //                            }
    //                        },
    //                        {
    //                            text: "No, cancel delete", click: function (): void {
    //                                $(this).dialog("close");
    //                            }
    //                        },
    //            ]
    //        });
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //    */
    //    // --------------------------------------------------------------------------------
    //    editEducation(data: any, event: any, expertiseId: number): void {
    //        $.ajax({
    //            type: "GET",
    //            url: App.Routes.WebApi.FormalEducations.getEditState(expertiseId),
    //            success: (editState: any, textStatus: string, jqXHR: JQueryXHR): void =>
    //            {
    //                if ( editState.isInEdit ) {
    //                    $( "#formalEducationBeingEditedDialog" ).dialog( {
    //                        dialogClass: 'jquery-ui',
    //                        width: 'auto',
    //                        resizable: false,
    //                        modal: true,
    //                        buttons: {
    //                            Ok: function () {
    //                                $( this ).dialog( "close" );
    //                                return;
    //                            }
    //                        }
    //                    } );
    //                }
    //                else {
    //                    var element = event.target;
    //                    var url = null;

    //                    while ( ( element != null ) && ( element.nodeName != 'TR' ) ) {
    //                        element = element.parentElement;
    //                    }

    //                    if ( element != null ) {
    //                        url = element.attributes["href"].value;
    //                    }

    //                    if ( url != null ) {
    //                        location.href = url;
    //                    }
    //                }
    //            },
    //            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
    //            {
    //                alert(textStatus + "|" + errorThrown);
    //            }
    //        });
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //    */
    //    // --------------------------------------------------------------------------------
    //    newEducation(data: any, event: any): void {
    //        $.ajax({
    //            type: "POST",
    //            url: App.Routes.WebApi.FormalEducations.post(),
    //            success: (newEducationId: string, textStatus: string, jqXHR: JQueryXHR): void =>
    //            {
    //                location.href = App.Routes.Mvc.My.Profile.formalEducationEdit(newEducationId);
    //            },
    //            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
    //            {
    //                alert(textStatus + "|" + errorThrown);
    //            }
    //        });
    //    }
    //}
}
