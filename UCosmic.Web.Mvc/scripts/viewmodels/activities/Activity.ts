/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
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
        constructor(activityId: number) {
            this.id = ko.observable(activityId);
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
                     url: App.Routes.WebApi.Activity.get() + this.id().toString(),
                 success: function (data: Service.ApiModels.IActivityPage, textStatus: string, jqXhr: JQueryXHR): void 
                            { dataPact.resolve(data); },
                   error: function  (jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void
                            { dataPact.reject(jqXhr, textStatus, errorThrown); },
            });
            
            // only process after all requests have been resolved
            $.when(typesPact, locationsPact, dataPact)
                .done( (types: Service.ApiModels.IEmployeeActivityType[],
                        locations: Service.ApiModels.IActivityLocation[],
                        data: Service.ApiModels.IObservableActivity): void => {

                    ko.mapping.fromJS(locations, {}, this.locations);

                    {
                        var mapping = {
                            'startsOn':{
                                create: (options: any): KnockoutObservableDate => {
                                    return ko.observable(moment(options.data).toDate());
                                }
                            },
                            'endsOn': {
                                create: (options: any): KnockoutObservableDate => {
                                    return ko.observable(moment(options.data).toDate());
                                }
                            }
                        };

                        ko.mapping.fromJS(data, mapping, this);
                    }

                    ko.mapping.fromJS(types, {}, this.activityTypes);
                    
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
	}
}
