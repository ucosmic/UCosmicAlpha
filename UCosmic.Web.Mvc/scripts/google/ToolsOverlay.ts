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

            this.init();
        }

        draw() { }
        init() {
            // render the tools element on the map canvas
            this.map.controls[this.position].push(this.element);

            // display the correct marker icon
            if (this.markerLatLng) {
                this.$element.find('.marker img.ready-icon').hide();
            }
            else {
                this.$element.find('.marker img.pushed-icon').hide();
            }

            this.$element.show(); // unhide the tools element
        }
    }

}
