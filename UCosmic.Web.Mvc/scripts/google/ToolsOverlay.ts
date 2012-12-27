/// <reference path="google.maps.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />

module App.GoogleMaps {

    export class ToolsOverlayOptions {
        position: google.maps.ControlPosition = google.maps.ControlPosition.TOP_LEFT;
        elementId: string = 'map_tools';
    }

    export class ToolsOverlay extends google.maps.OverlayView {

        map: google.maps.Map;
        position: google.maps.ControlPosition;
        elementId: string;
        element: Element;
        $element: JQuery;

        constructor (map: google.maps.Map, 
            options?: ToolsOverlayOptions = new ToolsOverlayOptions()) {
            super();
            
            this.map = map;
            this.setMap(this.map);

            this.position = options.position;
            this.elementId = options.elementId;
            this.$element = $('#' + this.elementId);

            this.element = document.getElementById(this.elementId);

            this.init();
        }

        draw() { }
        init() {
            this.map.controls[this.position].push(this.element);
        }
    }

}
