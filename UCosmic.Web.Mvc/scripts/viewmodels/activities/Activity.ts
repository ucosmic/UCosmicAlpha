/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../activities/ServiceApiModel.d.ts" />

module ViewModels.Activities {

    // ================================================================================
    /* 
    */
    // ================================================================================
	export class Activity implements Service.ApiModels.IObservableActivity, KnockoutValidationGroup {

	    activityLocationsList: Service.ApiModels.IActivityLocation[];
	    activityTypesList: KnockoutObservableArray;

        /* IObservableActivity implemented */
        revisionId: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        personId: KnockoutObservableNumber;
        number: KnockoutObservableNumber;
        entityId: KnockoutObservableString;     // guid converted to string
        modeText: KnockoutObservableString;
        values: KnockoutObservableArray;
        tags: KnockoutObservableArray;

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------                        
        constructor(activityId: number) {
            this.revisionId = ko.observable(activityId);
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
                     url: App.Routes.WebApi.Activity.get() + this.revisionId().toString(),
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

                    debugger;

                    this.activityTypesList = ko.observableArray();
                    ko.mapping.fromJS(types, {}, this.activityTypesList);

                    this.activityLocationsList = locations;

                    ko.mapping.fromJS(data, {}, this);

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
        getTypeName(id: number): string {
            var typeName: string = "";

            if (this.activityTypesList != null) {
                var i = 0;
                while ((i < this.activityTypesList.length) &&
                       (id != this.activityTypesList[i].id)) { i += 1 }

                if (i < this.activityTypesList.length) {
                    typeName = this.activityTypesList[i].type;
                }
            }

            return typeName;
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        getLocationName(id: number): string {
            var locationName: string = "";

            if (this.activityLocationsList != null) {
                var i = 0;
                while ((i < this.activityLocationsList.length) &&
                       (id != this.activityLocationsList[i].placeId)) { i += 1 }

                if (i < this.activityLocationsList.length) {
                    locationName = this.activityLocationsList[i].officialName;
                }
            }

            return locationName;
        }
	}
}
