/// <reference path="google.maps.d.ts" />

//module App.GoogleMaps {
    class ToolsOverlay extends google.maps.OverlayView {

        owner: any;
        map: google.maps.Map;
        element: Element;

        constructor (map: google.maps.Map) {
            super();
            this.map = map;
            this.setMap(this.map);
            this.init();
        }

        draw() { }
        init() {
            alert('inited');
        }
    }

//}
