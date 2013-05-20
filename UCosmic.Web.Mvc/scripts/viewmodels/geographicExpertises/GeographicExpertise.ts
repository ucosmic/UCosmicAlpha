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

        /* True if any field changes. */
        dirtyFlag: KnockoutObservableBool = ko.observable( false );

        /* Locations for multiselect. */
        locationSelectorId: string;
        initialLocations: any[] = new any[];        // Bug - To overcome bug in Multiselect.
        selectedLocationValues: any[] = new any[];

        /* IObservableDegree implemented */
        id: KnockoutObservableNumber;           // if 0, new expertise
        version: KnockoutObservableString;      // byte[] converted to base64
        personId: KnockoutObservableNumber;
        description: KnockoutObservableString;
        locations: KnockoutObservableArray;
        whenLastUpdated: KnockoutObservableString;
        whoLastUpdated: KnockoutObservableString;

        errors: KnockoutValidationErrors;
        isValid: () => bool;
        isAnyMessageShown: () => bool;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize( expertiseId: string ): void {
            if (expertiseId === "new") {
                this.id = ko.observable( 0 );
            } else {
                this.id = ko.observable( Number(expertiseId) );
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------   
        setupWidgets( locationSelectorId: string ): void {
            this.locationSelectorId = locationSelectorId;

            /*
                There appears to be a number of bugs/undocumented behaviors associated
                with the KendoUI Multiselect when using a dataSource that gets data
                from service via ajax.

                1) The control will query the service as soon as focus us obtained.  Event
                    with minLength at three, it will query the server with no keyword
                    and the service will return ALL Places (quite large).  See note in
                    GraphicExpertiseEdit.cshtml on how this problem was circumvented.
                    (Note: autoBind: false did NOT fix this problem.)

                2) Setting the initial values (dataItems) does not work as expected when
                    we started using the ajax datasource.  To solve the problem, we use
                    the initial Places AS the datasource and then change the datasource
                    later to the ajax service.
            */
            var me = this;
            $( "#" + locationSelectorId ).kendoMultiSelect( {
                autoBind: true,
                dataTextField: "officialName",
                dataValueField: "id",
                minLength: 3,
                dataSource: me.initialLocations,
                value: me.selectedLocationValues,
                change: ( event: any ) => {
                    this.updateLocations( event.sender.dataItems() );
                },
                placeholder: "[Select Country/Location, Body of Water or Global]"
            } );
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
            ko.validation.rules['atLeast'] = {
                validator: ( val: any, otherVal: any ): bool => {
                    return val.length >= otherVal;
                },
                message: 'At least {0} must be selected.'
            };

            ko.validation.registerExtenders();
            
            this.locations.extend( { atLeast: 1 } );
            this.description.extend( { maxLength: 400 } );

            ko.validation.group( this );
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        constructor( educationId: string ) {
            this._initialize( educationId );
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var deferred: JQueryDeferred = $.Deferred();

            if ( this.id() == 0 ) {
                this.version = ko.observable(null);
                this.personId = ko.observable(0);
                this.description = ko.observable(null);
                this.locations = ko.observableArray();
                this.whenLastUpdated = ko.observable(null);
                this.whoLastUpdated = ko.observable(null);
                deferred.resolve();
            }
            else {
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

                                  /* Initialize the list of selected locations with current locations in values. */
                                  for ( var i = 0; i < this.locations().length; i += 1 ) {

                                      this.initialLocations.push({
                                            officialName: this.locations()[i].placeOfficialName(),
                                            id: this.locations()[i].placeId()
                                      });

                                      this.selectedLocationValues.push( this.locations()[i].placeId() );
                                  }

                                  this.description.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );

                                  deferred.resolve();
                              } )
                              .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                                  deferred.reject( xhr, textStatus, errorThrown );
                              } );
            }

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

            var mapSource = {
                id : this.id,
                version : this.version,
                personId : this.personId,
                whenLastUpdated : this.whenLastUpdated,
                whoLastUpdated : this.whoLastUpdated,
                description : this.description,
                locations : ko.observableArray()
            };

            for(var i = 0; i < this.locations().length; i += 1) {
                mapSource.locations.push({
                    id : this.locations()[i].id,
                    version : this.locations()[i].version,
                    whenLastUpdated : this.locations()[i].whenLastUpdated,
                    whoLastUpdated : this.locations()[i].whoLastUpdated,
                    expertiseId : this.locations()[i].expertiseId,
                    placeOfficialName : this.locations()[i].placeOfficialName,
                    placeId : this.locations()[i].placeId
                });
            }
               
            var model = ko.mapping.toJS(mapSource);

            var url = (viewModel.id() == 0) ?
                        App.Routes.WebApi.GeographicExpertises.post() :
                        App.Routes.WebApi.GeographicExpertises.put( viewModel.id() );
            var type = (viewModel.id() == 0) ?  "POST" : "PUT";

            this.saving = true;
            $.ajax( {
                type: type,
                url: url,
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
        cancel( item: any, event: any, mode: string ): void {
            if ( this.dirtyFlag() == true ) {
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
                            location.href = App.Routes.Mvc.My.Profile.get( 1 );
                        }
                    }
                } );
            }
            else {
                location.href = App.Routes.Mvc.My.Profile.get( 1 );
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        updateLocations( items: Array ): void {
            this.locations.removeAll();
            for ( var i = 0; i < items.length; i += 1 ) {
                var location = ko.mapping.fromJS( { id: 0, placeId: items[i].id, version: "" } );
                this.locations.push( location );
            }
            this.dirtyFlag(true);
        }
    }
}
