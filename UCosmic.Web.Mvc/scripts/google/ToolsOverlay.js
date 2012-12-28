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
                this.markerLat = options.markerLatObservable || ko.observable();
                this.markerLng = options.markerLngObservable || ko.observable();
                this.updateMarkerLatLng(this.markerLatLng);
                this.$markerReadyButton = this.$element.find('.marker img.ready-icon');
                this.$markerPushedButton = this.$element.find('.marker img.pushed-icon');
                this.init();
            }
            ToolsOverlay.prototype.draw = function () {
            };
            ToolsOverlay.prototype.init = function () {
                var _this = this;
                this.map.controls[this.position].push(this.element);
                if(this.markerLatLng) {
                    this.$markerReadyButton.hide();
                } else {
                    this.$markerPushedButton.hide();
                }
                if(this.markerLatLng) {
                    this.putMarker(this.markerLatLng);
                }
                this.$markerReadyButton.on('click', this, function (e) {
                    _this.createMarker(e);
                });
                this.$markerPushedButton.on('click', this, function (e) {
                    _this.removeMarker(e);
                });
                this.$element.show();
            };
            ToolsOverlay.prototype.updateMarkerLatLng = function (latLng) {
                if(latLng) {
                    this.markerLat(latLng.lat());
                    this.markerLng(latLng.lng());
                }
            };
            ToolsOverlay.prototype.getCreatedMarkerLatLng = function () {
                var pointX = this.$element.position().left + (this.$element.outerWidth() / 2);
                var pointY = this.$element.outerHeight();
                var point = new google.maps.Point(pointX, pointY);
                var projection = this.getProjection();
                return projection.fromContainerPixelToLatLng(point);
            };
            ToolsOverlay.prototype.putMarker = function (latLng) {
                var _this = this;
                this.marker = new google.maps.Marker({
                    map: this.map,
                    position: latLng,
                    draggable: true
                });
                this.updateMarkerLatLng(latLng);
                google.maps.event.addListener(this.marker, 'dragstart', function (e) {
                    _this.updateMarkerLatLng(e.latLng);
                    $(_this.map.getDiv()).trigger('marker_dragstart', _this);
                });
                google.maps.event.addListener(this.marker, 'drag', function (e) {
                    _this.updateMarkerLatLng(e.latLng);
                    $(_this.map.getDiv()).trigger('marker_drag', _this);
                });
                google.maps.event.addListener(this.marker, 'dragend', function (e) {
                    _this.updateMarkerLatLng(e.latLng);
                    $(_this.map.getDiv()).trigger('marker_dragend', _this);
                });
            };
            ToolsOverlay.prototype.createMarker = function (e) {
                var _this = this;
                this.$markerReadyButton.hide();
                this.$markerPushedButton.show();
                this.map.setOptions({
                    draggableCursor: 'pointer'
                });
                this.marker = new google.maps.Marker({
                    map: this.map,
                    position: this.getCreatedMarkerLatLng(),
                    cursor: 'pointer',
                    clickable: false,
                    icon: new google.maps.MarkerImage('/styles/icons/maps/tools-marker-new.png', new google.maps.Size(52, 61), new google.maps.Point(0, 0), new google.maps.Point(10, 10))
                });
                this.markerMoveListener = google.maps.event.addListener(this.map, 'mousemove', function (e) {
                    _this.marker.setPosition(e.latLng);
                });
                this.markerDropListener = google.maps.event.addListenerOnce(this.map, 'click', function (e) {
                    google.maps.event.removeListener(_this.markerMoveListener);
                    _this.map.setOptions({
                        draggableCursor: undefined
                    });
                    _this.marker.setMap(null);
                    var overlayView = new google.maps.OverlayView();
                    overlayView.draw = function () {
                    };
                    overlayView.setMap(_this.map);
                    var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);
                    pixels.y += 43;
                    e.latLng = overlayView.getProjection().fromContainerPixelToLatLng(pixels);
                    _this.putMarker(e.latLng);
                    $(_this.map.getDiv()).trigger('marker_created', _this);
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
                this.$markerPushedButton.hide();
                this.$markerReadyButton.show();
                this.map.setOptions({
                    draggableCursor: undefined
                });
                if(this.markerMoveListener) {
                    google.maps.event.removeListener(this.markerMoveListener);
                    this.markerMoveListener = undefined;
                }
                if(this.markerDropListener) {
                    google.maps.event.removeListener(this.markerDropListener);
                    this.markerDropListener = undefined;
                }
                google.maps.event.clearInstanceListeners(this.marker);
                this.marker.setMap(null);
                this.marker = undefined;
                this.markerLat(null);
                this.markerLng(null);
                $(this.map.getDiv()).trigger('marker_destroyed', this);
            };
            return ToolsOverlay;
        })(google.maps.OverlayView);
        GoogleMaps.ToolsOverlay = ToolsOverlay;        
    })(App.GoogleMaps || (App.GoogleMaps = {}));
    var GoogleMaps = App.GoogleMaps;

})(App || (App = {}));

