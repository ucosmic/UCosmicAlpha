/// <reference path="../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

module App.GoogleMaps {

    export interface MapSettings {
        autoCreate?: boolean;
        maxPrecision?: number;
    }

    export class Map {
        //#region Static Properties

        static defaultCenter: google.maps.LatLng = new google.maps.LatLng(0, 0);

        //#endregion
        //#region Construction

        // Instance can be constructed by passing either
        // 1.) the dom element that the map should bind to, or
        // 2.) the id of the dom element that the map should bind to.
        // When using elementId, do not pass it as if it was a jQuery selector.
        // For example given an element with id="map_canvas", you would construct
        // the map using 'map_canvas', not '#map_canvas'.
        // This is because construction uses document.getElementById, which does
        // not use CSS syntax.

        constructor(element: Element, options: google.maps.MapOptions, settings?: MapSettings);
        constructor(elementId: string, options: google.maps.MapOptions, settings?: MapSettings);
        constructor(elementOrId: any, options: google.maps.MapOptions, settings?: MapSettings) {
            // did we get an element or an element id?
            if (typeof elementOrId === 'string') {
                this._element = document.getElementById(elementOrId);
            }
            else {
                this._element = elementOrId;
            }

            // stash the settings and options
            this._options = options || {};
            this._settings = settings || {};

            // initialize observables
            this.zoom = ko.observable(this._options.zoom || this._options.zoom == 0
                ? this._options.zoom : 1);
            this.lat = ko.observable(this._options.center
                ? this._reducePrecision(this._options.center.lat())
                : Map.defaultCenter.lat());
            this.lng = ko.observable(this._options.center
                ? this._reducePrecision(this._options.center.lng())
                : Map.defaultCenter.lng());

            // automatically create() the map by default, only skip if autoCreate == false.
            if (typeof this._settings.autoCreate === 'undefined' || this._settings.autoCreate) {
                this.ready();
            }
        }

        private _element: Element;
        private _options: google.maps.MapOptions;
        private _settings: MapSettings;

        //#endregion
        //#region Initialization

        // Before you can use a google map, it must be created.
        // However you must also wait until after the map becomes 'idle'
        // before you can do anything useful with it, like panning or zooming.
        // This kind if initialization is encapsulated in this class
        // by the ready() method. This method returns a jQuery promise
        // that only resolves after the map has been created and then fired
        // its first idle event. Clients should work with instances of this object
        // by treating it asynchronously via the ready() method promise.

        map: google.maps.Map;
        private _promise = $.Deferred();
        ready(): JQueryPromise<void> {
            // if the map does not yet exist, construct it and set
            // up a promise for its first idle event.
            if (!this.map) {
                this._create();
                // listen for the map to become idle before resolving the promise
                google.maps.event.addListenerOnce(this.map, 'idle', (): void => {
                    this._listenForCenterChange();
                    this._listenForZoomChange();
                    this._listenForBoundsChange();
                    this._listenForIdled();
                    this._boundsChanged();
                    this._promise.resolve();
                });
            }
            return this._promise;
        }
        private _create(): void {
            // first set up the options
            var options = this._options;

            // center, zoom, and mapTypeId are required
            if (!options.center) options.center = Map.defaultCenter;
            if (!options.zoom) options.zoom = 1;
            if (!options.mapTypeId) options.mapTypeId = google.maps.MapTypeId.ROADMAP;

            // default scrollwheel to false if not specified
            if (!options.scrollwheel) options.scrollwheel = false;

            // construct the map to kick off initialization
            this.map = new google.maps.Map(this._element, options);
        }

        //#endregion
        //#region Viewport Properties & Events

        //#region Idle

        // initial values for lat & lng are based on the options used to create the map
        idles: KnockoutObservable<number> = ko.observable(0);

        private _idled(): void {
            var idles = this.idles();
            this.idles(++idles);
        }

        private _listenForIdled(): void {
            google.maps.event.addListener(this.map, 'idle', (): void => {
                this._idled();
            })
        }

        //#endregion
        //#region Zoom

        // initial value for zoom based on the options used to create the map
        zoom: KnockoutObservable<number>;

        private _zoomChanged(): void {
            var zoom = this.map.getZoom();
            this.zoom(zoom);
        }

        private _listenForZoomChange(): void {
            google.maps.event.addListener(this.map, 'zoom_changed', (): void => {
                this._zoomChanged();
            })
        }

        //#endregion
        //#region Center (Latitude & Longitude)

        // initial values for lat & lng are based on the options used to create the map
        lat: KnockoutObservable<number>;
        lng: KnockoutObservable<number>;

        private _centerChanged(): void {
            var center = this.map.getCenter();
            this.lat(this._reducePrecision(center.lat()));
            this.lng(this._reducePrecision(center.lng()));
        }

        private _listenForCenterChange(): void {
            google.maps.event.addListener(this.map, 'center_changed', (): void => {
                this._centerChanged();
            })
        }

        //#endregion
        //#region Bounds (North East Soutn West)

        north: KnockoutObservable<number> = ko.observable();
        south: KnockoutObservable<number> = ko.observable();
        east: KnockoutObservable<number> = ko.observable();
        west: KnockoutObservable<number> = ko.observable();

        private _boundsChanged(): void {
            var bounds = this.map.getBounds();
            var northEast = bounds.getNorthEast();
            var southWest = bounds.getSouthWest();
            this.north(this._reducePrecision(northEast.lat()));
            this.east(this._reducePrecision(northEast.lng()));
            this.south(this._reducePrecision(southWest.lat()));
            this.west(this._reducePrecision(southWest.lng()));
        }

        private _listenForBoundsChange(): void {
            google.maps.event.addListener(this.map, 'bounds_changed', (): void => {
                this._boundsChanged();
            })
        }

        //#endregion

        //#endregion
        //#region Helpful Shortcuts

        triggerResize(): void {
            google.maps.event.trigger(this.map, 'resize');
        }

        private _reducePrecision(value: number): number {
            var reduced = value;
            var precision = this._settings.maxPrecision;
            if (precision) {
                var text = value.toString();
                var decimal = text.indexOf('.');
                if (decimal >= 0) {
                    var fraction = text.substr(decimal, precision + 1);
                    text = text.substr(0, decimal) + fraction;
                    reduced = parseFloat(text);
                }
            }
            return reduced;
        }

        //#endregion
    }
}