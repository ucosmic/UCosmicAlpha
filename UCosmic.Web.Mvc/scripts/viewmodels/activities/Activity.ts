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
/// <reference path="../activities/ServiceApiModel.d.ts" />

module ViewModels.Activities {

    // ================================================================================
    /* 
    */
    // ================================================================================
	export class Activity implements Service.ApiModels.IObservableActivity, KnockoutValidationGroup {

        /* Array of all locations offered in Country/Location multiselect. */
	    locations: KnockoutObservableArray = ko.observableArray();

        /* Array of placeIds of selected locations. */
	    selectedLocations: KnockoutObservableArray = ko.observableArray();

        /* Array of activity types displayed as list of checkboxes */
	    activityTypes: KnockoutObservableArray = ko.observableArray();

        /* True if adding new tag. */
        addingTag: KnockoutObservableBool = ko.observable(false);

        /* Data bound to new tag textArea */
	    newTag: KnockoutObservableString = ko.observable();

        /* True if uploading document. */
        uploadingDocument: KnockoutObservableBool = ko.observable(false);

        /* Initialization errors. */
        inititializationErrors: string = "";

        /* KnockoutValidation declaration. */
        isValid: () => bool;
        errors: KnockoutValidationErrors;

        /* IObservableActivity implemented */
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        personId: KnockoutObservableNumber;
        number: KnockoutObservableNumber;
        entityId: KnockoutObservableString;     // guid converted to string
        modeText: KnockoutObservableString;
        values: Service.ApiModels.IObservableActivityValues;          // only values for modeText

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize(activityId: number): void {
            this.id = ko.observable(activityId);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------   
        setupWidgets(fromDatePickerId: string,
            toDatePickerId: string,
            countrySelectorId: string,
            uploadFileId: string,
            newTagId: string): void {

            $("#" + fromDatePickerId).kendoDatePicker();
            $("#" + toDatePickerId).kendoDatePicker();

            $("#" + countrySelectorId).kendoMultiSelect({
                dataTextField: "officialName()",
                dataValueField: "id()",
                dataSource: this.locations(),
                //values: activityViewModel.selectedLocations(), // This doesn't work.  See below.
                change: (event: any) => { this.updateLocations(event.sender.value()); },
                placeholder: "[Select Country/Location, Body of Water or Global]"
            });

            tinyMCE.init({
                // Example content CSS (should be your site CSS)
                //content_css : 'css/content.css',
                content_css: "../../scripts/tinymce/css/content.css",
                convert_urls: false,

                // General options
                theme: 'advanced',
                mode: 'exact',
                elements: 'tinymce',
                height: '300',
                width: '100%',
                verify_html: true,
                plugins: 'save,autosave,paste,searchreplace,table,nonbreaking',

                // Theme options
                theme_advanced_buttons1: 'save,undo,redo,restoredraft,|,formatselect,bold,italic,underline,|,link,unlink,|,bullist,numlist,|,outdent,indent,blockquote,|,sub,sup,charmap,code',
                theme_advanced_buttons2: 'cut,copy,paste,pastetext,pasteword,|,search,replace,|,image,hr,nonbreaking,tablecontrols',
                theme_advanced_buttons3: '',

                theme_advanced_toolbar_location: 'top',
                theme_advanced_toolbar_align: 'left',
                theme_advanced_statusbar_location: 'bottom',
                theme_advanced_resizing: true,
                theme_advanced_resizing_max_height: '580',
                theme_advanced_resize_horizontal: false,
                theme_advanced_blockformats: 'h2,h3,p,blockquote',

                save_enablewhendirty: true,
                save_onsavecallback: 'onSavePluginCallback',

                // Drop lists for link/image/media/template dialogs
                template_external_list_url: 'lists/template_list.js',
                external_link_list_url: 'lists/link_list.js',
                external_image_list_url: 'lists/image_list.js',
                media_external_list_url: 'lists/media_list.js'
            });

            $("#" + uploadFileId).kendoUpload({
                multiple: false,
                showFileList: false,
                async: {
                    saveUrl: App.Routes.WebApi.Activities.Documents.post(this.id()),
                    autoUpload: true
                },
                select: (e: any): void => {
                    var i = 0;
                    var validFileType = true;
                    while ((i < e.files.length) && validFileType) {
                        var file = e.files[i];
                        validFileType = this.validateUploadableFileTypeByExtension(this.id(), file.extension);
                        if (!validFileType) {
                            e.preventDefault();
                        }
                        i += 1;
                    }
                },
                success: (e: any): void => {
                    this.uploadingDocument(false);
                    this.loadDocuments();
                }
            });

            $("#" + newTagId).kendoAutoComplete({
                minLength: 3,
                placeholder: "[Enter tag]",
                dataTextField: "officialName",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: App.Routes.WebApi.Establishments.get(),
                                data: { keyword: options.data.filter.filters[0].value },
                                success: (results: any): void => {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                })  
            });
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
            this.values.title.extend({ required: true, minLength: 1 });

            this.selectedLocations.extend({ minLength: 1 });

            ko.validation.group(this);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        constructor(activityId: number) {
            this._initialize(activityId);
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var deferred: JQueryDeferred = $.Deferred();

            var locationsPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.Locations.get())
                .done((data: Service.ApiModels.IActivityLocation[], textStatus: string, jqXHR: JQueryXHR): void => {
                    locationsPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });

            var typesPact = $.Deferred();
            $.get(App.Routes.WebApi.Employees.ModuleSettings.ActivityTypes.get())
                .done((data: Service.ApiModels.IEmployeeActivityType[], textStatus: string, jqXHR: JQueryXHR): void => {
                    typesPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });

            var dataPact = $.Deferred();

            $.ajax({
                    type: "GET",
                     url: App.Routes.WebApi.Activities.get(this.id()),
                 success: function (data: Service.ApiModels.IActivityPage, textStatus: string, jqXhr: JQueryXHR): void 
                            { dataPact.resolve(data); },
                   error: function  (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void
                            { dataPact.reject(jqXhr, textStatus, errorThrown); },
            });
            
            // only process after all requests have been resolved
            $.when( typesPact, locationsPact, dataPact)
                .done( (types: Service.ApiModels.IEmployeeActivityType[],
                        locations: Service.ApiModels.IActivityLocation[], 
                        data: Service.ApiModels.IObservableActivity): void => {

                    this.activityTypes = ko.mapping.fromJS(types);
                    this.locations = ko.mapping.fromJS(locations);
                                    
                    /* Although the MVC DateTime to JSON serializer will output an ISO compatible
                        string, we are not guarenteed that a browser's Date(string) or Date.parse(string)
                        functions will accurately convert to Date.  So, we are using
                        moment.js to handle the parsing and conversion.
                    */
                    {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {}, this);
                            this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(this.id(),data.id));
                        };
                        
                       var mapping = {
                            'documents': {
                                create: function (options: any) {
                                    return new augmentedDocumentModel(options.data); 
                                }
                            },
                            'startsOn':{
                                create: (options: any): KnockoutObservableDate => {
                                    return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                                }
                            },
                            'endsOn': {
                                create: (options: any): KnockoutObservableDate => {
                                    return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                                }
                            }
                        };

                        ko.mapping.fromJS(data, mapping, this);
                    }

                    
                    /* Initialize the list of selected locations with current locations in values. */
                    for (var i = 0; i < this.values.locations().length; i += 1) {
                        this.selectedLocations.push(this.values.locations()[i].placeId());
                    }

                    /* Check the activity types checkboxes if the activity type exists in values. */
                    for (var i = 0; i < this.activityTypes().length; i += 1) {
                        this.activityTypes()[i].checked = ko.computed(this.defHasActivityTypeCallback(i));
                    }

                    deferred.resolve();
                })
                .fail( (xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(xhr, textStatus, errorThrown);
                });

