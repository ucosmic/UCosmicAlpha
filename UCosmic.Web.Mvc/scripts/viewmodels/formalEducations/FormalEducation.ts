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
/// <reference path="../formalEducations/ServiceApiModel.d.ts"

module ViewModels.FormalEducations {
    // ================================================================================
    /* 
      */
    // ================================================================================
    //export class FormalEducation implements Service.ApiModels.FormalEducation.IObservableFormalEducation {

    //    /* Array of all locations offered in Country/Location multiselect. */
    //    locations: KnockoutObservableArray = ko.observableArray();

    //    /* Array of placeIds of selected locations. */
    //    selectedLocations: KnockoutObservableArray = ko.observableArray();

    //    /* Initialization errors. */
    //    inititializationErrors: string = "";

    //    /* Dirty */
    //    dirtyFlag: KnockoutObservableBool = ko.observable( false );
    //    dirty: KnockoutComputed;

    //    /* In the process of saving */
    //    saving: bool = false;

    //    /* IObservableFormalEducation implemented */
    //    id: KnockoutObservableNumber;
    //    version: KnockoutObservableString;      // byte[] converted to base64
    //    personId: KnockoutObservableNumber;
    //    number: KnockoutObservableNumber;
    //    entityId: KnockoutObservableString;     // guid converted to string
    //    modeText: KnockoutObservableString;
    //    //values: KnockoutObservableAny;          // only values for modeText
    //    //values: Service.ApiModels.IObservableFormalEducationValues;          // only values for modeText

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    _initialize( educationId: number ): void {
    //        this.id = ko.observable( educationId );

    //        this.dirty = ko.computed( (): void => {
    //            if ( this.dirtyFlag() ) {
    //                this.autoSave( this, null );
    //            }
    //        } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------   
    //    setupWidgets( countrySelectorId: string ): void {
    //        $( "#" + countrySelectorId ).kendoMultiSelect( {
    //            dataTextField: "officialName()",
    //            dataValueField: "id()",
    //            dataSource: this.locations(),
    //            //values: activityViewModel.selectedLocations(), // This doesn't work.  See below.
    //            change: ( event: any ) => { this.updateLocations( event.sender.value() ); },
    //            placeholder: "[Select Country/Location, Body of Water or Global]"
    //        } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    setupValidation(): void {

    //        //ko.validation.rules['atLeast'] = {
    //        //    validator: ( val: any, otherVal: any ): bool => {
    //        //        return val.length >= otherVal;
    //        //    },
    //        //    message: 'At least {0} must be selected'
    //        //}

    //        //ko.validation.registerExtenders();

    //        //this.values.title.extend( { required: true, minLength: 1, maxLength: 64 } );
    //        //this.values.locations.extend( { atLeast: 1 } );
    //        //this.values.types.extend( { atLeast: 1 } );

    //        //ko.validation.group( this.values );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------  
    //    constructor( educationId: number ) {
    //        this._initialize( educationId );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /* 
    //        */
    //    // --------------------------------------------------------------------------------
    //    load(): JQueryPromise {
    //        var deferred: JQueryDeferred = $.Deferred();

    //        var locationsPact = $.Deferred();
    //        $.get( App.Routes.WebApi.Activities.Locations.get() )
    //                      .done( ( data: Service.ApiModels.IFormalEducationLocation[], textStatus: string, jqXHR: JQueryXHR ): void => {
    //                          locationsPact.resolve( data );
    //                      } )
    //                      .fail( ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                          locationsPact.reject( jqXHR, textStatus, errorThrown );
    //                      } );

    //        var typesPact = $.Deferred();
    //        $.get( App.Routes.WebApi.Employees.ModuleSettings.FormalEducationTypes.get() )
    //                      .done( ( data: Service.ApiModels.IEmployeeFormalEducationType[], textStatus: string, jqXHR: JQueryXHR ): void => {
    //                          typesPact.resolve( data );
    //                      } )
    //                      .fail( ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                          typesPact.reject( jqXHR, textStatus, errorThrown );
    //                      } );

    //        var dataPact = $.Deferred();

    //        $.ajax( {
    //            type: "GET",
    //            url: App.Routes.WebApi.Activities.getEdit( this.id() ),
    //            success: function ( data: Service.ApiModels.IFormalEducationPage, textStatus: string, jqXhr: JQueryXHR ): void
    //            { dataPact.resolve( data ); },
    //            error: function ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void
    //            { dataPact.reject( jqXhr, textStatus, errorThrown ); },
    //        } );

    //        // only process after all requests have been resolved
    //        $.when( typesPact, locationsPact, dataPact )
    //                      .done( ( types: Service.ApiModels.IEmployeeFormalEducationType[],
    //                          locations: Service.ApiModels.IFormalEducationLocation[],
    //                          data: Service.ApiModels.IObservableFormalEducation ): void => {

    //                          this.activityTypes = ko.mapping.fromJS( types );
    //                          this.locations = ko.mapping.fromJS( locations );

    //                          /* Although the MVC DateTime to JSON serializer will output an ISO compatible
    //                                    string, we are not guarenteed that a browser's Date(string) or Date.parse(string)
    //                                    functions will accurately convert to Date.  So, we are using
    //                                    moment.js to handle the parsing and conversion.
    //                            */
    //                          {
    //                              var augmentedDocumentModel = function ( data ) {
    //                                  ko.mapping.fromJS( data, {}, this );
    //                                  this.proxyImageSource = ko.observable( App.Routes.WebApi.Activities.Documents.Thumbnail.get( this.id(), data.id ) );
    //                              };

    //                              var mapping = {
    //                                  'documents': {
    //                                      create: ( options: any ): KnockoutObservableAny => {
    //                                          return new augmentedDocumentModel( options.data );
    //                                      }
    //                                  },
    //                                  'startsOn': {
    //                                      create: ( options: any ): KnockoutObservableDate => {
    //                                          return ( options.data != null ) ? ko.observable( moment( options.data ).toDate() ) : ko.observable();
    //                                      }
    //                                  },
    //                                  'endsOn': {
    //                                      create: ( options: any ): KnockoutObservableDate => {
    //                                          return ( options.data != null ) ? ko.observable( moment( options.data ).toDate() ) : ko.observable();
    //                                      }
    //                                  }
    //                              };

    //                              //var mapping = {
    //                              //     'values': {
    //                              //         create: (options: any): KnockoutObservableAny => {
    //                              //             var augmentedDocumentModel = function (data) {
    //                              //                 ko.mapping.fromJS(data, {}, this);
    //                              //                 this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(this.id(),data.id));
    //                              //             };

    //                              //             var mapping = {
    //                              //                 'documents': {
    //                              //                     create: (options: any): KnockoutObservableAny => {
    //                              //                         return new augmentedDocumentModel(options.data);
    //                              //                     }
    //                              //                 },
    //                              //                 'startsOn': {
    //                              //                     create: (options: any): KnockoutObservableDate => {
    //                              //                         return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
    //                              //                     }
    //                              //                 },
    //                              //                 'endsOn': {
    //                              //                     create: (options: any): KnockoutObservableDate => {
    //                              //                         return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
    //                              //                     }
    //                              //                 }
    //                              //             }

    //                              //             var values = ko.mapping.fromJS(options.data, mapping);
    //                              //             return ko.observable(values);
    //                              //         }
    //                              //     }
    //                              // };

    //                              ko.mapping.fromJS( data, mapping, this );
    //                          }


    //                          /* Initialize the list of selected locations with current locations in values. */
    //                          for ( var i = 0; i < this.values.locations().length; i += 1 ) {
    //                              this.selectedLocations.push( this.values.locations()[i].placeId() );
    //                          }

    //                          /* Check the activity types checkboxes if the activity type exists in values. */
    //                          for ( var i = 0; i < this.activityTypes().length; i += 1 ) {
    //                              this.activityTypes()[i].checked = ko.computed( this.defHasFormalEducationTypeCallback( i ) );
    //                          }

    //                          /* Autosave when fields change. */
    //                          this.values.title.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
    //                          this.values.content.subscribe( ( newValue: any ): void => { this.keyCountAutoSave(newValue); } );
    //                          this.values.startsOn.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
    //                          this.values.endsOn.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
    //                          this.values.wasExternallyFunded.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
    //                          this.values.wasInternallyFunded.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
    //                          this.values.types.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );
    //                          this.isOnGoing.subscribe( ( newValue: any ): void => { this.dirtyFlag(true); } );

    //                          deferred.resolve();
    //                      } )
    //                      .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                          deferred.reject( xhr, textStatus, errorThrown );
    //                      } );

    //        return deferred;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //    */
    //    // --------------------------------------------------------------------------------
    //    keyCountAutoSave( newValue: any ): void {
    //        this.keyCounter += 1;
    //        if (this.keyCounter > this.AUTOSAVE_KEYCOUNT) {
    //            this.dirtyFlag(true);
    //            this.keyCounter = 0;
    //        }
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //    */
    //    // --------------------------------------------------------------------------------
    //    convertDate( date: any ): string {
    //        var formatted = null;
    //        var YYYYPattern = new RegExp( "^\\d{4}$" );
    //        var MMYYYYPattern = new RegExp( "^\\d{1,}/\\d{4}$" );
    //        var MMDDYYYYPattern = new RegExp( "^\\d{1,}/\\d{1,}/\\d{4}$" );

    //        if ( typeof( date ) === "object" ) {
    //            formatted = moment(date).format();
    //        }
    //        else {
    //            var dateStr = date;
    //            if ( ( dateStr != null ) && ( dateStr.length > 0 ) ) {
    //                dateStr = dateStr.trim();

    //                if ( YYYYPattern.test( dateStr ) ) {
    //                    dateStr = "01/01/" + dateStr; // fixes Moment rounding error
    //                    formatted = moment( dateStr, ["MM/DD/YYYY"] ).format();
    //                }
    //                else if ( MMYYYYPattern.test( dateStr ) ) {
    //                    formatted = moment( dateStr, ["MM/YYYY"] ).format();
    //                }
    //                else if ( MMDDYYYYPattern.test( dateStr ) ) {
    //                    formatted = moment( dateStr, ["MM/DD/YYYY"] ).format();
    //                } 
    //            }
    //        }

    //        return formatted;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //    */
    //    // --------------------------------------------------------------------------------
    //    autoSave( viewModel: any, event: any ): void {
    //        if ( this.saving ) {
    //            return; // TBD handle this better
    //        }

    //        if ( !this.dirtyFlag() ) {
    //            return;
    //        }

    //        var model = ko.mapping.toJS( this );

    //        if (model.values.startsOn != null) {
    //            model.values.startsOn = this.convertDate(model.values.startsOn);
    //        }

    //        if ( this.isOnGoing() ) {
    //            model.values.endsOn = null;
    //        }
    //        else {
    //            if ( model.values.endsOn != null ) {
    //                model.values.endsOn = this.convertDate( model.values.endsOn );
    //            }
    //        }

    //        this.saving = true;
    //        $.ajax( {
    //            type: 'PUT',
    //            url: App.Routes.WebApi.Activities.put( viewModel.id() ),
    //            data: model,
    //            dataType: 'json',
    //            success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
    //                this.saving = false;
    //                this.dirtyFlag(false);
    //            },
    //            error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                this.saving = false;
    //                this.dirtyFlag(false);
    //                alert( textStatus + "; " + errorThrown );
    //            }
    //        } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //    */
    //    // --------------------------------------------------------------------------------
    //    save( viewModel: any, event: any, mode: string ): void {
    //        this.autoSave( viewModel, event );

    //        while ( this.saving ) {
    //            alert( "Please wait while activity is saved." ); // TBD: dialog
    //        }

    //        this.saving = true;
    //        $.ajax( {
    //            async: false,
    //            type: 'PUT',
    //            url: App.Routes.WebApi.Activities.putEdit( viewModel.id() ),
    //            data: ko.toJSON( mode ),
    //            dataType: 'json',
    //            contentType: 'application/json',
    //            success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
    //                this.saving = false;
    //                this.dirtyFlag(false);
    //            },
    //            error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                this.saving = false;
    //                this.dirtyFlag(false);
    //                alert( textStatus + "; " + errorThrown );
    //            }
    //        } );

    //        location.href = App.Routes.Mvc.My.Profile.get();
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //        */
    //    // --------------------------------------------------------------------------------
    //    cancel( item: any, event: any, mode: string ): void {
    //        $( "#cancelConfirmDialog" ).dialog( {
    //            modal: true,
    //            resizable: false,
    //            width: 450,
    //            buttons: {
    //                "Do not cancel": function () {
    //                    $( this ).dialog( "close" );
    //                },
    //                "Cancel and lose changes": function () {
    //                    $.ajax( {
    //                        async: false,
    //                        type: 'DELETE',
    //                        url: App.Routes.WebApi.Activities.del( item.id() ),
    //                        dataType: 'json',
    //                        contentType: 'application/json',
    //                        success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
    //                        },
    //                        error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                            alert( textStatus + "; " + errorThrown );
    //                        }
    //                    } );

    //                    $( this ).dialog( "close" );
    //                    location.href = App.Routes.Mvc.My.Profile.get();
    //                }
    //            }
    //        } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //        */
    //    // --------------------------------------------------------------------------------
    //    addFormalEducationType( activityTypeId: number ): void {
    //        var existingIndex: number = this.getFormalEducationTypeIndexById( activityTypeId );
    //        if ( existingIndex == -1 ) {
    //            var newFormalEducationType: KnockoutObservableAny = ko.mapping.fromJS( { id: 0, typeId: activityTypeId, version: "" } );
    //            this.values.types.push( newFormalEducationType );
    //        }
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //        */
    //    // --------------------------------------------------------------------------------
    //    removeFormalEducationType( activityTypeId: number ): void {
    //        var existingIndex: number = this.getFormalEducationTypeIndexById( activityTypeId );
    //        if ( existingIndex != -1 ) {
    //            var activityType = this.values.types()[existingIndex];
    //            this.values.types.remove( activityType );
    //        }
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //        */
    //    // --------------------------------------------------------------------------------
    //    getTypeName( id: number ): string {
    //        var name: string = "";
    //        var index: number = this.getFormalEducationTypeIndexById( id );
    //        if ( index != -1 ) { name = this.activityTypes[index].type; }
    //        return name;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //        */
    //    // --------------------------------------------------------------------------------
    //    getFormalEducationTypeIndexById( activityTypeId: number ): number {
    //        var index: number = -1;

    //        if ( ( this.values.types != null ) && ( this.values.types().length > 0 ) ) {
    //            var i = 0;
    //            while ( ( i < this.values.types().length ) &&
    //                                 ( activityTypeId != this.values.types()[i].typeId() ) ) { i += 1 }

    //            if ( i < this.values.types().length ) {
    //                index = i;
    //            }
    //        }

    //        return index;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*  
    //        */
    //    // --------------------------------------------------------------------------------
    //    hasFormalEducationType( activityTypeId: number ): bool {
    //        return this.getFormalEducationTypeIndexById( activityTypeId ) != -1;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //                FormalEducationTypes Theory of Operation:
    
    //                Challenge: Present user with a checkbox for each FormalEducationType as defined
    //                                        by EmployeeFormalEducationTypes.  User must select at least one
    //                                        FormalEducationType.  The ViewModel will maintain a list of
    //                                        FormalEducationTypes as selected by the user.
    
    //                The ViewModel contains both a list of possible FormalEducationTypes (in the 
    //                activityTypes field) and the array of actually selected FormalEducationTypes
    //                in vm.values.types.
    
    //                In order to support data binding, the FormalEducationType is augmented with
    //                a "checked" property.
    
    //                The desired behavior is to make use of the "checked" data binding
    //                attribute as follows:
    
    //                <input type="checkbox" data-bind="checked: checked"/>
    
    //                See the "activity-types-template" for exact usage.
    
    //                However, checking/unchecking needes to result in an FormalEducationType
    //                being added/removed from the FormalEducation.values.types array.
    
    //                To accomplish this, we use a computed observable that has split
    //                read and write behavior.  A Read results in interrogating the
    //                FormalEducation.values.types array for the existence of a typeId. A
    //                write will either add or remove a typeId depending upon checked
    //                state.
    
    //                Due to the use of computed observable array (activityTypes) we need to
    //                create a closure in order to capture state of array index/element.
    //        */
    //    // --------------------------------------------------------------------------------
    //    defHasFormalEducationTypeCallback( activityTypeIndex: number ): KnockoutComputedDefine {
    //        var def: KnockoutComputedDefine = {
    //            read: (): bool => {
    //                return this.hasFormalEducationType( this.activityTypes()[activityTypeIndex].id() );
    //            },
    //            write: function ( checked ) => {
    //                if ( checked ) {
    //                    this.addFormalEducationType( this.activityTypes()[activityTypeIndex].id() );
    //                } else {
    //                    this.removeFormalEducationType( this.activityTypes()[activityTypeIndex].id() );
    //                }
    //            },
    //            owner: this
    //        };

    //        return def;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        Rebuild values.location with supplied (non-observable) array.
    //    */
    //    // --------------------------------------------------------------------------------
    //    updateLocations( locations: Array ): void {
    //        this.values.locations.removeAll();
    //        for ( var i = 0; i < locations.length; i += 1 ) {
    //            var location = ko.mapping.fromJS( { id: 0, placeId: locations[i], version: "" } );
    //            this.values.locations.push( location );
    //        }
    //        this.dirtyFlag(true);
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //    */
    //    // --------------------------------------------------------------------------------
    //    addTag( item: any, event: Event ): void {
    //        var newText: string = null;
    //        var domainTypeText: string = "Custom";
    //        var domainKey: number = null;
    //        var isInstitution: bool = false;
    //        if ( this.newEstablishment == null ) {
    //            newText = this.newTag();
    //        }
    //        else {
    //            newText = this.newEstablishment.officialName;
    //            domainTypeText = "Establishment";
    //            domainKey = this.newEstablishment.id;
    //            isInstitution = true;
    //            this.newEstablishment = null;
    //        }
    //        newText = ( newText != null ) ? newText.trim() : null;
    //        if ( ( newText != null ) &&
    //                      ( newText.length != 0 ) &&
    //                      ( !this.haveTag( newText ) ) ) {
    //            var tag = {
    //                id: 0,
    //                number: 0,
    //                text: newText,
    //                domainTypeText: domainTypeText,
    //                domainKey: domainKey,
    //                modeText: this.modeText(),
    //                isInstitution: isInstitution
    //            };
    //            var observableTag = ko.mapping.fromJS( tag );
    //            this.values.tags.push( observableTag );
    //        }

    //        this.newTag( null );
    //        this.dirtyFlag(true);
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    removeTag( item: any, event: Event ): void {
    //        this.values.tags.remove( item );
    //        this.dirtyFlag(true);
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    haveTag( text: string ): bool {
    //        return this.tagIndex( text ) != -1;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    tagIndex( text: string ): number {
    //        var i = 0;
    //        while ( ( i < this.values.tags().length ) &&
    //                              ( text != this.values.tags()[i].text() ) ) {
    //            i += 1;
    //        }
    //        return ( ( this.values.tags().length > 0 ) && ( i < this.values.tags().length ) ) ? i : -1;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    validateUploadableFileTypeByExtension( educationId: number, inExtension: string ): bool {
    //        var valid = true;
    //        var extension = inExtension;

    //        if ( ( extension == null ) ||
    //                      ( extension.length == 0 ) ||
    //                      ( extension.length > 255 ) ) {
    //            valid = false;
    //        }
    //        else {
    //            if ( extension[0] === "." ) {
    //                extension = extension.substring( 1 );
    //            }

    //            $.ajax( {
    //                async: false,
    //                type: 'POST',
    //                url: App.Routes.WebApi.Activities.Documents.validateFileExtensions( educationId ),
    //                data: ko.toJSON( extension ),
    //                dataType: 'json',
    //                contentType: 'application/json',
    //                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
    //                    valid = true;
    //                },
    //                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                    valid = false;
    //                }
    //            } );
    //        }

    //        return valid;
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    loadDocuments(): void {
    //        $.ajax( {
    //            type: 'GET',
    //            url: App.Routes.WebApi.Activities.Documents.get( this.id(), null, this.modeText() ),
    //            dataType: 'json',
    //            success: ( documents: any, textStatus: string, jqXhr: JQueryXHR ): void => {

    //                /* TBD - This needs to be combined with the initial load mapping. */
    //                var augmentedDocumentModel = function ( data ) {
    //                    ko.mapping.fromJS( data, {}, this );
    //                    this.proxyImageSource = ko.observable( App.Routes.WebApi.Activities.Documents.Thumbnail.get( this.id(), data.id ) );
    //                };

    //                var mapping = {
    //                    create: function ( options: any ) {
    //                        return new augmentedDocumentModel( options.data );
    //                    }
    //                };

    //                var observableDocs = ko.mapping.fromJS( documents, mapping );

    //                this.values.documents.removeAll();
    //                for ( var i = 0; i < observableDocs().length; i += 1 ) {
    //                    this.values.documents.push( observableDocs()[i] );
    //                }

    //            },
    //            error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                alert( "Unable to update documents list. " + textStatus + "|" + errorThrown );
    //            }
    //        } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    deleteDocument( item: Service.ApiModels.IObservableFormalEducationDocument, event: any ): void {
    //        $.ajax( {
    //            type: 'DELETE',
    //            url: App.Routes.WebApi.Activities.Documents.del( this.id(), item.id() ),
    //            dataType: 'json',
    //            success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
    //                this.loadDocuments();
    //            },
    //            error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                alert( "Unable to delete document. " + textStatus + "|" + errorThrown );
    //            }
    //        } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    startDocumentTitleEdit( item: Service.ApiModels.IObservableFormalEducationDocument, event: any ): void {
    //        var textElement = event.target;
    //        $( textElement ).hide();
    //        this.previousDocumentTitle = item.title();
    //        var inputElement = $( textElement ).siblings( "#documentTitleInput" )[0];
    //        $( inputElement ).show();
    //        $( inputElement ).focusout( event, ( event: any ): void => { this.endDocumentTitleEdit( item, event ); } );
    //        $( inputElement ).keypress( event, ( event: any ): void => { if ( event.which == 13 ) { inputElement.blur(); } } );
    //    }

    //    // --------------------------------------------------------------------------------
    //    /*
    //        */
    //    // --------------------------------------------------------------------------------
    //    endDocumentTitleEdit( item: Service.ApiModels.IObservableFormalEducationDocument, event: any ): void {
    //        var inputElement = event.target;
    //        $( inputElement ).unbind( "focusout" );
    //        $( inputElement ).unbind( "keypress" );
    //        $( inputElement ).attr( "disabled", "disabled" );

    //        $.ajax( {
    //            type: 'PUT',
    //            url: App.Routes.WebApi.Activities.Documents.rename( this.id(), item.id() ),
    //            data: ko.toJSON( item.title() ),
    //            contentType: 'application/json',
    //            dataType: 'json',
    //            success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
    //                $( inputElement ).hide();
    //                $( inputElement ).removeAttr( "disabled" );
    //                var textElement = $( inputElement ).siblings( "#documentTitle" )[0];
    //                $( textElement ).show();
    //            },
    //            error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
    //                item.title( this.previousDocumentTitle );
    //                $( inputElement ).hide();
    //                $( inputElement ).removeAttr( "disabled" );
    //                var textElement = $( inputElement ).siblings( "#documentTitle" )[0];
    //                $( textElement ).show();
    //                $( "#documentRenameErrorDialog > #message" )[0].innerText = jqXhr.responseText;
    //                $( "#documentRenameErrorDialog" ).dialog( {
    //                    modal: true,
    //                    resizable: false,
    //                    width: 400,
    //                    buttons: { Ok: function () { $( this ).dialog( "close" ); } }
    //                } );
    //            }
    //        } );
    //    }
    //}
}
