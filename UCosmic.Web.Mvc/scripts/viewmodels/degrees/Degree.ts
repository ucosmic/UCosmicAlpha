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
/// <reference path="../degrees/ServiceApiModel.d.ts" />

module ViewModels.Degrees {
    // ================================================================================
    /* 
    */
    // ================================================================================
    export class Degree implements Service.ApiModels.Degree.IObservableDegree {

        /* Initialization errors. */
        inititializationErrors: string = "";

        /* Dirty */
        dirtyFlag: KnockoutObservableBool = ko.observable( false );
        dirty: KnockoutComputed;

        /* In the process of saving */
        saving: bool = false;

        /* IObservableDegree implemented */
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
        degree: KnockoutObservableString;
        yearAwarded: KnockoutObservableNumber;
        institutionId: KnockoutObservableNumber;
        institutionOfficialName: KnockoutObservableString;
        institutionCountryId: KnockoutObservableNumber;
        institutionCountryOfficialName: KnockoutObservableString;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize( educationId: number ): void {
            this.id = ko.observable( educationId );

            this.dirty = ko.computed( (): void => {
                if ( this.dirtyFlag() ) {
                    this.autoSave( this, null );
                }
            } );
        }

        // --------------------------------------------------------------------------------
        /*
            */
        // --------------------------------------------------------------------------------   
        setupWidgets( countrySelectorId: string ): void {

            //$( "#" + countrySelectorId ).kendoMultiSelect( {
            //    dataTextField: "officialName()",
            //    dataValueField: "id()",
            //    dataSource: this.locations(),
            //    //values: activityViewModel.selectedLocations(), // This doesn't work.  See below.
            //    change: ( event: any ) => { this.updateLocations( event.sender.value() ); },
            //    placeholder: "[Select Country/Location, Body of Water or Global]"
            //} );

        }

        // --------------------------------------------------------------------------------
        /*
            */
        // --------------------------------------------------------------------------------
        setupValidation(): void {

            //ko.validation.rules['atLeast'] = {
            //    validator: ( val: any, otherVal: any ): bool => {
            //        return val.length >= otherVal;
            //    },
            //    message: 'At least {0} must be selected'
            //}

            //ko.validation.registerExtenders();

            //this.values.title.extend( { required: true, minLength: 1, maxLength: 64 } );
            //this.values.locations.extend( { atLeast: 1 } );
            //this.values.types.extend( { atLeast: 1 } );

            //ko.validation.group( this.values );
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
                url: App.Routes.WebApi.Degrees.get( this.id() ),
                success: function ( data: Service.ApiModels.Degree.IDegreePage, textStatus: string, jqXhr: JQueryXHR ): void
                    { dataPact.resolve( data ); },
                error: function ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void
                    { dataPact.reject( jqXhr, textStatus, errorThrown ); },
            } );

            // only process after all requests have been resolved
            $.when( dataPact )
                          .done( ( data: Service.ApiModels.Degree.IObservableDegree ): void => {

                              ko.mapping.fromJS( data, {}, this );

                              /* Initialize the list of selected locations with current locations in values. */
                              //for ( var i = 0; i < this.values.locations().length; i += 1 ) {
                              //    this.selectedLocations.push( this.values.locations()[i].placeId() );
                              //}


                              /* Autosave when fields change. */
                              //this.values.title.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
                              //this.values.content.subscribe( ( newValue: any ): void => { this.keyCountAutoSave(newValue); } );
                              //this.values.startsOn.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
                              //this.values.endsOn.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
                              //this.values.wasExternallyFunded.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
                              //this.values.wasInternallyFunded.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
                              //this.values.types.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
                              //this.isOnGoing.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );

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
        autoSave( viewModel: any, event: any ): void {
            if ( this.saving ) {
                return; // TBD handle this better
            }

            if ( !this.dirtyFlag() ) {
                return;
            }

            var model = ko.mapping.toJS( this );


            this.saving = true;
            $.ajax( {
                type: 'PUT',
                url: App.Routes.WebApi.Degrees.put( viewModel.id() ),
                data: model,
                dataType: 'json',
                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                    this.saving = false;
                    this.dirtyFlag(false);
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    this.saving = false;
                    this.dirtyFlag(false);
                    alert( textStatus + "; " + errorThrown );
                }
            } );
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        save( viewModel: any, event: any, mode: string ): void {
            this.autoSave( viewModel, event );

            while ( this.saving ) {
                alert( "Please wait while education is saved." ); // TBD: dialog
            }

            this.saving = true;
            $.ajax( {
                async: false,
                type: 'PUT',
                url: App.Routes.WebApi.Degrees.put( viewModel.id() ),
                data: ko.toJSON( mode ),
                dataType: 'json',
                contentType: 'application/json',
                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                    this.saving = false;
                    this.dirtyFlag(false);
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    this.saving = false;
                    this.dirtyFlag(false);
                    alert( textStatus + "; " + errorThrown );
                }
            } );

            location.href = App.Routes.Mvc.My.Profile.get();
        }

        // --------------------------------------------------------------------------------
        /*  
            */
        // --------------------------------------------------------------------------------
        cancel( item: any, event: any, mode: string ): void {
            $( "#cancelConfirmDialog" ).dialog( {
                modal: true,
                resizable: false,
                width: 450,
                buttons: {
                    "Do not cancel": function () {
                        $( this ).dialog( "close" );
                    },
                    "Cancel and lose changes": function () {
                        $.ajax( {
                            async: false,
                            type: 'DELETE',
                            url: App.Routes.WebApi.Degrees.del( item.id() ),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                            },
                            error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                                alert( textStatus + "; " + errorThrown );
                            }
                        } );

                        $( this ).dialog( "close" );
                        location.href = App.Routes.Mvc.My.Profile.get();
                    }
                }
            } );
        }
    }
}
