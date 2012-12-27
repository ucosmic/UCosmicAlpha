var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var App;
(function (App) {
    (function (GoogleMaps) {
        var ToolsOverlayOptions = (function () {
            function ToolsOverlayOptions() {
                this.position = google.maps.ControlPosition.TOP_LEFT;
                this.elementId = 'map_tools';
                this.markerLatLng = undefined;
            }
            return ToolsOverlayOptions;
        })();
        GoogleMaps.ToolsOverlayOptions = ToolsOverlayOptions;        
        var ToolsOverlay = (function (_super) {
            __extends(ToolsOverlay, _super);
            function ToolsOverlay(map, options) {
                if (typeof options === "undefined") { options = new ToolsOverlayOptions(); }
                        _super.call(this);
                this.map = map;
                this.setMap(this.map);
                this.position = options.position;
                this.elementId = options.elementId;
                this.$element = $('#' + this.elementId);
                this.element = this.$element[0];
                this.markerLatLng = options.markerLatLng;
                this.init();
            }
            ToolsOverlay.prototype.draw = function () {
            };
            ToolsOverlay.prototype.init = function () {
                this.map.controls[this.position].push(this.element);
                if(this.markerLatLng) {
                    this.$element.find('.marker img.ready-icon').hide();
                } else {
                    this.$element.find('.marker img.pushed-icon').hide();
                }
                this.$element.show();
            };
            return ToolsOverlay;
        })(google.maps.OverlayView);
        GoogleMaps.ToolsOverlay = ToolsOverlay;        
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;

})(App || (App = {}));

