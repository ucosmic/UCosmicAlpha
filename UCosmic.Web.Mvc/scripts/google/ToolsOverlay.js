var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var App;
(function (App) {
    (function (GoogleMaps) {
        var gm = google.maps;
        var ToolsOverlayOptions = (function () {
            function ToolsOverlayOptions() {
                this.position = gm.ControlPosition.TOP_LEFT;
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
                this.markerLatLng = ko.observable();
                this.position = options.position;
                this.elementId = options.elementId;
                this.$element = $('#' + this.elementId);
                this.element = this.$element[0];
                this.$markerAddButton = this.$element.find('.marker img.add-button');
                this.$markerRemoveButton = this.$element.find('.marker img.remove-button');
                this.setMap(map);
            }
            ToolsOverlay.prototype.onAdd = function () {
                var _this = this;
                this.getMap().controls[this.position].push(this.element);
                if(this.markerLatLng()) {
                    this.$markerAddButton.hide();
                } else {
                    this.$markerRemoveButton.hide();
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
                var newLatLng = latLng ? new gm.LatLng(latLng.lat(), latLng.lng()) : null;
                this.markerLatLng(newLatLng);
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
                this.getMap().setOptions({
                    draggableCursor: 'pointer'
                });
                var pointX = this.$element.position().left + this.$markerAddButton.position().left + (this.$markerAddButton.outerWidth() / 2);
                var pointY = this.$markerAddButton.outerHeight();
                var $dragIcon = this.$element.find('.marker img.drag-icon');
                var dragAnchor = new gm.Point(0, 0);
                var dragAnchorData = $dragIcon.data('anchor');
                if(dragAnchorData && dragAnchorData.indexOf(',')) {
                    dragAnchor = new gm.Point(parseInt(dragAnchorData.split(',')[0]), parseInt(dragAnchorData.split(',')[1]));
                }
                var dragOrigin = new gm.Point(0, 0);
                var dragOriginData = $dragIcon.data('origin');
                if(dragOriginData && dragOriginData.indexOf(',')) {
                    dragOrigin = new gm.Point(parseInt(dragOriginData.split(',')[0]), parseInt(dragOriginData.split(',')[1]));
                }
                this.marker = new gm.Marker({
                    map: this.getMap(),
                    position: this.getProjection().fromContainerPixelToLatLng(new gm.Point(pointX, pointY)),
                    cursor: 'pointer',
                    clickable: false,
                    icon: new gm.MarkerImage($dragIcon.attr('src'), new gm.Size($dragIcon.width(), $dragIcon.height()), dragOrigin, dragAnchor)
                });
                this.$markerAddButton.hide();
                this.$markerRemoveButton.show();
                this.markerMoveListener = gm.event.addListener(this.getMap(), 'mousemove', function (e) {
                    _this.marker.setPosition(e.latLng);
                });
                this.markerDropListener = gm.event.addListenerOnce(this.getMap(), 'mouseup', function (e) {
                    gm.event.removeListener(_this.markerMoveListener);
                    gm.event.removeListener(_this.markerDropListener);
                    _this.getMap().setOptions({
                        draggableCursor: undefined
                    });
                    _this.marker.setMap(null);
                    var overlayView = new gm.OverlayView();
                    overlayView.draw = function () {
                    };
                    overlayView.setMap(_this.getMap());
                    var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);
                    var dragOffset = new gm.Point(0, 0);
                    var dragOffsetData = $dragIcon.data('offset');
                    if(dragOffsetData && dragOffsetData.indexOf(',')) {
                        dragOffset = new gm.Point(parseInt(dragOffsetData.split(',')[0]), parseInt(dragOffsetData.split(',')[1]));
                    }
                    pixels.y += dragOffset.y;
                    pixels.x += dragOffset.x;
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
