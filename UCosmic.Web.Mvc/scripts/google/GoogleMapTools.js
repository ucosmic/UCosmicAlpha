var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var ToolsOverlay = (function (_super) {
    __extends(ToolsOverlay, _super);
    function ToolsOverlay(map) {
        _super.call(this);
        this.map = map;
        this.setMap(this.map);
        this.init();
    }
    ToolsOverlay.prototype.draw = function () {
    };
    ToolsOverlay.prototype.init = function () {
        alert('inited');
    };
    return ToolsOverlay;
})(google.maps.OverlayView);
