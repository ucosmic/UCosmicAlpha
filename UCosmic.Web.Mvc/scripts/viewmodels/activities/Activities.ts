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

        load(): JQueryPromise<any> {
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
            activitiesSearchInput.pageSize = App.Constants.int32Max;

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
                        var augmentedDocumentModel = function (data) {
                            ko.mapping.fromJS(data, {}, this);
                            this.proxyImageSource = App.Routes.WebApi.Activities.Documents.Thumbnail.get(data.activityId, data.id, { maxSide: ActivityList.iconMaxSide });
                        };

                        var mapping = {
                            'documents': {
                                create: function (options) {
                                    return new augmentedDocumentModel(options.data);
                                },
                            },
                            'startsOn': {
                                create: (options: any): KnockoutObservable<Date> => {
                                    return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
                                }
                            },
                            'endsOn': {
                                create: (options: any): KnockoutObservable<Date> => {
                                    return (options.data != null) ? ko.observable(moment(options.data).toDate()) : ko.observable();
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

        deleteActivity(item: any, e: JQueryEventObject, viewModel: ActivityList): void {
            var $dialog = $("#confirmActivityDeleteDialog");
            $dialog.dialog({ // open a dialog to confirm deletion of activity
                dialogClass: 'jquery-ui no-close',
                width: 'auto',
                resizable: false,
                modal: true,
                closeOnEscape: false,
                buttons: [
                    {
                        text: "Yes, confirm delete",
                        click: (): void => {
                            var $buttons = $dialog.parents('.ui-dialog').find('button');
                            $.each($buttons, function (): void { // disable buttons
                                $(this).attr('disabled', 'disabled');
                            });
                            $dialog.find('.spinner').css('visibility', '');

                            $.ajax({ // submit delete api request
                                type: 'DELETE',
                                url: App.Routes.WebApi.Activities.del(item.id())
                            })
                                .done((): void => {
                                    $dialog.dialog("close");

                                    // get the index of the deleted activity
                                    var deletedIndex = $.inArray(item, this.items());
                                    if (deletedIndex >= 0)
                                        this.items.splice(deletedIndex, 1);
                                })
                                .fail((xhr: JQueryXHR): void => { // display failure message
                                    App.Failures.message(xhr, 'while trying to delete your activity', true)
                                })
                                .always((): void => { // re-enable buttons
                                    $.each($buttons, function (): void {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                        }
                    },
                    {
                        text: "No, cancel delete",
                        click: (): void => {
                            var test = this;
                            test = viewModel;
                            $dialog.dialog("close");
                        },
                        'data-css-link': true
                    }]
            });
        }

        editActivityUrl(id: number): string {
            return App.Routes.Mvc.My.Profile.activityEdit(id);
        }

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

        activityDatesFormatted(startsOnStr: Date, endsOnStr: Date, onGoing: boolean, dateFormat: string): string {
            var formattedDateRange: string = "";

            /* May need a separate function to convert from CLR custom date formats to moment formats */
            dateFormat = (dateFormat != null) ? dateFormat.toUpperCase() : "MM/DD/YYYY";

            if (startsOnStr == null) {
                if (endsOnStr != null) {
                    formattedDateRange = moment(endsOnStr).format(dateFormat);
                }
                else if (onGoing) {
                    formattedDateRange = "(Ongoing)";
                }
            }
            else {
                formattedDateRange = moment(startsOnStr).format(dateFormat);
                if (onGoing) {
                    formattedDateRange += " (Ongoing)";
                } else if (endsOnStr != null) {
                    formattedDateRange += " - " + moment(endsOnStr).format(dateFormat);
                }
            }

            if (formattedDateRange.length > 0) {
                formattedDateRange += "\xa0\xa0";
            }

            return formattedDateRange;
        }

        activityTypesFormatted(types: Service.ApiModels.IObservableValuesActivityType[]): string {
            var formattedTypes: string = "";
            var location: Service.ApiModels.IActivityLocation;

            /* ----- Assemble in sorted order ----- */
            for (var i = 0; i < this.activityTypesList.length; i += 1) {
                for (var j = 0; j < types.length; j += 1) {
                    if (types[j].typeId() == this.activityTypesList[i].id) {
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

            for (var i = 0; i < locations.length; i += 1) {
                if (i > 0) { formattedLocations += ", "; }
                formattedLocations += this.getLocationName(locations[i].placeId());
            }

            return formattedLocations;
        }

        getActivityTypeIconName(typeId: number): string {
            var i: number = 0;
            while ((i < this.activityTypesList.length) && (this.activityTypesList[i].id != typeId)) {
                i += 1;
            }
            return (i < this.activityTypesList.length) ? this.activityTypesList[i].iconName : null;
        }

        getActivityTypeToolTip(typeId: number): string {
            var i: number = 0;
            while ((i < this.activityTypesList.length) && (this.activityTypesList[i].id != typeId)) {
                i += 1;
            }
            return (i < this.activityTypesList.length) ? this.activityTypesList[i].type : null;
        }
    }
}
