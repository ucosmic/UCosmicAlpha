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
	    activityTypesList: Service.ApiModels.IEmployeeActivityType[];

	    personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
        items: KnockoutObservableArray; // array of IObservableActivity

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------                        
        constructor(personId: number) {
            this.personId = personId;
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var deferred: JQueryDeferred = $.Deferred();

            var locationsPact = $.Deferred();
            $.get(App.Routes.WebApi.Activities.getLocations(0))
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
            var activitiesSearchInput: ActivitySearchInput = new ActivitySearchInput(); 
            
            activitiesSearchInput.personId = this.personId;
            activitiesSearchInput.orderBy = "";
            activitiesSearchInput.pageNumber = 1;
            activitiesSearchInput.pageSize = 10;

            $.get(App.Routes.WebApi.Activities.getAllPaged(), activitiesSearchInput)
                .done((data: Service.ApiModels.IEmployeeActivityType[], textStatus: string, jqXHR: JQueryXHR): void => {
                    { dataPact.resolve(data); }
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    { dataPact.reject(jqXhr, textStatus, errorThrown); }
                });
            
            // only process after all requests have been resolved
            $.when(typesPact, locationsPact, dataPact)
                .done( (types: Service.ApiModels.IEmployeeActivityType[],
                    locations: Service.ApiModels.IActivityLocation[],
                         data: Service.ApiModels.IActivityPage): void => {

                    this.activityTypesList = types;
                    this.activityLocationsList = locations;

                    {
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {}, this);
                            this.proxyImageSource = App.Routes.WebApi.Activities.getDocumentProxyImage(this.id(),data.id);
                        };

                        var mapping = {
                            'documents': {
                                create: function (options) {
                                    return new augmentedDocumentModel(options.data); 
                                }
                            }
                        };

                        ko.mapping.fromJS(data, mapping, this);
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
        deleteActivityById(activityId: number): void {
            $.ajax({
                type: "DELETE",
                url: App.Routes.WebApi.Activities.del(activityId),
                success: function (data: Service.ApiModels.IActivityPage, textStatus: string, jqXHR: JQueryXHR): void
                    {
                        alert(textStatus);
                    },
                error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void
                    {
                        alert(textStatus);
                    }
            });
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        deleteActivity(data:any, event:any, viewModel: any): void {
             $("#confirmActivityDeleteDialog").dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                            { text: "Yes, confirm delete", click: function(): void {
                                viewModel.deleteActivityById(data.revisionId());
                                $(this).dialog("close");
                                }
                            },
                            { text: "No, cancel delete", click: function(): void {
                                $(this).dialog("close");
                                }
                            },
                        ]
            });
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        editActivity(data: any, event: any, activityId: number): void {
            var element = event.srcElement;
            var url = null;

            while ((element != null) && (element.nodeName != 'TR')) {
                element = element.parentElement;
            }

            if (element != null) {
                url = element.attributes["href"].value;
            }

            if (url != null) {
                location.href = url;
            }
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
                       (id != this.activityLocationsList[i].id)) { i += 1 }

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
        activityTypesFormatted(types: Service.ApiModels.IObservableValuesActivityType[]): string {
            var formattedTypes: string = "";
            var location: Service.ApiModels.IActivityLocation;

            for (var i = 0; i < types.length; i += 1) {
                if (i > 0) { formattedTypes += ", "; }
                formattedTypes += this.getTypeName(types[i].typeId());
            }

            return formattedTypes;
        }
        
        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        activityLocationsFormatted(locations: Service.ApiModels.IObservableValuesActivityLocation[]): string {
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