            return deferred;
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        save(item: any, event: any, mode: string): bool {
            if (this.isValid()) {
                debugger;
            }
            return true;
        }
 
        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        cancel(item: any, event: any, mode: string): bool {

            return true;
        } 

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        addActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex == -1) {
                var newActivityType: KnockoutObservableAny = ko.mapping.fromJS({ id: 0, typeId: activityTypeId });
                this.values.types.push(newActivityType);
            }
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        removeActivityType(activityTypeId: number): void {
            var existingIndex: number = this.getActivityTypeIndexById(activityTypeId);
            if (existingIndex != -1) {
                var activityType = this.values.types()[existingIndex];
                this.values.types.remove(activityType);
            }
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        getTypeName(id: number): string {
            var name: string = "";
            var index: number = this.getActivityTypeIndexById(id);
            if (index != -1) { name = this.activityTypes[index].type; }
            return name;
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        getActivityTypeIndexById(activityTypeId: number): number {
            var index: number = -1;

            if ((this.values.types != null) && (this.values.types().length > 0)) {
                var i = 0;
                while ((i < this.values.types().length) &&
                       (activityTypeId != this.values.types()[i].typeId())) { i += 1 }

                if (i < this.values.types().length) {
                    index = i;
                }
            }

            return index;
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        hasActivityType(activityTypeId: number): bool {
            return this.getActivityTypeIndexById(activityTypeId) != -1;
        }

        // --------------------------------------------------------------------------------
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
        // --------------------------------------------------------------------------------
        defHasActivityTypeCallback(activityTypeIndex: number): KnockoutComputedDefine {
            var def: KnockoutComputedDefine = {
                read: (): bool {
                    return this.hasActivityType(this.activityTypes()[activityTypeIndex].id());
                },
                write: function (checked) {
                    if (checked) {
                        this.addActivityType(this.activityTypes()[activityTypeIndex].id());
                    } else {
                        this.removeActivityType(this.activityTypes()[activityTypeIndex].id());
                    }
                },
                owner: this
            };

            return def;
        }

        // --------------------------------------------------------------------------------
        /*
            Rebuild values.location with supplied (non-observable) array.
        */
        // --------------------------------------------------------------------------------
        updateLocations(locations: Array): void {
            this.values.locations = ko.observableArray();
            for (var i = 0; i < locations.length; i += 1) {
                var location = ko.mapping.fromJS({ id: 0, placeId: locations[i] });
                this.values.locations.push(location);
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        addTag(item: any, event: Event): void {
            var newText = this.newTag();
            newText = (newText != null) ? newText.trim() : null;
            if ((newText != null) &&
                (newText.length != 0) &&
                (!this.haveTag(newText))) {
                var tag = {
                    id: 0,
                    number: 0,
                    text: newText,
                    domainTypeText: null,
                    domainKey: null,
                    modeText: this.modeText(),
                    isInstitution: false
                };
                var observableTag = ko.mapping.fromJS(tag);
                this.values.tags.push(observableTag);
            }

            this.newTag(null);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        removeTag(item: any, event: Event): void {
            this.values.tags.remove(item);
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        haveTag(text: string): bool {
            return this.tagIndex(text) != -1;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        tagIndex(text: string): number {
            var i = 0;
            while ((i < this.values.tags().length) &&
                    (text != this.values.tags()[i].text())) {
                i += 1;
            }
            return ((this.values.tags().length > 0) && (i < this.values.tags().length)) ? i : -1;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        validateUploadableFileTypeByExtension(activityId: number, inExtension: string): bool {
            var valid = true;
            var extension = inExtension;

            if ((extension == null) ||
                (extension.length == 0) ||
                (extension.length > 255)) {
                valid = false;
            }
            else {
                if (extension[0] === ".") {
                    extension = extension.substring(1);
                }

                $.ajax({
                       async: false,
                        type: 'POST',
                         url: App.Routes.WebApi.Activities.Documents.validateFileExtensions(activityId),
                        data: ko.toJSON(extension),
                    dataType: 'json',
                 contentType: 'application/json',
                     success: (data: any, textStatus: string, jqXhr: JQueryXHR): void {
                         valid = true;
                    },
                       error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void {
                           valid = false;
                    }
                });
            }

            return valid;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        loadDocuments(): void {
            $.ajax({
                    type: 'GET',
                     url: App.Routes.WebApi.Activities.Documents.get(this.id(),null,this.modeText()),
                dataType: 'json',
                success: (documents: any, textStatus: string, jqXhr: JQueryXHR): void {

                    /* TBD - This needs to be combined with the initial load mapping. */
                    var augmentedDocumentModel = function (data) {
                        ko.mapping.fromJS(data, {}, this);
                        this.proxyImageSource = ko.observable(App.Routes.WebApi.Activities.Documents.Thumbnail.get(this.id(),data.id));
                    };

                    var mapping = {
                        create: function (options: any) {
                            return new augmentedDocumentModel(options.data);
                        }
                    };

                    var observableDocs = ko.mapping.fromJS(documents, mapping);

                    this.values.documents.removeAll();
                    for (var i = 0; i < observableDocs().length; i += 1) {
                        this.values.documents.push(observableDocs()[i]);
                    }

                },
                    error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void {
                        alert("Unable to update documents list. " + textStatus + "|" + errorThrown);
                }
            });
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        deleteDocument(item: Service.ApiModels.IObservableActivityDocument, event: any): void {
            $.ajax({
                    type: 'DELETE',
                        url: App.Routes.WebApi.Activities.Documents.del(this.id(),item.id()),
                dataType: 'json',
                    success: (data: any, textStatus: string, jqXhr: JQueryXHR): void {
                        this.loadDocuments();
                },
                    error: (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void {
                        alert("Unable to delete document. " + textStatus + "|" + errorThrown);
                }
            });
        }

	}
}
