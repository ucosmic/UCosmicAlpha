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

    export class ActivitySearchInput {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
    }

    // ================================================================================
    /* 
    */
    // ================================================================================
	export class ActivityList implements KnockoutValidationGroup {

	    activityLocationsList: Service.ApiModels.IActivityLocation[];
	    activityTypesList: Service.ApiModels.IActivityType[];

	    personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
        items: KnockoutObservableArray; // array of IObservableActivity

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------                        
        constructor(bindingId: string, personId: number) {

            this.personId = personId;
            this._initialize(bindingId);

            //this._setupValidation();
            //this._setupKendoWidgets();
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        private _initialize(bindingId: string) {

            var locationsPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.Locations.get())
                .done((data: Service.ApiModels.IActivityLocation[], textStatus: string, jqXHR: JQueryXHR): void => {
                    locationsPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });

            var typesPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.Types.get())
                .done((data: Service.ApiModels.IActivityType[], textStatus: string, jqXHR: JQueryXHR): void => {
                    typesPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });

            var dataPact = $.Deferred();
            var activitiesSearchInput: ActivitySearchInput = new ActivitySearchInput(); 
            
            activitiesSearchInput.personId = this.personId;
            activitiesSearchInput.orderBy = "";
            activitiesSearchInput.pageNumber = 1;
            activitiesSearchInput.pageSize = 10;

            $.ajax({
                    type: "POST",
                     url: App.Routes.WebApi.Activities.get(),
                    data: activitiesSearchInput,
                 success: function (data: Service.ApiModels.IActivityPage, textStatus: string, jqXHR: JQueryXHR): void 
                            { dataPact.resolve(data); },
                   error: function  (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void
                            { dataPact.reject(jqXHR, textStatus, errorThrown); },
                dataType: 'json'
            });
            
            // only process after all requests have been resolved
            $.when(typesPact, locationsPact, dataPact).then(

                // all requests succeeded
                (     types: Service.ApiModels.IActivityType[],
                  locations: Service.ApiModels.IActivityLocation[],
                       data: Service.ApiModels.IActivityPage): void => {

                    this.activityTypesList = types;
                    this.activityLocationsList = locations;

                    ko.mapping.fromJS(data, {}, this); // load data

                    //if (!this._isInitialized) {

                        ko.applyBindings(this, $("#"+bindingId)[0]);

                        //this._isInitialized = true; // bindings have been applied

                        //this.$countries().kendoDropDownList(); // kendoui dropdown for countries
                    //}
                },

                // one of the responses failed (never called more than once, even on multifailures)
                (xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    //alert('a GET API call failed :(');
                });
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        addActivity(): void {
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        deleteActivity(): void {
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

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        activityDatesFormatted(startsOnStr: string, endsOnStr: string): string {
            var formattedDateRange: string = "";
            var startsOn = (startsOnStr != null) ? new Date(startsOnStr) : null;
            var endsOn = (endsOnStr != null) ? new Date(endsOnStr) : null;

            if (startsOn == null) {
                if (endsOn != null) {
                    formattedDateRange = endsOn.getMonth() + "/" + endsOn.getDate() + "/" + endsOn.getFullYear();
                }
            } else {
                formattedDateRange = startsOn.getMonth() + "/" + startsOn.getDate() + "/" + startsOn.getFullYear();
                if (endsOn != null) {
                    formattedDateRange += " - " + endsOn.getMonth() + "/" + endsOn.getDate() + "/" + endsOn.getFullYear();
                }
            }

            if (formattedDateRange.length > 0) {
                formattedDateRange += "\xa0\xa0";
            }

            return formattedDateRange;
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        activityLocationsFormatted(locations: Service.ApiModels.IObservableActivityLocation[]): string {
            var formattedLocations: string = "";
            var location: Service.ApiModels.IActivityLocation;

            for (var i = 0; i < locations.length; i += 1) {
                if (i > 0) { formattedLocations += ", "; }
                formattedLocations += this.getLocationName(locations[i].placeId());
            }

            return formattedLocations;
        }
	}
}
