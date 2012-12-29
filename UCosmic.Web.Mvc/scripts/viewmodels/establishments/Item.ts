/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../google/google.maps.d.ts" />
/// <reference path="../../google/ToolsOverlay.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="../languages/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />


module ViewModels.Establishments {

    import gm = google.maps

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

            this.toolsMarkerLat = ko.computed((): number => {
                return this.mapTools() && this.mapTools().markerLatLng()
                    ? this.mapTools().markerLatLng().lat() : null;
            });
            this.toolsMarkerLng = ko.computed((): number => {
                return this.mapTools() && this.mapTools().markerLatLng()
                    ? this.mapTools().markerLatLng().lng() : null;
            });
            this.$mapCanvas.subscribe((newValue: JQuery): void => {
                if (!this.map) this.initMap();
            });

            // countries dropdown
            ko.computed((): void => {
                $.get(App.Routes.WebApi.Countries.get())
                .done((response: Places.IServerCountryApiModel[]): void => {
                    this.countries(response);
                });
            })
            .extend({ throttle: 1 });

            //#endregion
        }

        //#region Names

        // observables, computeds, & variables
        languages: KnockoutObservableLanguageModelArray = ko.observableArray(); // select options
        names: KnockoutObservableEstablishmentNameModelArray = ko.observableArray();
        editingName: KnockoutObservableNumber = ko.observable(0);
        canAddName: KnockoutComputed;
        namesMapping: any;

        // methods
        requestNames(callback?: (response?: IServerNameApiModel[]) => void ): void {
            this.namesSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Names.get(this.id))
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
        urls: KnockoutObservableEstablishmentUrlModelArray = ko.observableArray();
        editingUrl: KnockoutObservableNumber = ko.observable(0);
        canAddUrl: KnockoutComputed;
        urlsMapping: any;

        // methods
        requestUrls(callback?: (response?: IServerUrlApiModel[]) => void ): void {
            this.urlsSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Urls.get(this.id))
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
        mapTools: KnockoutObservableGoogleMapsToolsOverlay = ko.observable();
        toolsMarkerLat: KnockoutComputed;
        toolsMarkerLng: KnockoutComputed;
        $mapCanvas: KnockoutObservableJQuery = ko.observable();
        countries: KnockoutObservableCountryModelArray = ko.observableArray();
        countryCode: KnockoutObservableString = ko.observable();

        initMap(): void {
            var mapOptions: gm.MapOptions = {
                mapTypeId: gm.MapTypeId.ROADMAP,
                center: new gm.LatLng(0, 0),
                zoom: 1,
                draggable: true,
                scrollwheel: false
            };
            this.map = new gm.Map(this.$mapCanvas()[0], mapOptions);
            gm.event.addListenerOnce(this.map, 'idle', (): void => {
                this.mapTools(new App.GoogleMaps.ToolsOverlay(this.map));
            });

            $.get(App.Routes.WebApi.Establishments.Locations.get(this.id))
                .done((response: IServerLocationApiModel): void => {
                    gm.event.addListenerOnce(this.map, 'idle', (): void => {
                        if (response.googleMapZoomLevel) {
                            this.map.setZoom(response.googleMapZoomLevel);
                        }
                        else if (response.box.hasValue) {
                            var ne = new gm.LatLng(response.box.northEast.latitude,
                                response.box.northEast.longitude);
                            var sw = new gm.LatLng(response.box.southWest.latitude,
                                response.box.southWest.longitude);
                            this.map.fitBounds(new gm.LatLngBounds(sw, ne));
                        }
                        if (response.center.hasValue) {
                            var latLng = new gm.LatLng(response.center.latitude,
                                response.center.longitude)
                            this.mapTools().placeMarker(latLng);
                            this.map.setCenter(latLng);
                        }
                    });
                })
        }

        //#endregion
    }
}
