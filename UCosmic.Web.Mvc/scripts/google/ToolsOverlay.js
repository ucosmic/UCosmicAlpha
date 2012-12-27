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
                this.element = document.getElementById(this.elementId);
                this.init();
            }
            ToolsOverlay.prototype.draw = function () {
            };
            ToolsOverlay.prototype.init = function () {
                this.map.controls[this.position].push(this.element);
            };
            return ToolsOverlay;
        })(google.maps.OverlayView);
        GoogleMaps.ToolsOverlay = ToolsOverlay;        
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;

})(App || (App = {}));

