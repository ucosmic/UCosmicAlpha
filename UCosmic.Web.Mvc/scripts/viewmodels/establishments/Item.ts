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
            this.countryCode.subscribe((newValue: string) => {
                // when this value is set before the countries menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.countries().length == 0)
                    this._countryCode = newValue; // stash the value to set it after menu loads

                // scope the menu to the selected country
                if (newValue && this.countries().length > 0 && !this._countryCode) {
                    var country: Places.IServerCountryApiModel;
                    for (var i = 0; i < this.countries().length; i++) {
                        if (this.countries()[i].code == newValue) country = this.countries()[i];
                    }
                    this.map.fitBounds(Places.Utils.convertToLatLngBounds(country.box));
                }

                if (newValue && this.countries().length > 0)
                    this._countryCode = undefined; // unstash the value when the menu has reloaded
            });
            ko.computed((): void => {
                $.get(App.Routes.WebApi.Countries.get())
                .done((response: Places.IServerCountryApiModel[]): void => {
                    this.countries(response);
                    if (this._countryCode)
                        this.countryCode(this._countryCode);
                });
            })
            .extend({ throttle: 1 });

            this.displayPlaces = ko.computed((): Places.IServerApiModel[]=> {
                var displayPlaces = new Array();
                for (var i = 0; i < this.places().length; i++) {
                    var place = this.places()[i];
                    if (!place.isEarth) displayPlaces[displayPlaces.length] = place;
                }
                return displayPlaces;
            });
            this.hasPlaces = ko.computed((): bool => {
                return this.displayPlaces() && this.displayPlaces().length > 0;
            });

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
        private _countryCode: string;
        places: KnockoutObservablePlaceModelArray = ko.observableArray();
        hasPlaces: KnockoutComputed;
        displayPlaces: KnockoutComputed;

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

            if (this.id)
                $.get(App.Routes.WebApi.Establishments.Locations.get(this.id))
                .done((response: IServerLocationApiModel): void => {
                    gm.event.addListenerOnce(this.map, 'idle', (): void => {

                        // zoom map to reveal location
                        if (response.googleMapZoomLevel)
                            this.map.setZoom(response.googleMapZoomLevel);
                        else if (response.box.hasValue)
                            this.map.fitBounds(Places.Utils.convertToLatLngBounds(response.box));

                        // place marker and set map center
                        if (response.center.hasValue) {
                            var latLng = Places.Utils.convertToLatLng(response.center);
                            this.mapTools().placeMarker(latLng);
                            this.map.setCenter(latLng);
                        }
                    });

                    // make places array observable
                    this.places(response.places);

                    // populate country menu
                    var country: Places.IServerApiModel = Places.Utils.getCountry(response.places);
                    if (country) this.countryCode(country.countryCode);
                })
        }

        //#endregion
    }
}
