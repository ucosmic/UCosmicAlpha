/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../tinymce/tinymce.d.ts" />
/// <reference path="../../oss/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />


module ViewModels.GeographicExpertises {
    // ================================================================================
    /* 
    */
    // ================================================================================
    export class GeographicExpertise {
        /* Initialization errors. */
        inititializationErrors: string = "";

        /* In the process of saving */
        saving: bool = false;

        /* Element id of place autocomplete */
        locationSelectorId: string;

        /* IObservableDegree implemented */
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
        description: KnockoutObservableString;
        placeId: KnockoutObservableNumber;
        placeOfficialName: KnockoutObservableString;
        errors: KnockoutValidationErrors;
        isValid: () => bool;
        isAnyMessageShown: () => bool;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize( expertiseId: number ): void {
            this.id = ko.observable( expertiseId );
        }

        // --------------------------------------------------------------------------------
        /*
            */
        // --------------------------------------------------------------------------------   
        setupWidgets( locationSelectorId: string ): void {

            this.locationSelectorId = locationSelectorId;

            $( "#" + locationSelectorId ).kendoAutoComplete( {
                minLength: 3,
                filter: "contains",
                ignoreCase: true,
                placeholder: "[Enter Location]",
                dataTextField: "officialName",
                dataSource: new kendo.data.DataSource( {
                    serverFiltering: true,
                    transport: {
                        read: ( options: any ): void => {
                            $.ajax( {
                                url: App.Routes.WebApi.Places.get(),
                                data: {
                                    keyword: options.data.filter.filters[0].value,
                                    pageNumber: 1,
                                    pageSize: 2147483647 /* C# Int32.Max */
                                },
                                success: ( results: any ): void => {
                                    options.success( results.items );
                                }
                            } );
                        }
                    }
                } ),
                select: ( e: any ): void => {
                    var me = $( "#" + locationSelectorId ).data( "kendoAutoComplete" );
                    var dataItem = me.dataItem( e.item.index() );
                    this.placeId(dataItem.id);
                    if ( ( dataItem.placeOfficialName != null ) && ( dataItem.placeOfficialName.length > 0 ) ) {
                        this.placeOfficialName(dataItem.placeOfficialName);
                    }
                    else {
                        this.placeOfficialName(null);
                    }
                }
            } );

        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
            this.placeId.extend( { required: true } );

            ko.validation.group( this );
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        constructor( educationId: number ) {
            this._initialize( educationId );
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var deferred: JQueryDeferred = $.Deferred();

            var dataPact = $.Deferred();

            $.ajax( {
                type: "GET",
                url: App.Routes.WebApi.GeographicExpertises.get( this.id() ),
                success: function ( data: any, textStatus: string, jqXhr: JQueryXHR ): void
                    { dataPact.resolve( data ); },
                error: function ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void
                    { dataPact.reject( jqXhr, textStatus, errorThrown ); },
            } );

            // only process after all requests have been resolved
            $.when( dataPact )
                          .done( ( data: any ): void => {
                              ko.mapping.fromJS( data, {}, this );
                              deferred.resolve();
                          } )
                          .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                              deferred.reject( xhr, textStatus, errorThrown );
                          } );

            return deferred;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        save( viewModel: any, event: any ): void {
            while ( this.saving ) {
                alert( "Please wait while expertise is saved." ); // TBD: dialog
            }

            var model = ko.mapping.toJS( this );

            this.saving = true;
            $.ajax( {
                type: 'PUT',
                url: App.Routes.WebApi.GeographicExpertises.put( viewModel.id() ),
                data: model,
                dataType: 'json',
                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                    this.saving = false;
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    this.saving = false;
                    alert( textStatus + " | " + errorThrown );
                }
            } );

            location.href = App.Routes.Mvc.My.Profile.get(3);
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        isEmpty(): bool {
            if ( ( this.placeOfficialName() == "Global" ) &&
                ( this.description() == null ) ) {
                return true;
            }

            return false;
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        cancel( item: any, event: any, mode: string ): void {
            var me: any = this;
            $( "#cancelConfirmDialog" ).dialog( {
                modal: true,
                resizable: false,
                width: 450,
                buttons: {
                    "Do not cancel": function () {
                        $( this ).dialog( "close" );
                    },
                    "Cancel and lose changes": function () {
                        $( this ).dialog( "close" );

                        if ( me.isEmpty() ) {
                            $.ajax( {
                                async: false,
                                type: "DELETE",
                                url: App.Routes.WebApi.GeographicExpertises.del( me.id() ),
                                success: ( data: any, textStatus: string, jqXHR: JQueryXHR ): void =>
                                {
                                },
                                error: ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void =>
                                {
                                    alert( textStatus );
                                }
                            } );
                        }

                        location.href = App.Routes.Mvc.My.Profile.get(1);
                    }
                }
            } );

        }
    }
}
