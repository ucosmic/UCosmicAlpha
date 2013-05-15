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

        /* In the process of saving. */
        saving: bool = false;

        /* Locations for multiselect. */
        locationSelectorId: string;
        locationsDataSource: any;
        selectedLocations: KnockoutObservableArray = ko.observableArray();

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

            $( "#" + locationSelectorId ).kendoMultiSelect( {
                filter: 'contains',
                ignoreCase: true,
                dataTextField: "officialName",
                dataValueField: "id",
                minLength: 3,
                maxSelectedItems: 1,
                dataSource: this.locationsDataSource,
                value: this.selectedLocations(),
                change: ( event: any ) => {
                    this.updateLocations( event.sender.value() );
                },
                placeholder: "[Select Country/Location, Body of Water or Global]"
            } );
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
            ko.validation.rules['numberNotNull'] = {
                validator: ( val: any, otherVal: any ): bool => {
                    return val != null;
                },
                message: 'Required.'
            };

            ko.validation.registerExtenders();
            
            this.placeId.extend( { numberNotNull: 0 } );
            this.description.extend( { maxLength: 400 } );

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

            var locationsPact = $.Deferred();
            $.get(App.Routes.WebApi.Places.get())
                .done((data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    locationsPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });

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
            $.when( locationsPact, dataPact )
                          .done( ( locations: any, data: any ): void => {

                              this.locationsDataSource = locations;

                              ko.mapping.fromJS( data, {}, this );

                              this.selectedLocations.push( this.placeId() );

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

            if (!this.isValid()) {
                // TBD - need dialog here.
                return;
            }

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
                    location.href = App.Routes.Mvc.My.Profile.get(1);
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    this.saving = false;
                    alert( textStatus + " | " + errorThrown );
                    location.href = App.Routes.Mvc.My.Profile.get(1);
                }
            } );
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

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        updateLocations( locations: Array ): void {
            //this.values.locations.removeAll();
            //for ( var i = 0; i < locations.length; i += 1 ) {
            //    var location = ko.mapping.fromJS( { id: 0, placeId: locations[i], version: "" } );
            //    this.values.locations.push( location );
            //}
            this.placeId(locations.length > 0 ? locations[0] : null);
        }
    }
}
