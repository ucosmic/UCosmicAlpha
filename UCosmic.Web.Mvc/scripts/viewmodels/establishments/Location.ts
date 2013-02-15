/// <reference path="../../google/ToolsOverlay.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="../Spinner.ts" />

module ViewModels.Establishments {

    import gm = google.maps

    export class Location {

        ownerId: number;
        map: google.maps.Map;
        mapZoom: KnockoutObservableNumber = ko.observable(1);
        mapTools: KnockoutObservableGoogleMapsToolsOverlay = ko.observable();
        toolsMarkerLat: KnockoutComputed;
        toolsMarkerLng: KnockoutComputed;
        $mapCanvas: KnockoutObservableJQuery = ko.observable();
        continents: KnockoutObservablePlaceModelArray = ko.observableArray();
        continentId: KnockoutObservableNumber = ko.observable();
        continentName: KnockoutComputed;
        countries: KnockoutObservablePlaceModelArray = ko.observableArray();
        countryId: KnockoutObservableNumber = ko.observable();
        countryName: KnockoutComputed;
        countryOptionsCaption: KnockoutComputed;
        private _countryId: number;
        admin1s: KnockoutObservablePlaceModelArray = ko.observableArray();
        admin1Id: KnockoutObservableNumber = ko.observable();
        admin1Name: KnockoutComputed;
        admin1OptionsCaption: KnockoutComputed;
        admin1sLoading: KnockoutObservableBool = ko.observable(false);
        private _admin1Id: number;
        showAdmin1Input: KnockoutComputed;
        admin2s: KnockoutObservablePlaceModelArray = ko.observableArray();
        admin2Id: KnockoutObservableNumber = ko.observable();
        admin2Name: KnockoutComputed;
        admin2OptionsCaption: KnockoutComputed;
        admin2sLoading: KnockoutObservableBool = ko.observable(false);
        private _admin2Id: number;
        showAdmin2Input: KnockoutComputed;
        admin3s: KnockoutObservablePlaceModelArray = ko.observableArray();
        admin3Id: KnockoutObservableNumber = ko.observable();
        admin3Name: KnockoutComputed;
        admin3OptionsCaption: KnockoutComputed;
        admin3sLoading: KnockoutObservableBool = ko.observable(false);
        private _admin3Id: number;
        showAdmin3Input: KnockoutComputed;
        places: KnockoutObservablePlaceModelArray = ko.observableArray();
        subAdmins: KnockoutObservablePlaceModelArray = ko.observableArray();
        dataLoadingSpinner: Spinner = new Spinner(new SpinnerOptions(400));
        $dataLoadingDialog: JQuery;
        isEditable: () => bool;
        isEditIconVisible: () => bool;
        isEditing: KnockoutObservableBool = ko.observable();

        constructor(ownerId: number) {
            this.ownerId = ownerId;
            this._initComputedsAndSubscriptions();

            this.dataLoadingSpinner.isVisible.subscribe((newValue: bool): void => {
                if (!this.$dataLoadingDialog || !this.$dataLoadingDialog.length) {
                    return;
                }
                if (newValue) {
                    this.$dataLoadingDialog.dialog({
                        modal: true,
                        resizable: false,
                        dialogClass: 'no-close',
                        width: '450px'
                    });
                }
                else {
                    this.$dataLoadingDialog.dialog('close');
                }
            });

            this.isEditable = ko.computed((): bool => {
                // may be a bad name for this property
                // this only returns true for the edit page, returns false for add page
                return this.ownerId && this.ownerId !== 0;
            });

            this.isEditIconVisible = ko.computed((): bool => {
                // whether or not to display edit icon to user
                // should never show on add page, because is always editable
                // should only display on edit page to make isEditing() === true
                return this.isEditable() && !this.isEditing();
            });

            this.isEditing.subscribe((newValue: bool): void => {
                // when edit mode is changed, show or hide marker tool overlay
                if (newValue) {
                    // show map marker tool
                    this.mapTools().showMarkerTools();
                }
                else if (this.isEditable()) {
                    // always display for add page, but hide for edit page
                    this.mapTools().hideMarkerTools();
                }
            });
        }

