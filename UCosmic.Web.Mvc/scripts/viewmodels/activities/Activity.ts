/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/tinymce/tinymce.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../activities/ServiceApiModel.d.ts" />

module ViewModels.Activities {
    export class Activity implements Service.ApiModels.IObservableActivity {

        private static iconMaxSide: number = 64;

        ready: KnockoutObservable<boolean> = ko.observable(false);

        /* Array of all locations offered in Country/Location multiselect. */
        locations: KnockoutObservableArray<any> = ko.observableArray();

        /* Array of placeIds of selected locations. */
        selectedLocations: KnockoutObservableArray<any> = ko.observableArray();

        /* Array of activity types displayed as list of checkboxes */
        activityTypes: KnockoutObservableArray<any> = ko.observableArray();

        /* Data bound to new tag textArea */
        newTag: KnockoutObservable<string> = ko.observable();
        newEstablishment: any; // Because KendoUI autocomplete does not offer dataValueField.

        // array to hold file upload errors
        fileUploadErrors : KnockoutObservableArray<any> = ko.observableArray();

        /* Old document name - used during document rename. */
        previousDocumentTitle: string;

        /* Initialization errors. */
        inititializationErrors: string = "";

        /* Autosave after so many keydowns. */
        AUTOSAVE_KEYCOUNT: number = 10;
        keyCounter: number = 0;

        /* Dirty */
        dirtyFlag: KnockoutObservable<boolean> = ko.observable( false );
        dirty: KnockoutComputed<void>;

        /* In the process of saving */
        saving: boolean = false;
        saveSpinner = new App.Spinner(new App.SpinnerOptions(200));

        /* IObservableActivity implemented */
        id: KnockoutObservable<number>;
        version: KnockoutObservable<string>;                      // byte[] converted to base64
        personId: KnockoutObservable<number>;
        number: KnockoutObservable<number>;
        entityId: KnockoutObservable<string>;                     // guid converted to string
        modeText: KnockoutObservable<string>;
        values: Service.ApiModels.IObservableActivityValues;    // only values for modeText

        _initialize( activityId: number ): void {
            this.id = ko.observable( activityId );

            this.dirty = ko.computed( (): void => {
                if ( this.dirtyFlag() ) {
                    this.autoSave( this, null );
                }
            });
        }

        dismissFileUploadError(index: number): void {
            this.fileUploadErrors.splice(index, 1);
        }

