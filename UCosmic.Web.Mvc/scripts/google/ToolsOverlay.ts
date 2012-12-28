/// <reference path="google.maps.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../ko/knockout-2.2.d.ts" />

module App.GoogleMaps {

    export class ToolsOverlayOptions {
        position: google.maps.ControlPosition = google.maps.ControlPosition.TOP_LEFT;
        elementId: string = 'map_tools';
        markerLatLng: google.maps.LatLng = undefined;
        markerLatObservable: KnockoutObservableNumber;
        markerLngObservable: KnockoutObservableNumber;
    }

    export class ToolsOverlay extends google.maps.OverlayView {

        map: google.maps.Map;
        position: google.maps.ControlPosition;
        elementId: string;
        element: Element;
        $element: JQuery;
        markerLatLng: google.maps.LatLng;

        constructor (map: google.maps.Map,
            options?: ToolsOverlayOptions = new ToolsOverlayOptions()) {
            super();

            this.map = map;
            this.setMap(this.map);

            this.position = options.position;
            this.elementId = options.elementId;
            this.$element = $('#' + this.elementId);
            this.element = this.$element[0];

            this.markerLatLng = options.markerLatLng;
            this.markerLat = options.markerLatObservable || ko.observable();
            this.markerLng = options.markerLngObservable || ko.observable();
            this.updateMarkerLatLng(this.markerLatLng);
            this.$markerReadyButton = this.$element.find('.marker img.ready-icon');
            this.$markerPushedButton = this.$element.find('.marker img.pushed-icon');

            this.init();
        }

        draw(): void { }

        private init(): void {
            // render the tools element on the map canvas
            this.map.controls[this.position].push(this.element);

            // display the correct marker button
            if (this.markerLatLng) this.$markerReadyButton.hide();
            else this.$markerPushedButton.hide();

            // place marker if it already exists
            if (this.markerLatLng) this.putMarker(this.markerLatLng);

            // add click handlers to the marker buttons
            this.$markerReadyButton.on('click', this,
                (e: JQueryEventObject) => { this.createMarker(e); });
            this.$markerPushedButton.on('click', this,
                (e: JQueryEventObject) => { this.removeMarker(e); });

            this.$element.show(); // unhide the tools element
        }

        private marker: google.maps.Marker;
        markerLat: KnockoutObservableNumber;
        markerLng: KnockoutObservableNumber;
        private $markerReadyButton: JQuery;
        private $markerPushedButton: JQuery;
        private $destroyMarkerConfirmDialog;
        private markerMoveListener: google.maps.MapsEventListener;
        private markerDropListener: google.maps.MapsEventListener;

        private updateMarkerLatLng(latLng: google.maps.LatLng): void {
            if (latLng) {
                this.markerLat(latLng.lat());
                this.markerLng(latLng.lng());
            }
        }

        private getCreatedMarkerLatLng(): google.maps.LatLng {
            var pointX = this.$element.position().left + (this.$element.outerWidth() / 2);
            var pointY = this.$element.outerHeight();
            var point = new google.maps.Point(pointX, pointY);
            var projection = this.getProjection();
            return projection.fromContainerPixelToLatLng(point);
        }

        private putMarker(latLng: google.maps.LatLng): void {
            this.marker = new google.maps.Marker({
                map: this.map,
                position: latLng,
                draggable: true
            });
            this.updateMarkerLatLng(latLng);

            google.maps.event.addListener(this.marker, 'dragstart', (e: google.maps.MouseEvent): void => {
                this.updateMarkerLatLng(e.latLng);
                $(this.map.getDiv()).trigger('marker_dragstart', this);
            });
            google.maps.event.addListener(this.marker, 'drag', (e: google.maps.MouseEvent): void => {
                this.updateMarkerLatLng(e.latLng);
                $(this.map.getDiv()).trigger('marker_drag', this);
            });
            google.maps.event.addListener(this.marker, 'dragend', (e: google.maps.MouseEvent): void => {
                this.updateMarkerLatLng(e.latLng);
                $(this.map.getDiv()).trigger('marker_dragend', this);
            });
        }

        private createMarker(e: JQueryEventObject): void {
            this.$markerReadyButton.hide();
            this.$markerPushedButton.show();
            this.map.setOptions({ draggableCursor: 'pointer' });
            this.marker = new google.maps.Marker({
                map: this.map,
                position: this.getCreatedMarkerLatLng(),
                cursor: 'pointer',
                clickable: false,
                icon: new google.maps.MarkerImage('/styles/icons/maps/tools-marker-new.png',
                    new google.maps.Size(52, 61),
                    new google.maps.Point(0, 0), // origin
                    new google.maps.Point(10, 10) // anchor
                )
            });
            this.markerMoveListener = google.maps.event.addListener(this.map, 'mousemove', (e: google.maps.MouseEvent): void => {
                this.marker.setPosition(e.latLng);
            });
            this.markerDropListener = google.maps.event.addListenerOnce(this.map, 'click', (e: google.maps.MouseEvent): void => {
                google.maps.event.removeListener(this.markerMoveListener);
                this.map.setOptions({ draggableCursor: undefined });
                this.marker.setMap(null);
                var overlayView = new google.maps.OverlayView();
                overlayView.draw = function () { };
                overlayView.setMap(this.map);
                var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);
                pixels.y += 43; // Y offset
                e.latLng = overlayView.getProjection().fromContainerPixelToLatLng(pixels);
                this.putMarker(e.latLng);
                $(this.map.getDiv()).trigger('marker_created', this);
            });
        }

        private removeMarker(e: JQueryEventObject) {
            if (!this.$destroyMarkerConfirmDialog)
                this.$destroyMarkerConfirmDialog = this.$element.find('.confirm-destroy-marker-dialog');
            if (this.$destroyMarkerConfirmDialog.length) {
                this.$destroyMarkerConfirmDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm removal',
                            click: (): void => {
                                this.$destroyMarkerConfirmDialog.dialog('close');
                                this.destroyMarker();
                            }
                        },
                        {
                            text: 'No, do not remove',
                            click: (): void => {
                                this.$destroyMarkerConfirmDialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            }
            else if (confirm('Are you sure you want to remove this placemark?')) {
                this.destroyMarker();
            }
        }

        private destroyMarker(): void {
            this.$markerPushedButton.hide();
            this.$markerReadyButton.show();
            this.map.setOptions({ draggableCursor: undefined });
            if (this.markerMoveListener) {
                google.maps.event.removeListener(this.markerMoveListener);
                this.markerMoveListener = undefined;
            }
            if (this.markerDropListener) {
                google.maps.event.removeListener(this.markerDropListener);
                this.markerDropListener = undefined;
            }
            google.maps.event.clearInstanceListeners(this.marker);
            this.marker.setMap(null);
            this.marker = undefined;
            this.markerLat(null);
            this.markerLng(null);
            $(this.map.getDiv()).trigger('marker_destroyed', this);
        }
    }

}
