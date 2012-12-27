/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../google/google.maps.d.ts" />
/// <reference path="../../google/ToolsOverlay.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../languages/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />

module ViewModels.Establishments {

    export class Item {

        // spinners
        namesSpinner: Spinner = new Spinner(new SpinnerOptions(0, true));
        urlsSpinner: Spinner = new Spinner(new SpinnerOptions(0, true));

        // fields
        id: number = 0;
        $genericAlertDialog: JQuery = undefined;

        constructor (id?: number) {

            // initialize the aggregate id
            this.id = id || 0;

            //#region Names

            // languages dropdowns
            ko.computed((): void => { // get languages from the server
                $.getJSON(App.Routes.WebApi.Languages.get())
                    .done((response: Languages.IServerApiModel[]): void => {
                        var emptyValue = new Languages.ServerApiModel(undefined,
                            '[Language Neutral]');
                        response.splice(0, 0, emptyValue); // add null option
                        this.languages(response); // set the options dropdown
                    });
            }).extend({ throttle: 1 });

            // set up names mapping
            this.namesMapping = {
                create: (options: any): Name => {
                    return new Name(options.data, this);
                }
            };

            this.canAddName = ko.computed((): bool => {
                return !this.namesSpinner.isVisible() && this.editingName() === 0 && this.id !== 0;
            });

            // request names
            ko.computed((): void => {
                if (this.id)
                    this.requestNames();

                else setTimeout(() => {
                    this.namesSpinner.stop();
                    this.addName();
                }, 0);
            }).extend({ throttle: 1 });

            //#endregion
            //#region URLs

            // set up URLs mapping
            this.urlsMapping = {
                create: (options: any): Url => {
                    return new Url(options.data, this);
                }
            };

            this.canAddUrl = ko.computed((): bool => {
                return !this.urlsSpinner.isVisible() && this.editingUrl() === 0 && this.id !== 0;
            });

            // request URLs
            ko.computed((): void => {
                if (this.id)
                    this.requestUrls();

                else setTimeout(() => {
                    this.urlsSpinner.stop();
                    this.addUrl();
                }, 0);
            }).extend({ throttle: 1 });

            //#endregion
            //#region Location


            //#endregion
        }

        //#region Names

        // observables, computeds, & variables
        languages: KnockoutObservableArray = ko.observableArray(); // select options
        names: KnockoutObservableArray = ko.observableArray();
        editingName: KnockoutObservableNumber = ko.observable(0);
        canAddName: KnockoutComputed;
        namesMapping: any;

        // methods
        requestNames(callback?: (response?: IServerNameApiModel[]) => void ): void {
            this.namesSpinner.start();
            $.get(App.Routes.WebApi.EstablishmentNames.get(this.id))
                .done((response: IServerNameApiModel[]): void => {
                    this.receiveNames(response);
                    if (callback) callback(response);
                });
        }

        receiveNames(js: IServerNameApiModel[]): void {
            ko.mapping.fromJS(js || [], this.namesMapping, this.names);
            this.namesSpinner.stop();
            App.Obtruder.obtrude(document);
        }

        addName(): void {
            var apiModel = new ServerNameApiModel(this.id);
            if (this.names().length === 0)
                apiModel.isOfficialName = true;
            var newName = new Name(apiModel, this);
            this.names.unshift(newName);
            newName.showEditor();
            App.Obtruder.obtrude(document);
        }

        //#endregion
        //#region URLs

        // observables, computeds, & variables
        urls: KnockoutObservableArray = ko.observableArray();
        editingUrl: KnockoutObservableNumber = ko.observable(0);
        canAddUrl: KnockoutComputed;
        urlsMapping: any;

        // methods
        requestUrls(callback?: (response?: IServerUrlApiModel[]) => void ): void {
            this.urlsSpinner.start();
            $.get(App.Routes.WebApi.EstablishmentUrls.get(this.id))
                .done((response: IServerUrlApiModel[]): void => {
                    this.receiveUrls(response);
                    if (callback) callback(response);
                });
        }

        receiveUrls(js: IServerUrlApiModel[]): void {
            ko.mapping.fromJS(js || [], this.urlsMapping, this.urls);
            this.urlsSpinner.stop();
            App.Obtruder.obtrude(document);
        }

        addUrl(): void {
            var apiModel = new ServerUrlApiModel(this.id);
            if (this.urls().length === 0)
                apiModel.isOfficialUrl = true;
            var newUrl = new Url(apiModel, this);
            this.urls.unshift(newUrl);
            newUrl.showEditor();
            App.Obtruder.obtrude(document);
        }

        //#endregion
        //#region Location

        map: google.maps.Map;
        mapTools: App.GoogleMaps.ToolsOverlay;

        initMap(elementId: string): void {
            var center = new google.maps.LatLng(0, 0);
            var mapType = google.maps.MapTypeId.ROADMAP;
            var mapOptions: google.maps.MapOptions = {
                center: center,
                zoom: 1,
                mapTypeId: mapType
            };
            this.map = new google.maps.Map(document.getElementById(elementId), mapOptions);

            var toolsOptions = new App.GoogleMaps.ToolsOverlayOptions();
            $.get(App.Routes.WebApi.EstablishmentLocations.get(this.id))
                .done((response: IServerLocationApiModel): void => {
                    toolsOptions.markerLatLng = new google.maps.LatLng(
                        response.center.latitude, response.center.longitude);
                })
                .fail(() => {
                    toolsOptions.markerLatLng = undefined;
                })
                .always(() => {
                    google.maps.event.addListenerOnce(this.map, 'idle', () => {
                        this.mapTools = new App.GoogleMaps.ToolsOverlay(this.map, toolsOptions);
                    });
                });

        }

        //#endregion
    }
}
