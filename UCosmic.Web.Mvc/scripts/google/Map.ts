module App.GoogleMaps { // TODO: rename to App.Google to keep in line with google visualization stuff

    export interface MapSettings {
        autoCreate?: boolean;
        maxPrecision?: number;
        log?: boolean;
    }

    export interface MapViewportSettings {
        center?: google.maps.LatLng;
        zoom?: number;
        bounds?: google.maps.LatLngBounds;
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

            // stash the settings and options
            this._options = options || {};
            this._settings = settings || {};

            this._log('Constructing google map wrapper instance.');

            // did we get an element or an element id?
            if (typeof elementOrId === 'string') {
                this._element = document.getElementById(elementOrId);
            }
            else {
                this._element = elementOrId;
            }

            this._log('Set map canvas element, id is "{0}".', $(this._element).attr('id'));

            // initialize observables
            this.zoom = ko.observable(this._options.zoom || this._options.zoom == 0
                ? this._options.zoom : 1);
            this.lat = ko.observable(this._options.center
                ? Map._reducePrecision(this._options.center.lat(), this._settings.maxPrecision)
                : Map.defaultCenter.lat());
            this.lng = ko.observable(this._options.center
                ? Map._reducePrecision(this._options.center.lng(), this._settings.maxPrecision)
                : Map.defaultCenter.lng());

            this.lng.subscribe((newValue: number): void => {
                if (newValue) {
                }
            });

            this._log('Zoom initialized to {0}.', this.zoom());
            this._log('Latitude initialized to {0}.', this.lat());
            this._log('Longitude initialized to {0}.', this.lng());

            // automatically create() the map by default, only skip if autoCreate == false.
            if (typeof this._settings.autoCreate === 'undefined' || this._settings.autoCreate) {
                this._log('Eagerly readying the google map instance.');
                this.ready();
            }

            this._log('Completed Construction of google map wrapper instance.');
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
                    this._log('Fired map idle event #0.')
                    this._listenForCenterChange();
                    this._listenForZoomChange();
                    this._listenForBoundsChange();
                    this._listenForDragging();
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

        setViewport(settings: MapViewportSettings): JQueryPromise<void> {

            var isDirty = false;

            // set zoom if it is present and not current value
            var zoom = this.map.getZoom();
            if (Map.isValidZoom(settings.zoom) && settings.zoom != zoom) {
                this.map.setZoom(settings.zoom);
                isDirty = true;
            }

            // set center if it is present and not current value
            var center = this.map.getCenter();
            if (settings.center && !Map.areCentersEqual(center, settings.center, this._settings.maxPrecision)) {
                this.map.setCenter(settings.center);
                isDirty = true;
            }

            // set bounds if present, not empty, and not current value
            var bounds = this.map.getBounds();
            if (settings.bounds && !Map.isEmptyBounds(settings.bounds) &&
                !Map.areBoundsEqual(bounds, settings.bounds)) {

                this.map.fitBounds(settings.bounds);
                isDirty = true;
            }

            var promise = $.Deferred();
            if (isDirty) {
                google.maps.event.addListenerOnce(this.map, 'idle', (): void => {
                    promise.resolve();
                });
            }
            else {
                promise.resolve();
            }
            return promise;
        }

        //#region Idle

        // initial values for lat & lng are based on the options used to create the map
        idles: KnockoutObservable<number> = ko.observable(0);
        private _idleCallbacks: { (): void; }[] = [];

        onIdle(callback: () => void): void {
            this._idleCallbacks.push(callback);
        }

        private _idled(): void {
            var idles = this.idles();
            this.idles(++idles);
        }

        private _listenForIdled(): void {
            google.maps.event.addListener(this.map, 'idle', (): void => {
                this._idled();
                $.each(this._idleCallbacks, function (i: number, callback: () => void): void {
                    callback();
                });
                this._log('Fired map idle event #{0}.', this.idles());
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
                //this._log('Firing map zoom_changed event.');
                this._zoomChanged();
                this._log('Fired map zoom_changed event.');
            })
        }

        static isValidZoom(zoom: number): boolean {
            return typeof zoom !== 'undefined'
                && !isNaN(zoom) && zoom >= 0;
        }

        //#endregion
        //#region Center (Latitude & Longitude)

        // initial values for lat & lng are based on the options used to create the map
        lat: KnockoutObservable<number>;
        lng: KnockoutObservable<number>;

        private _centerChanged(): void {
            var center = this.map.getCenter();
            this.lat(Map._reducePrecision(center.lat(), this._settings.maxPrecision));
            this.lng(Map._reducePrecision(center.lng(), this._settings.maxPrecision));
        }

        private _listenForCenterChange(): void {
            google.maps.event.addListener(this.map, 'center_changed', (): void => {
                //this._log('Firing map center_changed event.');
                this._centerChanged();
                this._log('Fired map center_changed event.');
            })
        }

        static areCentersEqual(center1: google.maps.LatLng, center2: google.maps.LatLng, precision: number): boolean {
            return Map.areNumbersEqualy(center1.lat(), center2.lat(), precision)
                && Map.areNumbersEqualy(center1.lng(), center2.lng(), precision);
        }

        //39.24683949
        //39.2468395
        static areNumbersEqualy(coordinate1: number, coordinate2: number, preceision: number): boolean {
            coordinate1 = Map._reducePrecision(coordinate1, preceision);
            coordinate2 = Map._reducePrecision(coordinate2, preceision);
            return coordinate1 - coordinate2 == 0;
        }

        //#endregion
        //#region Bounds (North East Soutn West)

        north = ko.observable<number>();
        south = ko.observable<number>();
        east = ko.observable<number>();
        west = ko.observable<number>();

        private _boundsChanged(): void {
            var bounds = this.map.getBounds();
            var northEast = bounds.getNorthEast();
            var southWest = bounds.getSouthWest();
            this.north(Map._reducePrecision(northEast.lat(), this._settings.maxPrecision));
            this.east(Map._reducePrecision(northEast.lng(), this._settings.maxPrecision));
            this.south(Map._reducePrecision(southWest.lat(), this._settings.maxPrecision));
            this.west(Map._reducePrecision(southWest.lng(), this._settings.maxPrecision));
        }

        private _listenForBoundsChange(): void {
            google.maps.event.addListener(this.map, 'bounds_changed', (): void => {
                //this._log('Firing map bounds_changed event.');
                this._boundsChanged();
                this._log('Fired map bounds_changed event.');
            })
        }

        static emptyBounds = new google.maps.LatLngBounds(new google.maps.LatLng(1, 180),
            new google.maps.LatLng(-1, -180));

        static isEmptyBounds(bounds: google.maps.LatLngBounds): boolean {
            return Map.areBoundsEqual(bounds, Map.emptyBounds);
        }

        static areBoundsEqual(bounds1: google.maps.LatLngBounds, bounds2: google.maps.LatLngBounds): boolean {
            var ne1 = bounds1.getNorthEast();
            var ne2 = bounds2.getNorthEast();
            var sw1 = bounds1.getSouthWest();
            var sw2 = bounds2.getSouthWest();
            return ne1.lat() == ne2.lat() && ne1.lng() == ne2.lng()
                && sw1.lat() == sw2.lat() && sw1.lng() == sw2.lng();
        }

        //#endregion
        //#region Drag

        isDragging: KnockoutObservable<boolean> = ko.observable(false);

        private _draggingChanged(isDragging: boolean): void {
            this.isDragging(isDragging);
        }

        private _listenForDragging(): void {
            google.maps.event.addListener(this.map, 'dragstart', (): void => {
                //this._log('Firing map dragstart event.');
                this._draggingChanged(true);
                this._log('Fired map dragstart event.');
            })
            google.maps.event.addListener(this.map, 'dragend', (): void => {
                //this._log('Firing map dragend event.');
                this._draggingChanged(false);
                this._log('Fired map dragend event.');
            })
        }

        //#endregion

        //#endregion
        //#region Markers

        markers = ko.observableArray<google.maps.Marker>([]);

        addMarker(options: google.maps.MarkerOptions): google.maps.Marker {
            options.map = this.map;
            var marker = new google.maps.Marker(options);
            this.markers.push(marker);
            return marker;
        }

        clearMarkers(destroy: boolean = true): google.maps.Marker[] {
            var markers = this.markers().slice(0);
            $.each(markers, (i: number, marker: google.maps.Marker): void => {
                marker.setMap(null);
                if (destroy) marker = null;
            });
            this.markers([]);
            return markers;
        }

        replaceMarkers(markers: google.maps.Marker[], destroy: boolean = true): google.maps.Marker[] {
            var removed = this.clearMarkers(destroy);
            $.each(markers, (i: number, marker: google.maps.Marker): void => {
                marker.setMap(this.map);
                this.markers.push(marker);
            });
            return removed;
        }

        //#endregion
        //#region InfoWindows

        infoWindows = ko.observableArray<google.maps.InfoWindow>([]);

        openInfoWindowAtMarker(options: google.maps.InfoWindowOptions, marker: google.maps.Marker): google.maps.InfoWindow {
            var infoWindow = new google.maps.InfoWindow(options);
            this.infoWindows.push(infoWindow);
            infoWindow.open(this.map, marker);
            return infoWindow;
        }

        clearInfoWindows(): google.maps.InfoWindow[] {
            var infoWindows = this.infoWindows().slice(0);
            $.each(infoWindows, (i: number, infoWindow: google.maps.InfoWindow): void => {
                infoWindow.close();
                infoWindow = null;
            });
            this.infoWindows([]);
            return infoWindows;
        }

        closeInfoWindows(): void {
            var infoWindows = this.infoWindows();
            $.each(infoWindows, (i: number, infoWindow: google.maps.InfoWindow): void => {
                infoWindow.close();
            });
        }

        //replaceInfoWindows(infoWindows: google.maps.InfoWindow[]): google.maps.InfoWindow[] {
        //    var removed = this.removeInfoWindows();
        //    $.each(infoWindows, (i: number, infoWindow: google.maps.InfoWindow): void => {
        //        this.openInfoWindow(infoWindow);
        //    });
        //    return removed;
        //}

        //#endregion
        //#region Helpers

        triggerResize(): JQueryPromise<void> {
            var promise = $.Deferred();
            google.maps.event.trigger(this.map, 'resize');
            google.maps.event.addListenerOnce(this.map, 'idle', (): void => {
                promise.resolve();
            });
            return promise;
        }

        private static _reducePrecision(value: number, precision: number = 0): number {
            var reduced = value;
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

        private _log(message: string, ...args: any[]): void {
            if (!this._settings.log || !console) return;
            console.log('MapWrapper: ' + message.format(args));
        }

        //#endregion
    }
}