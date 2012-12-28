/// <reference path="google.maps.d.ts" />
/// <reference path="../ko/knockout-2.2.d.ts" />
/// <reference path="google.maps-knockout.extensions.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="../jquery/jqueryui-1.9.d.ts" />

module App.GoogleMaps {

    import gm = google.maps

    export class ToolsOverlayOptions {
        position: gm.ControlPosition = gm.ControlPosition.TOP_LEFT;
        elementId: string = 'map_tools';
        markerLatLng: gm.LatLng = undefined;
    }

    // https://developers.google.com/maps/documentation/javascript/overlays#CustomOverlays
    // https://developers.google.com/maps/documentation/javascript/reference#OverlayView
    export class ToolsOverlay extends google.maps.OverlayView {

        position: gm.ControlPosition; // which google maps control position to render the tools in
        elementId: string; // id of the element wrapping the tools DOM markup (excludes #)
        element: Element; // reference to actual element with elementId
        $element: JQuery; // jQuery wrapper for the element
        markerLatLng: KnockoutObservableGoogleMapsLatLng = ko.observable(); // position of the marker

        constructor (map: gm.Map,
            options?: ToolsOverlayOptions = new ToolsOverlayOptions()) {
            super();

            this.position = options.position;
            this.elementId = options.elementId;
            this.$element = $('#' + this.elementId);
            this.element = this.$element[0];

            this.markerLatLng(options.markerLatLng);
            this.$markerAddButton = this.$element.find('.marker img.add-button');
            this.$markerRemoveButton = this.$element.find('.marker img.remove-button');

            this.setMap(map); // invokes onAdd() then draw()
        }

        private onAdd(): void {

            // render the tools element on the map canvas
            this.getMap().controls[this.position].push(this.element);

            // display the correct marker button
            if (this.markerLatLng()) this.$markerAddButton.hide();
            else this.$markerRemoveButton.hide();

            // place marker if it already exists
            if (this.markerLatLng()) this.placeMarker(this.markerLatLng());

            // add click handlers to the marker buttons
            this.$markerAddButton.on('click', this,
                (e: JQueryEventObject) => { this.createMarker(e); });
            this.$markerRemoveButton.on('click', this,
                (e: JQueryEventObject) => { this.removeMarker(e); });

            this.$element.show(); // unhide the tools element
        }

        private onRemove(): void {
            this.element.parentNode.removeChild(this.element);
        }

        private draw(): void {
            // NOTE: this method is invoked each time the map is panned or zoomed
        }

        private marker: gm.Marker;
        private $markerAddButton: JQuery;
        private $markerRemoveButton: JQuery;
        private $destroyMarkerConfirmDialog;
        private markerMoveListener: gm.MapsEventListener;
        private markerDropListener: gm.MapsEventListener;

        private updateMarkerLatLng(latLng: gm.LatLng): void {
            var newLatLng = latLng ? new gm.LatLng(latLng.lat(), latLng.lng()) : null;
            this.markerLatLng(newLatLng);
        }

        private getCreatedMarkerLatLng(): gm.LatLng {
            var pointX = this.$element.position().left + (this.$element.outerWidth() / 2);
            var pointY = this.$element.outerHeight();
            var point = new gm.Point(pointX, pointY);
            var projection = this.getProjection();
            return projection.fromContainerPixelToLatLng(point);
        }

        private placeMarker(latLng: gm.LatLng): void {
            this.marker = new gm.Marker({
                map: this.getMap(),
                position: latLng,
                draggable: true
            });
            this.updateMarkerLatLng(latLng);

            gm.event.addListener(this.marker, 'dragstart', (e: gm.MouseEvent): void => {
                this.updateMarkerLatLng(e.latLng);
                $(this.getMap().getDiv()).trigger('marker_dragstart', this);
            });
            gm.event.addListener(this.marker, 'drag', (e: gm.MouseEvent): void => {
                this.updateMarkerLatLng(e.latLng);
                $(this.getMap().getDiv()).trigger('marker_drag', this);
            });
            gm.event.addListener(this.marker, 'dragend', (e: gm.MouseEvent): void => {
                this.updateMarkerLatLng(e.latLng);
                $(this.getMap().getDiv()).trigger('marker_dragend', this);
            });
        }

        private createMarker(e: JQueryEventObject): void {
            this.$markerAddButton.hide();
            this.$markerRemoveButton.show();
            this.getMap().setOptions({ draggableCursor: 'pointer' });
            this.marker = new gm.Marker({
                map: this.getMap(),
                position: this.getCreatedMarkerLatLng(),
                cursor: 'pointer',
                clickable: false,
                icon: new gm.MarkerImage('/styles/icons/maps/tools-marker-new.png',
                    new gm.Size(52, 61),
                    new gm.Point(0, 0), // origin
                    new gm.Point(10, 10) // anchor
                )
            });
            this.markerMoveListener = gm.event.addListener(this.getMap(), 'mousemove', (e: gm.MouseEvent): void => {
                this.marker.setPosition(e.latLng);
            });
            this.markerDropListener = gm.event.addListenerOnce(this.getMap(), 'click', (e: gm.MouseEvent): void => {
                gm.event.removeListener(this.markerMoveListener);
                this.getMap().setOptions({ draggableCursor: undefined });
                this.marker.setMap(null);
                var overlayView = new gm.OverlayView();
                overlayView.draw = function () { };
                overlayView.setMap(this.getMap());
                var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);
                pixels.y += 43; // Y offset
                e.latLng = overlayView.getProjection().fromContainerPixelToLatLng(pixels);
                this.placeMarker(e.latLng);
                $(this.getMap().getDiv()).trigger('marker_created', this);
            });
        }

        private removeMarker(e: JQueryEventObject) {
            if (!this.$destroyMarkerConfirmDialog)
                this.$destroyMarkerConfirmDialog = this.$element.find('.confirm-destroy-marker-dialog');
            if (this.$destroyMarkerConfirmDialog.length) {
                this.$destroyMarkerConfirmDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm removal',
                            click: (): void => {
                                this.$destroyMarkerConfirmDialog.dialog('close');
                                this.destroyMarker();
                            }
                        },
                        {
                            text: 'No, do not remove',
                            click: (): void => {
                                this.$destroyMarkerConfirmDialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            }
            else if (confirm('Are you sure you want to remove this placemark?')) {
                this.destroyMarker();
            }
        }

        private destroyMarker(): void {
            this.getMap().setOptions({ draggableCursor: undefined });
            if (this.markerMoveListener) {
                gm.event.removeListener(this.markerMoveListener);
                this.markerMoveListener = undefined;
            }
            if (this.markerDropListener) {
                gm.event.removeListener(this.markerDropListener);
                this.markerDropListener = undefined;
            }
            gm.event.clearInstanceListeners(this.marker);
            this.marker.setMap(null);
            this.marker = undefined;
            this.updateMarkerLatLng(null);
            this.$markerRemoveButton.hide(); // hide remove button
            this.$markerAddButton.show(); // show add button
            $(this.getMap().getDiv()).trigger('marker_destroyed', this);
        }
    }

}
