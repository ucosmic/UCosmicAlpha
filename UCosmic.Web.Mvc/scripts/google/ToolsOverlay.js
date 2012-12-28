var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var App;
(function (App) {
    (function (GoogleMaps) {
        var gm = google.maps;
        var ToolsOverlayOptions = (function () {
            function ToolsOverlayOptions() {
                this.position = gm.ControlPosition.TOP_LEFT;
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
                this.markerLat = ko.observable();
                this.markerLng = ko.observable();
                this.position = options.position;
                this.elementId = options.elementId;
                this.$element = $('#' + this.elementId);
                this.element = this.$element[0];
                this.markerLatLng = options.markerLatLng;
                this.updateMarkerLatLng(this.markerLatLng);
                this.$markerAddButton = this.$element.find('.marker img.add-button');
                this.$markerRemoveButton = this.$element.find('.marker img.remove-button');
                this.setMap(map);
            }
            ToolsOverlay.prototype.onAdd = function () {
                var _this = this;
                this.getMap().controls[this.position].push(this.element);
                if(this.markerLatLng) {
                    this.$markerAddButton.hide();
                } else {
                    this.$markerRemoveButton.hide();
                }
                if(this.markerLatLng) {
                    this.placeMarker(this.markerLatLng);
                }
                this.$markerAddButton.on('click', this, function (e) {
                    _this.createMarker(e);
                });
                this.$markerRemoveButton.on('click', this, function (e) {
                    _this.removeMarker(e);
                });
                this.$element.show();
            };
            ToolsOverlay.prototype.onRemove = function () {
                this.element.parentNode.removeChild(this.element);
            };
            ToolsOverlay.prototype.draw = function () {
            };
            ToolsOverlay.prototype.updateMarkerLatLng = function (latLng) {
                if(latLng) {
                    this.markerLat(latLng.lat());
                    this.markerLng(latLng.lng());
                    this.markerLatLng = new gm.LatLng(this.markerLat(), this.markerLng());
                } else {
                    this.markerLat(null);
                    this.markerLng(null);
                    this.markerLatLng = null;
                }
            };
            ToolsOverlay.prototype.getCreatedMarkerLatLng = function () {
                var pointX = this.$element.position().left + (this.$element.outerWidth() / 2);
                var pointY = this.$element.outerHeight();
                var point = new gm.Point(pointX, pointY);
                var projection = this.getProjection();
                return projection.fromContainerPixelToLatLng(point);
            };
            ToolsOverlay.prototype.placeMarker = function (latLng) {
                var _this = this;
                this.marker = new gm.Marker({
                    map: this.getMap(),
                    position: latLng,
                    draggable: true
                });
                this.updateMarkerLatLng(latLng);
                gm.event.addListener(this.marker, 'dragstart', function (e) {
                    _this.updateMarkerLatLng(e.latLng);
                    $(_this.getMap().getDiv()).trigger('marker_dragstart', _this);
                });
                gm.event.addListener(this.marker, 'drag', function (e) {
                    _this.updateMarkerLatLng(e.latLng);
                    $(_this.getMap().getDiv()).trigger('marker_drag', _this);
                });
                gm.event.addListener(this.marker, 'dragend', function (e) {
                    _this.updateMarkerLatLng(e.latLng);
                    $(_this.getMap().getDiv()).trigger('marker_dragend', _this);
                });
            };
            ToolsOverlay.prototype.createMarker = function (e) {
                var _this = this;
                this.$markerAddButton.hide();
                this.$markerRemoveButton.show();
                this.getMap().setOptions({
                    draggableCursor: 'pointer'
                });
                this.marker = new gm.Marker({
                    map: this.getMap(),
                    position: this.getCreatedMarkerLatLng(),
                    cursor: 'pointer',
                    clickable: false,
                    icon: new gm.MarkerImage('/styles/icons/maps/tools-marker-new.png', new gm.Size(52, 61), new gm.Point(0, 0), new gm.Point(10, 10))
                });
                this.markerMoveListener = gm.event.addListener(this.getMap(), 'mousemove', function (e) {
                    _this.marker.setPosition(e.latLng);
                });
                this.markerDropListener = gm.event.addListenerOnce(this.getMap(), 'click', function (e) {
                    gm.event.removeListener(_this.markerMoveListener);
                    _this.getMap().setOptions({
                        draggableCursor: undefined
                    });
                    _this.marker.setMap(null);
                    var overlayView = new gm.OverlayView();
                    overlayView.draw = function () {
                    };
                    overlayView.setMap(_this.getMap());
                    var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);
                    pixels.y += 43;
                    e.latLng = overlayView.getProjection().fromContainerPixelToLatLng(pixels);
                    _this.placeMarker(e.latLng);
                    $(_this.getMap().getDiv()).trigger('marker_created', _this);
                });
            };
            ToolsOverlay.prototype.removeMarker = function (e) {
                var _this = this;
                if(!this.$destroyMarkerConfirmDialog) {
                    this.$destroyMarkerConfirmDialog = this.$element.find('.confirm-destroy-marker-dialog');
                }
                if(this.$destroyMarkerConfirmDialog.length) {
                    this.$destroyMarkerConfirmDialog.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm removal',
                                click: function () {
                                    _this.$destroyMarkerConfirmDialog.dialog('close');
                                    _this.destroyMarker();
                                }
                            }, 
                            {
                                text: 'No, do not remove',
                                click: function () {
                                    _this.$destroyMarkerConfirmDialog.dialog('close');
                                },
                                'data-css-link': true
                            }
                        ]
                    });
                } else {
                    if(confirm('Are you sure you want to remove this placemark?')) {
                        this.destroyMarker();
                    }
                }
            };
            ToolsOverlay.prototype.destroyMarker = function () {
                this.getMap().setOptions({
                    draggableCursor: undefined
                });
                if(this.markerMoveListener) {
                    gm.event.removeListener(this.markerMoveListener);
                    this.markerMoveListener = undefined;
                }
                if(this.markerDropListener) {
                    gm.event.removeListener(this.markerDropListener);
                    this.markerDropListener = undefined;
                }
                gm.event.clearInstanceListeners(this.marker);
                this.marker.setMap(null);
                this.marker = undefined;
                this.updateMarkerLatLng(null);
                this.$markerRemoveButton.hide();
                this.$markerAddButton.show();
                $(this.getMap().getDiv()).trigger('marker_destroyed', this);
            };
            return ToolsOverlay;
        })(google.maps.OverlayView);
        GoogleMaps.ToolsOverlay = ToolsOverlay;        
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;

})(App || (App = {}));