        private _initComputedsAndSubscriptions(): void {
            this.toolsMarkerLat = ko.computed((): number => {
                return this.mapTools() && this.mapTools().markerLatLng()
                    ? this.mapTools().markerLatLng().lat() : null;
            });
            this.toolsMarkerLng = ko.computed((): number => {
                return this.mapTools() && this.mapTools().markerLatLng()
                    ? this.mapTools().markerLatLng().lng() : null;
            });
            this.$mapCanvas.subscribe((newValue: JQuery): void => {
                if (!this.map) this.initMap();
            });

            // continents section
            ko.computed((): void => {
                $.get(App.Routes.WebApi.Places.get({ isContinent: true }))
                .done((response: Places.IServerApiModel[]): void => {
                    this.continents(response);
                });
            })
            .extend({ throttle: 1 });
            this.continentName = ko.computed((): string => {
                var continentId = this.continentId();
                if (!continentId) return '[Unspecified]';
                var continent = Places.Utils.getPlaceById(this.continents(), continentId);
                return continent ? continent.officialName : '[Unknown]';
            });

            // countries dropdown
            this.countryOptionsCaption = ko.computed((): string => {
                return this.countries().length > 0 ? '[Unspecified]' : '[Loading...]';
            });
            ko.computed((): void => {
                $.get(App.Routes.WebApi.Places.get({ isCountry: true }))
                .done((response: Places.IServerApiModel[]): void => {
                    this.countries(response);
                    if (this._countryId) {
                        var countryId = this._countryId;
                        this._countryId = undefined;
                        this.countryId(countryId);
                    }
                });
            })
            .extend({ throttle: 1 });
            this.countryName = ko.computed((): string => {
                var countryId = this.countryId();
                if (!countryId) return '[Unspecified]';
                var country = Places.Utils.getPlaceById(this.countries(), countryId);
                return country ? country.officialName : '[Unknown]';
            });
            this.countryId.subscribe((newValue: number): void => {
                // when this value is set before the countries menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.countries().length == 0)
                    this._countryId = newValue; // stash the value to set it after menu loads

                // scope the menu to the selected country
                if (newValue && this.countries().length > 0) {
                    var country: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.countries(), newValue);
                    if (country) {
                        this.map.fitBounds(Places.Utils.convertToLatLngBounds(country.box));

                        // cascade the continent
                        this.continentId(country.parentId);

                        // load admin1 options
                        this.loadAdmin1s(country.id);
                    }
                }
                else if (!newValue && this.countries().length > 0) {
                    // when changing to unspecified, zoom out menu
                    this.map.setCenter(new gm.LatLng(0, 0));
                    this.map.setZoom(1);
                    this.continentId(null);
                }
            });

            // admin1 dropdown
            this.admin1OptionsCaption = ko.computed((): string => {
                return !this.admin1sLoading() ? '[Unspecified]' : '[Loading...]';
            }).extend({ throttle: 400 });
            this.showAdmin1Input = ko.computed((): bool => {
                return this.countryId() && (this.admin1s().length > 0 || this.admin1sLoading());
            });
            this.admin1Id.subscribe((newValue: number): void => {
                // when this value is set before the admin1 menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.admin1s().length == 0)
                    this._admin1Id = newValue; // stash the value to set it after menu loads

                if (newValue && this.admin1s().length > 0) {
                    var admin1: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.admin1s(), newValue);
                    if (admin1) {
                        // load admin2 options
                        this.loadAdmin2s(admin1.id);
                    }
                    else {
                        this._admin1Id = newValue;
                        this.loadAdmin1s(this.countryId() || this._countryId);
                    }
                }
            });
            this.admin1Name = ko.computed((): string => {
                var admin1Id = this.admin1Id();
                if (!admin1Id) return '[Unspecified]';
                var admin1 = Places.Utils.getPlaceById(this.admin1s(), admin1Id);
                return admin1 ? admin1.officialName : '[Unknown]';
            });

