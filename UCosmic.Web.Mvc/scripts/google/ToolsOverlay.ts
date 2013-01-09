/// <reference path="google.maps.d.ts" />
/// <reference path="../ko/knockout-2.2.d.ts" />
/// <reference path="../ko/knockout.extensions.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="../jquery/jqueryui-1.9.d.ts" />

interface KnockoutObservableGoogleMapsToolsOverlay extends KnockoutObservableBase {
    (): App.GoogleMaps.ToolsOverlay;
    (value: App.GoogleMaps.ToolsOverlay): void;

    subscribe(callback: (newValue: App.GoogleMaps.ToolsOverlay) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: App.GoogleMaps.ToolsOverlay, topic?: string);
}

module App.GoogleMaps {

    import gm = google.maps

    export class ToolsOverlayOptions {
        position: gm.ControlPosition = gm.ControlPosition.TOP_LEFT;
        elementId: string = 'map_tools';
    }

    // https://developers.google.com/maps/documentation/javascript/overlays#CustomOverlays
    // https://developers.google.com/maps/documentation/javascript/reference#OverlayView
    export class ToolsOverlay extends google.maps.OverlayView {

        position: gm.ControlPosition; // which google maps control position to render the tools in
        elementId: string; // id of the element wrapping the tools DOM markup (excludes #)
        markerLatLng: KnockoutObservableGoogleMapsLatLng = ko.observable(); // position of the marker

        private element: Element; // reference to actual element with elementId
        private $element: JQuery; // jQuery wrapper for the element
        private marker: gm.Marker;
        private $markerAddButton: JQuery;
        private $markerRemoveButton: JQuery;
        private $destroyMarkerConfirmDialog;
        private markerMoveListener: gm.MapsEventListener;
        private markerDropListener: gm.MapsEventListener;


        constructor (map: gm.Map,
            options?: ToolsOverlayOptions = new ToolsOverlayOptions()) {
            super();

            // apply options
            this.position = options.position;
            this.elementId = options.elementId;

            // initialize jQuery fields
            this.$element = $('#' + this.elementId);
            this.element = this.$element[0];
            this.$markerAddButton = this.$element.find('.marker img.add-button');
            this.$markerRemoveButton = this.$element.find('.marker img.remove-button');

            this.setMap(map); // invokes onAdd() then draw()
        }

        private onAdd(): void { // initialize the map tools overlay

            // render the tools element on the map canvas
            this.getMap().controls[this.position].push(this.element);

            // display the correct marker button
            if (this.markerLatLng()) this.$markerAddButton.hide();
            else this.$markerRemoveButton.hide();

            // add click handlers to the marker buttons
            this.$markerAddButton.on('click', this,
                (e: JQueryEventObject) => { this.createMarker(e); });
            this.$markerRemoveButton.on('click', this,
                (e: JQueryEventObject) => { this.removeMarker(e); });

            this.$element.show(); // unhide the tools element
        }

        private onRemove(): void { // detach the tools element from the DOM
            this.element.parentNode.removeChild(this.element);
        }

        private draw(): void {
            // NOTE: this method is invoked each time the map is panned or zoomed
        }

        private updateMarkerLatLng(latLng: gm.LatLng): void {
            // certain events may change the exposed lat & lng of this tools instance
            var newLatLng = latLng ? new gm.LatLng(latLng.lat(), latLng.lng()) : null;
            this.markerLatLng(newLatLng);
        }

