/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../activities/ServiceApiModel.d.ts" />

module ViewModels.Activities {

    export class ActivitySearchInput {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
    }

    export class ActivityList implements KnockoutValidationGroup {

        private static iconMaxSide: number = 64;

        activityLocationsList: Service.ApiModels.IActivityLocation[];
        activityTypesList: Service.ApiModels.IEmployeeActivityType[];

        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
        items: KnockoutObservableArray<any>; // array of IObservableActivity

        constructor(personId: number) {
            this.personId = personId;
        }

        load(): JQueryPromise {
            var deferred: JQueryDeferred<void> = $.Deferred();

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
            var activitiesSearchInput: ActivitySearchInput = new ActivitySearchInput();

            activitiesSearchInput.personId = this.personId;
            activitiesSearchInput.orderBy = "";
            activitiesSearchInput.pageNumber = 1;
            activitiesSearchInput.pageSize = 2147483647; /* C# Int32.Max */

            $.get(App.Routes.WebApi.Activities.get(), activitiesSearchInput)
                .done((data: Service.ApiModels.IEmployeeActivityType[], textStatus: string, jqXHR: JQueryXHR): void => {
                    { dataPact.resolve(data); }
                })
                .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    { dataPact.reject(jqXhr, textStatus, errorThrown); }
                });

            // only process after all requests have been resolved
            $.when(typesPact, locationsPact, dataPact)
                .done((types: Service.ApiModels.IEmployeeActivityType[],
                    locations: Service.ApiModels.IActivityLocation[],
                    data: Service.ApiModels.IActivityPage): void => {

                    this.activityTypesList = types;
                    this.activityLocationsList = locations;

                    {
                        var augmentedDocumentModel = function ( data ) {
                            ko.mapping.fromJS( data, {}, this );
                            this.proxyImageSource = App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: ActivityList.iconMaxSide });
                        };

                        var mapping = {
                            'documents': {
                                create: function ( options ) {
                                    return new augmentedDocumentModel( options.data );
                                },
                            },
                            'startsOn': {
                                create: ( options: any ): KnockoutObservable<Date> => {
                                    return ( options.data != null ) ? ko.observable( moment( options.data ).toDate() ) : ko.observable();
                                }
                            },
                            'endsOn': {
                                create: ( options: any ): KnockoutObservable<Date> => {
                                    return ( options.data != null ) ? ko.observable( moment( options.data ).toDate() ) : ko.observable();
                                }
                            }
                        };

                        ko.mapping.fromJS(data, mapping, this);
                    }

                    deferred.resolve();
                })
                .fail((xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    deferred.reject(xhr, textStatus, errorThrown);
                });

            return deferred;
        }

        deleteActivityById(activityId: number): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.Activities.del(activityId),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void =>
                { },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus);
                }
            });
        }

        deleteActivity(data: any, e: any, viewModel: any): void {
            $("#confirmActivityDeleteDialog").dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                {
                    text: "Yes, confirm delete",
                    click: function (): void {
                        viewModel.deleteActivityById(data.id());
                        $(this).dialog("close");

                        /* TBD - Don't reload page. */
                        location.href = App.Routes.Mvc.My.Profile.get();
                    }
                },
                {
                    text: "No, cancel delete",
                    click: function (): void {
                        $(this).dialog("close");
                    },
                    'data-css-link': true
                }]
            });
        }

        editActivity(activityId: number): boolean {
            var returnValue = false;
            $.ajax({
                type: 'GET',
                async: false,
                url: App.Routes.WebApi.Activities.getEditState(activityId)
            })
            .done((editState: any, textStatus: string, jqXHR: JQueryXHR): void => {
                if (editState.isInEdit) {
                    var $dialog = $("#activityBeingEditedDialog");
                    $dialog.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: {
                            Ok: (): void => {
                                $dialog.dialog("close");
                            }
                        }
                    });
                }
                else {
                    returnValue = true;
                }
            })
            .fail((xhr: JQueryXHR): void => {
                App.Failures.message(xhr, 'while trying to edit your activity', true)
            });
            return returnValue;
        }

        editActivityUrl(id: number): string {
            return App.Routes.Mvc.My.Profile.activityEdit(id);
        }

        newActivity(data: any, event: any): void {
            $.ajax({
                type: "POST",
                url: App.Routes.WebApi.Activities.post(),
                success: (newActivityId: number, textStatus: string, jqXHR: JQueryXHR): void =>
                {
                    location.href = App.Routes.Mvc.My.Profile.activityEdit(newActivityId);
                },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void =>
                {
                    alert(textStatus + "|" + errorThrown);
                }
            });
        }

        getTypeName(id: number): string {
            var typeName: string = "";

            if (this.activityTypesList != null)
            {
                var i = 0;
                while ((i < this.activityTypesList.length) &&
                       (id != this.activityTypesList[i].id)) { i += 1 }

                if (i < this.activityTypesList.length)
                {
                    typeName = this.activityTypesList[i].type;
                }
            }

            return typeName;
        }

        getLocationName(id: number): string {
            var locationName: string = "";

            if (this.activityLocationsList != null)
            {
                var i = 0;
                while ((i < this.activityLocationsList.length) &&
                       (id != this.activityLocationsList[i].id)) { i += 1 }

                if (i < this.activityLocationsList.length)
                {
                    locationName = this.activityLocationsList[i].officialName;
                }
            }

            return locationName;
        }

        activityDatesFormatted(startsOnStr: Date, endsOnStr: Date, onGoing: boolean, dateFormat: string): string {
            var formattedDateRange: string = "";

            /* May need a separate function to convert from CLR custom date formats to moment formats */
            dateFormat = (dateFormat != null) ? dateFormat.toUpperCase() : "MM/DD/YYYY";

            if (startsOnStr == null)
            {
                if (endsOnStr != null)
                {
                    formattedDateRange = moment(endsOnStr).format(dateFormat);
                }
            }
            else
            {
                formattedDateRange = moment(startsOnStr).format(dateFormat);
                if (onGoing) {
                    formattedDateRange += " (Ongoing)";
                } else if (endsOnStr != null)
                {
                    formattedDateRange += " - " + moment(endsOnStr).format(dateFormat);
                }
            }

            if (formattedDateRange.length > 0)
            {
                formattedDateRange += "\xa0\xa0";
            }

            return formattedDateRange;
        }

        activityTypesFormatted(types: Service.ApiModels.IObservableValuesActivityType[]): string {
            var formattedTypes: string = "";
            var location: Service.ApiModels.IActivityLocation;

            /* ----- Assemble in sorted order ----- */
            for (var i = 0; i < this.activityTypesList.length; i += 1)
            {
                for (var j = 0; j < types.length; j += 1)
                {
                    if (types[j].typeId() == this.activityTypesList[i].id)
                    {
                        if (formattedTypes.length > 0) { formattedTypes += "; "; }
                        formattedTypes += this.activityTypesList[i].type;
                    }
                }
            }

            return formattedTypes;
        }

        activityLocationsFormatted(locations: Service.ApiModels.IObservableValuesActivityLocation[]): string {
            var formattedLocations: string = "";
            var location: Service.ApiModels.IActivityLocation;

            for (var i = 0; i < locations.length; i += 1)
            {
                if (i > 0) { formattedLocations += ", "; }
                formattedLocations += this.getLocationName(locations[i].placeId());
            }

            return formattedLocations;
        }
    }
}
