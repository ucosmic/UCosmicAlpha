/// <reference path="../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

module App.GoogleMaps {

    export interface MapSettings {
        autoCreate?: boolean;
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

            // automatically create() the map by default, only skip if autoCreate == false.
            if (typeof this._settings.autoCreate === 'undefined' || this._settings.autoCreate) {
                this.create();
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
        // This kind if initialization is encapsulated in this class with 2
        // components, the 'created' property and the 'create()' method.
        // Basically, 'created' is a jQuery deferred that does not resolve until
        // after the map has been created and become idle. So you can use
        // the 'created' property as a promise that the map has been created
        // and become idle after the 'create()' method is invoked.
        // Also, clients only need to call the 'create()' method if they specify 
        // autoCreate: false in this class' constructor. The constructor
        // invokes this method by default when autoCreate is not in the settings.

        map: google.maps.Map;
        created: JQueryDeferred<void> = $.Deferred();
        create(): JQueryDeferred<void> {
            this.created = $.Deferred();
            if (!this.map) {
                // first set up the options
                var options = this._options;

                // center and zoom are required
                if (!options.center) options.center = Map.defaultCenter;
                if (!options.zoom) options.zoom = 1;

                // default scrollwheel to false if not specified
                if (!options.scrollwheel) options.scrollwheel = false;

                // construct the map to kick off initialization
                this.map = new google.maps.Map(this._element, options);

                // listen for the map to become idle before resolving the promize
                google.maps.event.addListenerOnce(this.map, 'idle', (): void => {
                    this._listenForCenterChange();
                    this._listenForZoomChange();
                    this._listenForBoundsChange();
                    this.created.resolve();
                });
            }
            else {
                this.created.resolve();
            }
            return this.created;
        }

        //#endregion
        //#region Viewport Properties & Events

        //#region Center (Latitude & Longitude)

        // initial values for lat & lng are based on the options used to create the map
        lat: KnockoutObservable<number> = ko.observable(
            this._options.center ? this._options.center.lat() : Map.defaultCenter.lat());
        lng: KnockoutObservable<number> = ko.observable(
            this._options.center ? this._options.center.lng() : Map.defaultCenter.lng());

        private _centerChanged(): void {
            var center = this.map.getCenter();
            this.lat(center.lat());
            this.lng(center.lng());
        }

        private _listenForCenterChange(): void {
            google.maps.event.addListener(this.map, 'center_changed', (): void => {
                this._centerChanged();
            })
        }

        //#endregion
        //#region Zoom

        // initial values for lat & lng are based on the options used to create the map
        zoom: KnockoutObservable<number> = ko.observable(
            this._options.zoom || this._options.zoom == 0 ? this._options.zoom : 1);

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
        //#region Bounds (North East Soutn West)

        // initial values for lat & lng are based on the options used to create the map
        north: KnockoutObservable<number> = ko.observable();
        south: KnockoutObservable<number> = ko.observable();
        east: KnockoutObservable<number> = ko.observable();
        west: KnockoutObservable<number> = ko.observable();

        private _boundsChanged(): void {
            var bounds = this.map.getBounds();
            var northEast = bounds.getNorthEast();
            var southWest = bounds.getSouthWest();
            this.north(northEast.lat());
            this.east(northEast.lng());
            this.south(southWest.lat());
            this.west(southWest.lng());
        }

        private _listenForBoundsChange(): void {
            google.maps.event.addListener(this.map, 'bounds_changed', (): void => {
                this._centerChanged();
            })
        }

        //#endregion

        //#endregion
    }
}