            // admin2 dropdown
            this.admin2OptionsCaption = ko.computed((): string => {
                return !this.admin2sLoading() ? '[Unspecified]' : '[Loading...]';
            }).extend({ throttle: 400 });
            this.showAdmin2Input = ko.computed((): bool => {
                return this.countryId() && this.admin1Id()
                    && (this.admin2s().length > 0 || this.admin2sLoading());
            });
            this.admin2Id.subscribe((newValue: number): void => {
                // when this value is set before the admin2 menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.admin2s().length == 0)
                    this._admin2Id = newValue; // stash the value to set it after menu loads

                if (newValue && this.admin2s().length > 0) {
                    var admin2: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.admin2s(), newValue);
                    if (admin2) {
                        // load admin3 options
                        this.loadAdmin3s(admin2.id);
                    }
                    else {
                        this._admin2Id = newValue;
                        this.loadAdmin2s(this.admin1Id() || this._admin1Id);
                    }
                }
            });
            this.admin2Name = ko.computed((): string => {
                var admin2Id = this.admin2Id();
                if (!admin2Id) return '[Unspecified]';
                var admin2 = Places.Utils.getPlaceById(this.admin2s(), admin2Id);
                return admin2 ? admin2.officialName : '[Unknown]';
            });

            // admin3 dropdown
            this.admin3OptionsCaption = ko.computed((): string => {
                return !this.admin3sLoading() ? '[Unspecified]' : '[Loading...]';
            }).extend({ throttle: 400 });
            this.showAdmin3Input = ko.computed((): bool => {
                return this.countryId() && this.admin1Id() && this.admin2Id()
                    && (this.admin3s().length > 0 || this.admin3sLoading());
            });
            this.admin3Id.subscribe((newValue: number): void => {
                // when this value is set before the admin3 menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.admin3s().length == 0)
                    this._admin3Id = newValue; // stash the value to set it after menu loads

                if (newValue && this.admin3s().length > 0) {
                    var admin3: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.admin3s(), newValue);
                    if (!admin3) {
                        this._admin3Id = newValue;
                        this.loadAdmin3s(this.admin2Id() || this._admin2Id);
                    }
                }
            });
            this.admin3Name = ko.computed((): string => {
                var admin3Id = this.admin3Id();
                if (!admin3Id) return '[Unspecified]';
                var admin3 = Places.Utils.getPlaceById(this.admin3s(), admin3Id);
                return admin3 ? admin3.officialName : '[Unknown]';
            });
        }

        private initMap(): void {
            var me = this;
            // do everything necessary to initialize the google map
            var mapOptions: gm.MapOptions = {
                mapTypeId: gm.MapTypeId.ROADMAP,
                center: new gm.LatLng(0, 0), // americas on left, australia on right
                zoom: me.mapZoom(), // zoom out
                draggable: true, // allow map panning
                scrollwheel: false // prevent mouse wheel zooming
            };
            this.map = new gm.Map(this.$mapCanvas()[0], mapOptions); // create map on element

            gm.event.addListenerOnce(this.map, 'idle', (): void => {
                this.mapTools(new App.GoogleMaps.ToolsOverlay(this.map));
                this.mapTools().hideMarkerTools(); // initially hide the marker tools

                gm.event.addListener(this.map, 'zoom_changed', (): void => {
                    // track the map zoom
                    this.mapZoom(this.map.getZoom());
                });
            });


            // tools overlay marker
            this.$mapCanvas().on('marker_destroyed', (): void => {
                this.countryId(undefined); // reset location info
                this.subAdmins([]);
            });

            this.$mapCanvas().on('marker_dragend marker_created', (): void => {
                var latLng = this.mapTools().markerLatLng();
                var route = App.Routes.WebApi.Places.get(latLng.lat(), latLng.lng());
                this.dataLoadingSpinner.start();
                $.get(route)
                .done((response: Places.IServerApiModel[]): void => {
                    if (response && response.length) {
                        this.fillPlacesHierarchy(response);
                    }
                })
                .always((): void => {
                    this.dataLoadingSpinner.stop();
                })
                .fail((arg1: any, arg2, arg3, arg4, arg5): void => {
                    //alert('update call fail :(');
                });
            });

            if (this.ownerId) { // set up based on current owner id
                $.get(App.Routes.WebApi.Establishments.Locations.get(this.ownerId))
                .done((response: IServerLocationApiModel): void => {
                    gm.event.addListenerOnce(this.map, 'idle', (): void => {
                        this.loadMapZoom(response);
                        this.loadMapMarker(response);
                    });

                    this.fillPlacesHierarchy(response.places);
                })
            }
            else { // otherwise, make map editable
                gm.event.addListenerOnce(this.map, 'idle', (): void => {
                    this.isEditing(true);
                });
            }
        }

        private loadMapZoom(response: IServerLocationApiModel): void {
            // zoom map to reveal location
            if (response.googleMapZoomLevel)
                this.map.setZoom(response.googleMapZoomLevel);
            else if (response.box.hasValue)
                this.map.fitBounds(Places.Utils.convertToLatLngBounds(response.box));
        }

        private loadMapMarker(response: IServerLocationApiModel): void {
            // place marker and set map center
            if (response.center.hasValue) {
                var latLng = Places.Utils.convertToLatLng(response.center);
                this.mapTools().placeMarker(latLng);
                this.map.setCenter(latLng);
            }
        }

        private fillPlacesHierarchy(places: Places.IServerApiModel[]): void {
            // make places array observable
            this.places(places);

            // populate continent menu
            var continent: Places.IServerApiModel = Places.Utils.getContinent(places);
            if (continent) this.continentId(continent.id);

            // populate country menu
            var country: Places.IServerApiModel = Places.Utils.getCountry(places);
            if (country) this.countryId(country.id);
            else this.countryId(undefined);

            // populate admin1 menu
            var admin1: Places.IServerApiModel = Places.Utils.getAdmin1(places);
            if (admin1) this.admin1Id(admin1.id);
            else this.admin1Id(undefined);

            // populate admin2 menu
            var admin2: Places.IServerApiModel = Places.Utils.getAdmin2(places);
            if (admin2) this.admin2Id(admin2.id);
            else this.admin2Id(undefined);

            // populate admin3 menu
            var admin3: Places.IServerApiModel = Places.Utils.getAdmin3(places);
            if (admin3) this.admin3Id(admin3.id);
            else this.admin3Id(undefined);

            var subAdmins: Places.IServerApiModel[] = Places.Utils
                .getSubAdmins(places);
            if (subAdmins && subAdmins.length) this.subAdmins(subAdmins);
            else this.subAdmins([]);
        }

        private loadAdmin1s(countryId: number): void {
            this.admin1s([]);
            var admin1Url = App.Routes.WebApi.Places
                .get({ isAdmin1: true, parentId: countryId });
            this.admin1sLoading(true);
            $.ajax({
                type: 'GET',
                url: admin1Url,
                cache: false
            }).done((results: Places.IServerApiModel[]) => {
                this.admin1s(results);
                if (this._admin1Id)
                    this.admin1Id(this._admin1Id);
                this.admin1sLoading(false);
            });
        }

        private loadAdmin2s(admin1Id: number): void {
            this.admin2s([]);
            var admin2Url = App.Routes.WebApi.Places
                .get({ isAdmin2: true, parentId: admin1Id });
            this.admin2sLoading(true);
            $.ajax({
                type: 'GET',
                url: admin2Url,
                cache: false,
            }).done((results: Places.IServerApiModel[]) => {
                this.admin2s(results);
                if (this._admin2Id)
                    this.admin2Id(this._admin2Id);
                this.admin2sLoading(false);
            });
        }

        private loadAdmin3s(admin2Id: number): void {
            this.admin3s([]);
            var admin3Url = App.Routes.WebApi.Places
                .get({ isAdmin3: true, parentId: admin2Id });
            this.admin3sLoading(true);
            $.ajax({
                type: 'GET',
                url: admin3Url,
                cache: false
            }).done((results: Places.IServerApiModel[]) => {
                this.admin3s(results);
                if (this._admin3Id)
                    this.admin3Id(this._admin3Id);
                this.admin3sLoading(false);
            });
        }

        changePlaceInLocation(): void {
            this.subAdmins([]);
        }

        clickToEdit(): void {
            this.isEditing(true);
        }

        clickToCancelEdit(): void {
            this.isEditing(false);

            // shouldn't be able to click this button for add form, guarding anyway
            if (!this.ownerId) return;

            // restore initial values
            $.get(App.Routes.WebApi.Establishments.Locations.get(this.ownerId))
                .done((response: IServerLocationApiModel): void => {

                // reset zoom
                this.map.setZoom(1);
                this.loadMapZoom(response);

                // reset marker
                this.mapTools().destroyMarker();
                this.loadMapMarker(response);

                this.fillPlacesHierarchy(response.places);
            })
        }

        clickForHelp(): void {
            alert('TODO: Show location help dialog here.');
        }
    }

}