        setupWidgets( fromDatePickerId: string,
            toDatePickerId: string,
            countrySelectorId: string,
            uploadFileId: string,
            newTagId: string ): void {

            $( "#" + fromDatePickerId ).kendoDatePicker( {
                /* If user clicks date picker button, reset format */
                open: function(e) { this.options.format = "MM/dd/yyyy"; }
            } );

            $( "#" + toDatePickerId ).kendoDatePicker( {
                open: function(e) { this.options.format = "MM/dd/yyyy"; }
            } );

            $( "#" + countrySelectorId ).kendoMultiSelect( {
                filter: 'contains',
                ignoreCase: 'true',
                dataTextField: "officialName()",
                dataValueField: "id()",
                dataSource: this.locations(),
                //values: activityViewModel.selectedLocations(), // This doesn't work.  See below.
                change: ( event: any ) => { this.updateLocations( event.sender.value() ); },
                placeholder: "[Select Country/Location, Body of Water or Global]"
            } );

            var invalidFileNames: string[] = [];
            $( "#" + uploadFileId ).kendoUpload( {
                multiple: true,
                showFileList: false,
                localization: {
                    select: 'Choose one or more documents to share...'
                },
                async: {
                    saveUrl: App.Routes.WebApi.Activities.Documents.post( this.id(), this.modeText() )
                },
                select: (e: kendo.ui.UploadSelectEvent): void => {
                    for (var i = 0; i < e.files.length; i++) {
                        var file = e.files[i];
                        $.ajax({
                            async: false,
                            type: 'POST',
                            url: App.Routes.WebApi.Activities.Documents.validateUpload(),
                            data: {
                                name: file.name,
                                length: file.size
                            },
                        })
                        .fail((xhr: JQueryXHR) => {
                            if (xhr.status === 400) {
                                if ($.inArray(e.files[i].name, invalidFileNames) < 0)
                                    invalidFileNames.push(file.name);
                                this.fileUploadErrors.push({
                                    message: xhr.responseText
                                });
                            }
                        });
                    }
                },
                upload: (e: kendo.ui.UploadUploadEvent): void => {
                    var file = e.files[0];
                    var indexOfInvalidName = $.inArray(file.name, invalidFileNames);
                    if (indexOfInvalidName >= 0) {
                        e.preventDefault();
                        invalidFileNames.splice(indexOfInvalidName, 1);
                        return;
                    }
                },
                success: (e: kendo.ui.UploadSuccessEvent): void => {
                    this.loadDocuments();
                },
                error: (e: kendo.ui.UploadErrorEvent): void => {
                    if (e.XMLHttpRequest.responseText &&
                        e.XMLHttpRequest.responseText.length < 1000) {
                        this.fileUploadErrors.push({
                            message: e.XMLHttpRequest.responseText
                        });
                    }
                    else {
                        this.fileUploadErrors.push({
                            message: 'UCosmic experienced an unexpected error uploading your document, please try again. If you continue to experience this issue, please use the Feedback & Support link on this page to report it.'
                        });
                    }
                }
            } );

            $( "#" + newTagId ).kendoAutoComplete( {
                minLength: 3,
                placeholder: "[Enter tag or keyword]",
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
                                    pageSize: App.Constants.int32Max
                                },
                                success: ( results: any ): void => {
                                    options.success( results.items );
                                }
                            } );
                        }
                    }
                } ),
                select: ( e: any ): void => {
                    var me = $( "#" + newTagId ).data( "kendoAutoComplete" );
                    var dataItem = me.dataItem( e.item.index() );
                    this.newEstablishment = { officialName: dataItem.officialName, id: dataItem.id };
                }
            } );
        }

        setupValidation(): void {
            ko.validation.rules['atLeast'] = {
                validator: ( val: any, otherVal: any ): boolean => {
                    return val.length >= otherVal;
                },
                message: 'At least {0} must be selected.'
            };

            ko.validation.rules['nullSafeDate'] = {
                validator: ( val: any, otherVal: any ): boolean => {
                    var valid: boolean = true;
                    var format:string = null;
                    var YYYYPattern = new RegExp( "^\\d{4}$" );
                    var MMYYYYPattern = new RegExp( "^\\d{1,}/\\d{4}$" );
                    var MMDDYYYYPattern = new RegExp( "^\\d{1,}/\\d{1,}/\\d{4}$" );

                    if ( ( val != null ) && ( val.length > 0 ) ) {
                        val = $.trim(val);

                        if ( YYYYPattern.test( val ) ) {
                            val = "01/01/" + val;
                            format= "YYYY";
                        }
                        else if ( MMYYYYPattern.test( val ) ) {
                            format = "MM/YYYY";
                        }
                        else if ( MMDDYYYYPattern.test( val ) ) {
                            format= "MM/DD/YYYY";
                        } 

                        valid = (format != null) ? moment(val,format).isValid() : false;
                    }

                    return valid;
                },
                message: "Date must be valid."
            };

            ko.validation.registerExtenders();

            ko.validation.group( this.values );

            this.values.title.extend( { required: true, minLength: 1, maxLength: 500 } );
            this.values.locations.extend( { atLeast: 1 } );
            this.values.types.extend( { atLeast: 1 } );
            this.values.startsOn.extend( { nullSafeDate: { message: "Start date must valid." } } );
            this.values.endsOn.extend( { nullSafeDate: { message: "End date must valid." } } );
        }

        setupSubscriptions(): void {
            /* Autosave when fields change. */
            this.values.title.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.content.subscribe((newValue: any): void => { this.keyCountAutoSave(newValue); });
            this.values.startsOn.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.endsOn.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.onGoing.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.wasExternallyFunded.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.wasInternallyFunded.subscribe((newValue: any): void => { this.dirtyFlag(true); });
            this.values.types.subscribe((newValue: any): void => { this.dirtyFlag(true); });
        }

        constructor( activityId: number ) {
            this._initialize( activityId );
        }

        load(): JQueryPromise {
            var deferred: JQueryDeferred<void> = $.Deferred();

            var locationsPact = $.Deferred();
            $.get( App.Routes.WebApi.Activities.Locations.get() )
                          .done( ( data: Service.ApiModels.IActivityLocation[], textStatus: string, jqXHR: JQueryXHR ): void => {
                              locationsPact.resolve( data );
                          } )
                          .fail( ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                              locationsPact.reject( jqXHR, textStatus, errorThrown );
                          } );

            var typesPact = $.Deferred();
            $.get( App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get() )
                          .done( ( data: Service.ApiModels.IEmployeeActivityType[], textStatus: string, jqXHR: JQueryXHR ): void => {
                              typesPact.resolve( data );
                          } )
                          .fail( ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                              typesPact.reject( jqXHR, textStatus, errorThrown );
                          } );

            var dataPact = $.Deferred();

            $.ajax( {
                type: "GET",
                url: App.Routes.WebApi.Activities.getEdit( this.id() ),
                success: function ( data: Service.ApiModels.IActivityPage, textStatus: string, jqXhr: JQueryXHR ): void
                { dataPact.resolve( data ); },
                error: function ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void
                { dataPact.reject( jqXhr, textStatus, errorThrown ); },
            } );

            // only process after all requests have been resolved
            $.when( typesPact, locationsPact, dataPact )
                          .done( ( types: Service.ApiModels.IEmployeeActivityType[],
                              locations: Service.ApiModels.IActivityLocation[],
                              data: Service.ApiModels.IObservableActivity ): void => {

                              this.activityTypes = ko.mapping.fromJS( types );
                              this.locations = ko.mapping.fromJS( locations );

                              /* Although the MVC DateTime to JSON serializer will output an ISO compatible
                                        string, we are not guarenteed that a browser's Date(string) or Date.parse(string)
                                        functions will accurately convert to Date.  So, we are using
                                        moment.js to handle the parsing and conversion.
                                */
                              {
                                  var augmentedDocumentModel = function ( data ) {
                                      ko.mapping.fromJS( data, {}, this );
                                      this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: Activity.iconMaxSide }));
                                  };

                                  var mapping = {
                                      'documents': {
                                          create: ( options: any ): KnockoutObservable<any> => {
                                              return new augmentedDocumentModel( options.data );
                                          }
                                      }
                                      ,'startsOn': {
                                          create: ( options: any ): KnockoutObservable<Date> => {
                                              return ( options.data != null ) ? ko.observable( moment( options.data ).toDate() ) : ko.observable();
                                          }
                                      }
                                      ,'endsOn': {
                                          create: ( options: any ): KnockoutObservable<Date> => {
                                              return ( options.data != null ) ? ko.observable( moment( options.data ).toDate() ) : ko.observable();
                                          }
                                      }
                                  };

                                    ko.mapping.fromJS( data, mapping, this );
                              }

                              /* Initialize the list of selected locations with current locations in values. */
                              for ( var i = 0; i < this.values.locations().length; i += 1 ) {
                                  this.selectedLocations.push( this.values.locations()[i].placeId() );
                              }

                              /* Check the activity types checkboxes if the activity type exists in values. */
                              for ( var i = 0; i < this.activityTypes().length; i += 1 ) {
                                  this.activityTypes()[i].checked = ko.computed( this.defHasActivityTypeCallback( i ) );
                              }

                              deferred.resolve();
                          } )
                          .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                              deferred.reject( xhr, textStatus, errorThrown );
                          } );

            return deferred;
        }

        keyCountAutoSave( newValue: any ): void {
            this.keyCounter += 1;
            if (this.keyCounter >= this.AUTOSAVE_KEYCOUNT) {
                this.dirtyFlag(true);
                this.keyCounter = 0;
            }
        }

        getDateFormat( dateStr: string ): string {
            var format:string = null;
            var YYYYPattern = new RegExp( "^\\d{4}$" );
            var MMYYYYPattern = new RegExp( "^\\d{1,}/\\d{4}$" );
            var MMDDYYYYPattern = new RegExp( "^\\d{1,}/\\d{1,}/\\d{4}$" );

            if ( ( dateStr != null ) && ( dateStr.length > 0 ) ) {
                dateStr = $.trim(dateStr);

                if ( YYYYPattern.test( dateStr ) ) {
                    format = "yyyy";
                }
                else if ( MMYYYYPattern.test( dateStr ) ) {
                    format = "MM/yyyy";
                }
                else {
                    format = "MM/dd/yyyy";
                }
            }

            return format;
        }

        convertDate( date: any ): string {
            var formatted = null;
            var YYYYPattern = new RegExp( "^\\d{4}$" );
            var MMYYYYPattern = new RegExp( "^\\d{1,}/\\d{4}$" );
            var MMDDYYYYPattern = new RegExp( "^\\d{1,}/\\d{1,}/\\d{4}$" );

            if ( typeof( date ) === "object" ) {
                formatted = moment(date).format();
            }
            else {
                var dateStr = date;
                if ( ( dateStr != null ) && ( dateStr.length > 0 ) ) {
                    dateStr = $.trim(dateStr);

                    if ( YYYYPattern.test( dateStr ) ) {
                        dateStr = "01/01/" + dateStr; // fixes Moment rounding error
                        formatted = moment( dateStr, ["MM/DD/YYYY"] ).format();
                    }
                    else if ( MMYYYYPattern.test( dateStr ) ) {
                        formatted = moment( dateStr, ["MM/YYYY"] ).format();
                    }
                    else if ( MMDDYYYYPattern.test( dateStr ) ) {
                        formatted = moment( dateStr, ["MM/DD/YYYY"] ).format();
                    } 
                }
            }

            return formatted;
        }

        autoSave(viewModel: any, event: any): JQueryPromise {
            var deferred: JQueryDeferred<void> = $.Deferred();

            if (this.saving) {
                deferred.resolve();
                return deferred;
            }

            if (!this.dirtyFlag() && (this.keyCounter == 0)) {
                deferred.resolve();
                return deferred;
            }

            this.saving = true;

            var model = ko.mapping.toJS( this );

            if (model.values.startsOn != null) {
                var dateStr = $("#fromDatePicker").get(0).value;
                model.values.dateFormat = this.getDateFormat(dateStr);
                model.values.startsOn = this.convertDate(model.values.startsOn);
            }

            if ( (this.values.onGoing != null) && (this.values.onGoing()) ) {
                model.values.endsOn = null;
            }
            else {
                if ( model.values.endsOn != null ) {
                    model.values.endsOn = this.convertDate( model.values.endsOn );
                }
            }

            this.saveSpinner.start();

            $.ajax( {
                type: 'PUT',
                url: App.Routes.WebApi.Activities.put( viewModel.id() ),
                data: ko.toJSON(model),
                dataType: 'json',
                contentType: 'application/json',
                success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                    this.dirtyFlag(false);
                    this.saveSpinner.stop();
                    this.saving = false;
                    deferred.resolve();
                },
                error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this.dirtyFlag(false);
                    this.saveSpinner.stop();
                    this.saving = false;
                    deferred.reject(jqXhr, textStatus, errorThrown);
                }
            });

            return deferred;
        }

        save(viewModel: any, event: any, mode: string): void {

            this.autoSave(viewModel, event)
                .done((data: any, textStatus: string, jqXHR: JQueryXHR): void => {

                    if (!this.values.isValid()) {
                        this.values.errors.showAllMessages();
                        return;
                    }

                    this.saveSpinner.start();

                    $.ajax({
                        async: false,
                        type: 'PUT',
                        url: App.Routes.WebApi.Activities.putEdit(viewModel.id()),
                        data: {
                            mode: mode
                        },
                        success: (data: any, textStatus: string, jqXhr: JQueryXHR): void => {
                        },
                        error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                            alert(textStatus + "; " + errorThrown);
                        },
                        complete: (jqXhr: JQueryXHR, textStatus: string): void => {
                            this.dirtyFlag(false);
                            this.saveSpinner.stop();
                            location.href = App.Routes.Mvc.My.Profile.get();
                        }
                    });
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this.saveSpinner.stop();
                    location.href = App.Routes.Mvc.My.Profile.get();
                });
        }

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
                            url: App.Routes.WebApi.Activities.del( item.id() ),
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

        addActivityType( activityTypeId: number ): void {
            var existingIndex: number = this.getActivityTypeIndexById( activityTypeId );
            if ( existingIndex == -1 ) {
                var newActivityType: KnockoutObservable<any> = ko.mapping.fromJS( { id: 0, typeId: activityTypeId, version: "" } );
                this.values.types.push( newActivityType );
            }
        }

        removeActivityType( activityTypeId: number ): void {
            var existingIndex: number = this.getActivityTypeIndexById( activityTypeId );
            if ( existingIndex != -1 ) {
                var activityType = this.values.types()[existingIndex];
                this.values.types.remove( activityType );
            }
        }

        getTypeName( id: number ): string {
            var name: string = "";
            var index: number = this.getActivityTypeIndexById( id );
            if ( index != -1 ) { name = this.activityTypes[index].type; }
            return name;
        }

        getActivityTypeIndexById( activityTypeId: number ): number {
            var index: number = -1;

            if ( ( this.values.types != null ) && ( this.values.types().length > 0 ) ) {
                var i = 0;
                while ( ( i < this.values.types().length ) &&
                                     ( activityTypeId != this.values.types()[i].typeId() ) ) { i += 1 }

                if ( i < this.values.types().length ) {
                    index = i;
                }
            }

            return index;
        }

        hasActivityType( activityTypeId: number ): boolean {
            return this.getActivityTypeIndexById( activityTypeId ) != -1;
        }

        /*
            ActivityTypes Theory of Operation:
    
            Challenge: Present user with a checkbox for each ActivityType as defined
                                    by EmployeeActivityTypes.  User must select at least one
                                    ActivityType.  The ViewModel will maintain a list of
                                    ActivityTypes as selected by the user.
    
            The ViewModel contains both a list of possible ActivityTypes (in the
            activityTypes field) and the array of actually selected ActivityTypes
            in vm.values.types.
    
            In order to support data binding, the ActivityType is augmented with
            a "checked" property.
    
            The desired behavior is to make use of the "checked" data binding
            attribute as follows:
    
            <input type="checkbox" data-bind="checked: checked"/>
    
            See the "activity-types-template" for exact usage.
    
            However, checking/unchecking needes to result in an ActivityType
            being added/removed from the Activity.values.types array.
    
            To accomplish this, we use a computed observable that has split
            read and write behavior.  A Read results in interrogating the
            Activity.values.types array for the existence of a typeId. A
            write will either add or remove a typeId depending upon checked
            state.
    
            Due to the use of computed observable array (activityTypes) we need to
            create a closure in order to capture state of array index/element.
        */
        defHasActivityTypeCallback( activityTypeIndex: number ): KnockoutComputedDefine<boolean> {
            var def: KnockoutComputedDefine<boolean> = {
                read: (): boolean => {
                    return this.hasActivityType( this.activityTypes()[activityTypeIndex].id() );
                },
                write: (checked: boolean) => {
                    if ( checked ) {
                        this.addActivityType( this.activityTypes()[activityTypeIndex].id() );
                    } else {
                        this.removeActivityType( this.activityTypes()[activityTypeIndex].id() );
                    }
                },
                owner: this
            };

            return def;
        }

        // Rebuild values.location with supplied (non-observable) array.
        updateLocations( locations: Array ): void {
            this.values.locations.removeAll();
            for ( var i = 0; i < locations.length; i += 1 ) {
                var location = ko.mapping.fromJS( { id: 0, placeId: locations[i], version: "" } );
                this.values.locations.push( location );
            }
            this.dirtyFlag(true);
        }

        addTag( item: any, event: Event ): void {
            var newText: string = null;
            var domainTypeText: string = "Custom";
            var domainKey: number = null;
            var isInstitution: boolean = false;
            if ( this.newEstablishment == null ) {
                newText = this.newTag();
            }
            else {
                newText = this.newEstablishment.officialName;
                domainTypeText = "Establishment";
                domainKey = this.newEstablishment.id;
                isInstitution = true;
                this.newEstablishment = null;
            }
            newText = ( newText != null ) ? $.trim(newText) : null;
            if ( ( newText != null ) &&
                          ( newText.length != 0 ) &&
                          ( !this.haveTag( newText ) ) ) {
                var tag = {
                    id: 0,
                    number: 0,
                    text: newText,
                    domainTypeText: domainTypeText,
                    domainKey: domainKey,
                    modeText: this.modeText(),
                    isInstitution: isInstitution
                };
                var observableTag = ko.mapping.fromJS( tag );
                this.values.tags.push( observableTag );
            }

            this.newTag( null );
            this.dirtyFlag(true);
        }

        removeTag( item: any, event: Event ): void {
            this.values.tags.remove( item );
            this.dirtyFlag(true);
        }

        haveTag( text: string ): boolean {
            return this.tagIndex( text ) != -1;
        }

        tagIndex( text: string ): number {
            var i = 0;
            while ( ( i < this.values.tags().length ) &&
                                  ( text != this.values.tags()[i].text() ) ) {
                i += 1;
            }
            return ( ( this.values.tags().length > 0 ) && ( i < this.values.tags().length ) ) ? i : -1;
        }

        loadDocuments(): void {
            $.ajax( {
                type: 'GET',
                url: App.Routes.WebApi.Activities.Documents.get( this.id(), null, this.modeText() ),
                dataType: 'json',
                success: ( documents: any, textStatus: string, jqXhr: JQueryXHR ): void => {

                    /* TBD - This needs to be combined with the initial load mapping. */
                    var augmentedDocumentModel = function ( data ) {
                        ko.mapping.fromJS( data, {}, this );
                        this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: Activity.iconMaxSide }));
                    };

                    var mapping = {
                        create: function ( options: any ) {
                            return new augmentedDocumentModel( options.data );
                        }
                    };

                    var observableDocs = ko.mapping.fromJS( documents, mapping );

                    this.values.documents.removeAll();
                    for ( var i = 0; i < observableDocs().length; i += 1 ) {
                        this.values.documents.push( observableDocs()[i] );
                    }

                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    alert( "Unable to update documents list. " + textStatus + "|" + errorThrown );
                }
            } );
        }

        deleteDocument( item: Service.ApiModels.IObservableActivityDocument, index: number, event: any ): void {
            $.ajax( {
                type: 'DELETE',
                url: App.Routes.WebApi.Activities.Documents.del( this.id(), item.id() ),
                dataType: 'json',
                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                    this.values.documents.splice(index, 1);
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    alert( "Unable to delete document. " + textStatus + "|" + errorThrown );
                }
            } );
        }

        startDocumentTitleEdit( item: Service.ApiModels.IObservableActivityDocument, event: any ): void {
            var textElement = event.target;
            $( textElement ).hide();
            this.previousDocumentTitle = item.title();
            var inputElement = $( textElement ).siblings( "#documentTitleInput" )[0];
            $( inputElement ).show();
            $( inputElement ).focusout( event, ( event: any ): void => { this.endDocumentTitleEdit( item, event ); } );
            $( inputElement ).keypress( event, ( event: any ): void => { if ( event.which == 13 ) { inputElement.blur(); } } );
        }

        endDocumentTitleEdit( item: Service.ApiModels.IObservableActivityDocument, event: any ): void {
            var inputElement = event.target;
            $( inputElement ).unbind( "focusout" );
            $( inputElement ).unbind( "keypress" );
            $( inputElement ).attr( "disabled", "disabled" );

            $.ajax( {
                type: 'PUT',
                url: App.Routes.WebApi.Activities.Documents.rename( this.id(), item.id() ),
                data: ko.toJSON( item.title() ),
                contentType: 'application/json',
                dataType: 'json',
                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                    $( inputElement ).hide();
                    $( inputElement ).removeAttr( "disabled" );
                    var textElement = $( inputElement ).siblings( "#documentTitle" )[0];
                    $( textElement ).show();
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    item.title( this.previousDocumentTitle );
                    $( inputElement ).hide();
                    $( inputElement ).removeAttr( "disabled" );
                    var textElement = $( inputElement ).siblings( "#documentTitle" )[0];
                    $( textElement ).show();
                    $( "#documentRenameErrorDialog > #message" )[0].innerText = jqXhr.responseText;
                    $( "#documentRenameErrorDialog" ).dialog( {
                        modal: true,
                        resizable: false,
                        width: 400,
                        buttons: { Ok: function () { $( this ).dialog( "close" ); } }
                    } );
                }
            } );
        }
    }
}
