/// <reference path="google.maps.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />

module App.GoogleMaps {

    export class ToolsOverlayOptions {
        position: google.maps.ControlPosition = google.maps.ControlPosition.TOP_LEFT;
        elementId: string = 'map_tools';
        markerLatLng: google.maps.LatLng = undefined;
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

            // add click handlers to the marker buttons
            this.$markerReadyButton.on('click', this,
                (e: JQueryEventObject) => { this.createMarker(e); });
            this.$markerPushedButton.on('click', this,
                (e: JQueryEventObject) => { this.destroyMarker(e); });

            this.$element.show(); // unhide the tools element
        }

        private getCreatedMarkerLatLng(): google.maps.LatLng {
            var pointX = this.$element.position().left + (this.$element.outerWidth() / 2);
            var pointY = this.$element.outerHeight();
            var point = new google.maps.Point(pointX, pointY);
            var projection = this.getProjection();
            return projection.fromContainerPixelToLatLng(point);
        }

        private $markerReadyButton: JQuery;
        private $markerPushedButton: JQuery;
        private marker: google.maps.Marker;
        private markerMoveListener: google.maps.MapsEventListener;
        private markerDropListener: google.maps.MapsEventListener;

        private putMarker(latLng: google.maps.LatLng): void {

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
                this.marker.setMap(undefined);
                var overlayView = new google.maps.OverlayView();
                overlayView.setMap(this.map);
                var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);
                pixels.y += 43; // Y offset
                e.latLng = overlayView.getProjection().fromContainerPixelToLatLng(pixels);
                this.putMarker(e.latLng);
                $(this.map.getDiv()).trigger('marker_created', this);
            });
        }

        private destroyMarker(e: JQueryEventObject) {
            alert('clicked destroy');
        }
    }

}