        placeMarker(latLng: gm.LatLng): void {
            this.marker = new gm.Marker({ // set a draggable marker at the coordinates
                map: this.getMap(),
                position: latLng,
                draggable: true
            });
            this.updateMarkerLatLng(latLng);

            // add event listeners to update lat/lng observables when dragged
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
            this.getMap().setOptions({ draggableCursor: 'pointer' });

            // compute initial position of new marker image
            var pointX = this.$element.position().left + this.$markerAddButton.position().left
                + (this.$markerAddButton.outerWidth() / 2);
            var pointY = this.$markerAddButton.outerHeight();

            // get info about marker drag image
            var $dragIcon: JQuery = this.$element.find('.marker img.drag-icon');
            var dragAnchor = new gm.Point(0, 0); // position in icon that sticks to mouse pointer
            var dragAnchorData: string = $dragIcon.data('anchor');
            if (dragAnchorData && dragAnchorData.indexOf(','))
                dragAnchor = new gm.Point(parseInt(dragAnchorData.split(',')[0]),
                    parseInt(dragAnchorData.split(',')[1]));
            var dragOrigin = new gm.Point(0, 0); // used if the icon is in a sprite file
            var dragOriginData: string = $dragIcon.data('origin');
            if (dragOriginData && dragOriginData.indexOf(','))
                dragOrigin = new gm.Point(parseInt(dragOriginData.split(',')[0]),
                    parseInt(dragOriginData.split(',')[1]));

            this.marker = new gm.Marker({ // set the marker
                map: this.getMap(),
                position: this.getProjection().fromContainerPixelToLatLng(new gm.Point(pointX, pointY)),
                cursor: 'pointer',
                clickable: false,
                icon: new gm.MarkerImage($dragIcon.attr('src'),
                    new gm.Size($dragIcon.width(), $dragIcon.height()),
                    dragOrigin, // origin
                    dragAnchor // anchor
                )
            });
            this.$markerAddButton.hide(); // hide the add button
            this.$markerRemoveButton.show(); // show the remove button
            this.markerMoveListener = gm.event.addListener(this.getMap(), 'mousemove', (e: gm.MouseEvent): void => {
                this.marker.setPosition(e.latLng); // move the marker icon along with the mouse
            });
            this.markerDropListener = gm.event.addListenerOnce(this.getMap(), 'mouseup', (e: gm.MouseEvent): void => {
                gm.event.removeListener(this.markerMoveListener);
                gm.event.removeListener(this.markerDropListener);
                this.getMap().setOptions({ draggableCursor: undefined });
                this.marker.setMap(<gm.Map>null); // remove old marker

                // compute position to drop the marker onto
                var overlayView = new gm.OverlayView();
                overlayView.draw = function () { };
                overlayView.setMap(this.getMap());
                var pixels = overlayView.getProjection().fromLatLngToContainerPixel(e.latLng);

                // difference between drag marker anchor and position when dropped
                var dragOffset = new gm.Point(0, 0);
                var dragOffsetData: string = $dragIcon.data('offset');
                if (dragOffsetData && dragOffsetData.indexOf(','))
                    dragOffset = new gm.Point(parseInt(dragOffsetData.split(',')[0]),
                        parseInt(dragOffsetData.split(',')[1]));

                pixels.y += dragOffset.y; // Y offset
                pixels.x += dragOffset.x; // X offset
                e.latLng = overlayView.getProjection().fromContainerPixelToLatLng(pixels);
                this.placeMarker(e.latLng);
                $(this.getMap().getDiv()).trigger('marker_created', this);
            });
        }

        private removeMarker(e: JQueryEventObject) { // require confirmation to remove marker
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
            if (this.markerMoveListener) { // remove all previous listeners
                gm.event.removeListener(this.markerMoveListener);
                this.markerMoveListener = undefined;
            }
            if (this.markerDropListener) {
                gm.event.removeListener(this.markerDropListener);
                this.markerDropListener = undefined;
            }
            gm.event.clearInstanceListeners(this.marker);
            this.marker.setMap(<gm.Map>null); // destroy the marker
            this.marker = undefined;
            this.updateMarkerLatLng(null); // nullify coordinates
            this.$markerRemoveButton.hide(); // hide remove button
            this.$markerAddButton.show(); // show add button
            $(this.getMap().getDiv()).trigger('marker_destroyed', this);
        }
    }

}
