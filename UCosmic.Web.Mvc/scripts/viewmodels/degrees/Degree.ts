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

        /* In the process of saving */
        saving: bool = false;

        /* Element id of institution autocomplete */
        institutionSelectorId: string;

        /* IObservableDegree implemented */
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
        title: KnockoutObservableString;
        yearAwarded: KnockoutObservableNumber;
        institutionId: KnockoutObservableNumber;
        institutionOfficialName: KnockoutObservableString;
        institutionCountryOfficialName: KnockoutObservableString;
        errors: KnockoutValidationErrors;
        isValid: () => bool;
        isAnyMessageShown: () => bool;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize( degreeId: number ): void {
            this.id = ko.observable( degreeId );
        }

        // --------------------------------------------------------------------------------
        /*
            */
        // --------------------------------------------------------------------------------   
        setupWidgets( institutionSelectorId: string ): void {

            this.institutionSelectorId = institutionSelectorId;

            $( "#" + institutionSelectorId ).kendoAutoComplete( {
                minLength: 3,
                filter: "contains",
                ignoreCase: true,
                placeholder: "[Enter Institution]",
                dataTextField: "officialName",
                dataSource: new kendo.data.DataSource( {
                    serverFiltering: true,
                    transport: {
                        read: ( options: any ): void => {
                            $.ajax( {
                                url: App.Routes.WebApi.Establishments.get(),
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
                change: ( e: any ): void => {
                    this.checkInstitutionForNull();
                },
                select: ( e: any ): void => {
                    var me = $( "#" + institutionSelectorId ).data( "kendoAutoComplete" );
                    var dataItem = me.dataItem( e.item.index() );
                    this.institutionOfficialName(dataItem.officialName);
                    this.institutionId(dataItem.id);
                    if ( ( dataItem.countryName != null ) && ( dataItem.countryName.length > 0 ) ) {
                        this.institutionCountryOfficialName(dataItem.countryName);
                    }
                    else {
                        this.institutionCountryOfficialName(null);
                    }
                }
            } );

        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        checkInstitutionForNull() {
            var me = $( "#" + this.institutionSelectorId ).data( "kendoAutoComplete" );
            var value = (me.value() != null) ? me.value().toString() : null;
            if (value != null) {
                value = value.trim();
            }
            if ((value == null) || (value.length == 0)) {
                me.value( null );
                this.institutionOfficialName( null );
                this.institutionId( null );
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
            this.title.extend( { required: true, minLength: 1, maxLength: 256} );
            this.yearAwarded.extend( { min: 1900 } );

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
                alert( "Please wait while degree is saved." ); // TBD: dialog
            }

            /* If there is no year, return as null, not 0 */
            if ( this.yearAwarded() != null ) {
                var yearAwaredStr = this.yearAwarded().toString();
                yearAwaredStr = yearAwaredStr.trim();
                if ( yearAwaredStr.length == 0 ) {
                    this.yearAwarded( null );
                }
            }

            /* If there is no istitution, return institutionId as null, not 0 */
            this.checkInstitutionForNull();

            var model = ko.mapping.toJS( this );

            this.saving = true;
            $.ajax( {
                type: 'PUT',
                url: App.Routes.WebApi.Degrees.put( viewModel.id() ),
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
                        $( this ).dialog( "close" );
                        location.href = App.Routes.Mvc.My.Profile.get();
                    }
                }
            } );

        }
    }
}
