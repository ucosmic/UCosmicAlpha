var Agreements;
(function (Agreements) {
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/globalize/globalize.d.ts" />
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/requirejs/require.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="./populateFiles.ts" />
    /// <reference path="../../typings/googlemaps/google.maps.d.ts" />
    /// <reference path="../../typings/linq/linq.d.ts" />
    (function (ViewModels) {
        var PublicView = (function () {
            function PublicView(agreementId, agreementVisibility) {
                var _this = this;
                this.isBound = ko.observable(false);
                this.files = ko.observableArray();
                this.content = ko.observable();
                this.expiresOn = ko.observable();
                this.isAutoRenew = ko.observable();
                this.status = ko.observable();
                this.isExpirationEstimated = ko.observable();
                this.name = ko.observable();
                this.notes = ko.observable();
                this.participants = ko.observableArray();
                this.startsOn = ko.observable();
                this.type = ko.observable();
                this.umbrellaId = ko.observable();
                this.myUrl = window.location.href.toLowerCase();
                //#region Name computeds
                // TODO: do not create view elements in the viewmodel like this. do it with bindings.
                // see the removed participantsNames computed in searchResult.ts for reference.
                this.participantsNames = ko.computed(function () {
                    var myName = "";
                    ko.utils.arrayForEach(_this.participants(), function (item) {
                        myName += "<div style='margin-bottom:10px'>";
                        if (item.establishmentTranslatedName != null && item.establishmentOfficialName != item.establishmentTranslatedName && item.establishmentOfficialName != null) {
                            myName += "<strong>" + item.establishmentTranslatedName + "</strong><br /> (" + item.establishmentOfficialName + ")";
                        } else if (item.establishmentTranslatedName != null && item.establishmentOfficialName != item.establishmentTranslatedName) {
                            myName += "<strong>" + item.establishmentTranslatedName + "</strong>";
                        } else {
                            myName += "<strong>" + item.establishmentOfficialName + "</strong>";
                        }
                        myName += "</div>";
                    });
                    return myName;
                });
                this._googleMarkers = ko.observableArray();
                if (isNaN(agreementId)) {
                    agreementId = 0;
                }
                this.agreementId = { val: agreementId };
                this.agreementVisibility = agreementVisibility || 'Public';
                this.populateFilesClass = new agreements.populateFiles();
                this._setupDateComputeds();

                if (this.agreementId.val !== 0) {
                    //this.getData();
                    var dataBound = this._bindData();

                    //this.createMap();
                    var mapCreated = this._createMap();
                    $.when(dataBound, mapCreated).done(function () {
                        _this._bindMap();
                    });
                }
            }
            //partners;
            //agreementId = { val: 0 }
            PublicView.prototype._bindData = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Agreements.get(this.agreementId.val)).done(function (response) {
                    var mapping = {
                        participants: {
                            create: function (options) {
                                return options.data;
                            }
                        }
                    };
                    ko.mapping.fromJS(response, mapping, _this);
                    _this.isBound(true);
                    deferred.resolve();
                });
                return deferred;
            };

            PublicView.prototype.getData = function () {
                var _this = this;
                $.get(App.Routes.WebApi.Agreements.get(this.agreementId.val)).done(function (response) {
                    _this.content(response.content);
                    _this.expiresOn(response.expiresOn);
                    _this.isAutoRenew(response.isAutoRenew);
                    _this.status(response.status);
                    _this.isExpirationEstimated(response.isExpirationEstimated);
                    _this.name(response.name);
                    _this.notes(response.notes);
                    ko.mapping.fromJS(response.participants, {}, _this.participants);
                    _this.startsOn(response.startsOn);
                    _this.type(response.type);
                    _this.umbrellaId(response.umbrellaId);
                    _this.isBound(true);
                    //this.partners = response.participants;
                });
                this.populateFilesClass.populate(this.agreementId);
                this.files = this.populateFilesClass.files;
            };

            PublicView.prototype._setupNameComputeds = function () {
                var _this = this;
                // are the official name and translated name the same?
                this.participantsNames = ko.computed(function () {
                    var myName = "";
                    ko.utils.arrayForEach(_this.participants(), function (item) {
                        myName += "<div style='margin-bottom:10px'>";
                        if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName() && item.establishmentOfficialName() != null) {
                            myName += "<strong>" + item.establishmentTranslatedName() + "</strong><br /> (" + item.establishmentOfficialName() + ")";
                        } else if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName()) {
                            myName += "<strong>" + item.establishmentTranslatedName() + "</strong>";
                        } else {
                            myName += "<strong>" + item.establishmentOfficialName() + "</strong>";
                        }
                        myName += "</div>";
                    });
                    return myName;
                });
            };

            PublicView.prototype._setupDateComputeds = function () {
                var _this = this;
                this.startsOnDate = ko.computed(function () {
                    var value = _this.startsOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    }
                    return (moment(value)).format('M/D/YYYY');
                });
                this.expiresOnDate = ko.computed(function () {
                    var value = _this.expiresOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    } else {
                        return (moment(value)).format('M/D/YYYY');
                    }
                });
            };

            PublicView.prototype._createMap = function () {
                this._googleMap = new google.maps.Map(document.getElementById("map-canvas"), {
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: new google.maps.LatLng(0, 0),
                    zoom: 1,
                    draggable: true,
                    scrollwheel: false
                });
                var deferred = $.Deferred();
                google.maps.event.addListenerOnce(this._googleMap, 'idle', function () {
                    deferred.resolve();
                });
                return deferred;
            };

            PublicView.prototype._bindMap = function () {
                var _this = this;
                // extract the partners from participants (they are non-owners)
                var partners = Enumerable.From(this.participants()).Where(function (x) {
                    return !x.isOwner;
                }).ToArray();

                // collect together all of the plottable partner marker points
                var centers = Enumerable.From(partners).Where(function (x) {
                    return x.center && x.center.hasValue;
                }).Select(function (x) {
                    return x.center;
                }).ToArray();
                var latLngs = Enumerable.From(centers).Select(function (x) {
                    return new google.maps.LatLng(x.latitude, x.longitude);
                }).ToArray();

                var bounds = new google.maps.LatLngBounds();
                $.each(latLngs, function (index, latLng) {
                    // matching partner may have different index than this latLng
                    var title = Enumerable.From(partners).Single(function (x) {
                        return x.center && x.center == centers[index];
                    }).establishmentTranslatedName;

                    // plot the marker
                    var options = {
                        map: _this._googleMap,
                        position: latLng,
                        title: title
                    };
                    var marker = new google.maps.Marker(options);
                    bounds.extend(latLng);
                    _this._googleMarkers.push(marker);
                });

                if (centers.length == 1) {
                    this._googleMap.setCenter(latLngs[0]);

                    // check to see if the centered partner has zoom
                    var partner = Enumerable.From(partners).Single(function (x) {
                        return x.center && x.center == centers[0];
                    });
                    var zoom = partner.googleMapZoomLevel;
                    if (zoom) {
                        //this._animateMapZoom(zoom);
                        this._googleMap.setZoom(zoom);
                    } else if (partner.boundingBox && partner.boundingBox.hasValue) {
                        bounds = new google.maps.LatLngBounds(new google.maps.LatLng(partner.boundingBox.southWest.latitude, partner.boundingBox.southWest.longitude), new google.maps.LatLng(partner.boundingBox.northEast.latitude, partner.boundingBox.northEast.longitude));
                        this._googleMap.fitBounds(bounds);
                        this._googleMap.setCenter(latLngs[0]);
                    }
                } else if (centers.length > 0) {
                    this._googleMap.fitBounds(bounds);
                }
            };

            PublicView.prototype._animateMapZoom = function (zoom) {
                var _this = this;
                var currentZoom = this._googleMap.getZoom();
                if (currentZoom == zoom)
                    return;
                var difference = zoom - currentZoom;
                var direction = difference > 0 ? 1 : -1;
                var nextZoom = currentZoom + direction;
                this._googleMap.setZoom(nextZoom);
                if (nextZoom != currentZoom)
                    setTimeout(function () {
                        _this._animateMapZoom(zoom);
                    }, 100);
            };

            //createMap(): void {
            //    var self = this;
            //    function initialize() {
            //        // /api/agreements/{agreementId}/partners
            //        //var mapUrl = $('#agreementPartners_api').text();
            //        //var params = { agreementId: self.agreementId.val };
            //        //mapUrl = '{0}'.format(mapUrl, $.param(params));
            //        //$('#agreementPartners_api').text().format(self.agreementId.val)
            //        $.get($('#agreementPartners_api').text().format(self.agreementId.val))
            //            .done((response: any): void => {
            //                var lat = -34.397, long = 150.644, googleMapZoomLevel, mapOptions,
            //                    map;
            //                if (response[0].center.hasValue) {
            //                    lat = response[0].center.latitude;
            //                    long = response[0].center.longitude;
            //                }
            //                googleMapZoomLevel = (response[0].googleMapZoomLevel) ? response[0].googleMapZoomLevel : 8;
            //                mapOptions = {
            //                    center: new google.maps.LatLng(lat, long),
            //                    zoom: googleMapZoomLevel,
            //                    mapTypeId: google.maps.MapTypeId.ROADMAP
            //                };
            //                map = new google.maps.Map(document.getElementById("map-canvas"),
            //                    mapOptions);
            //            });
            //    }
            //    google.maps.event.addDomListener(window, 'load', initialize);
            //}
            PublicView.prototype.createMap = function () {
                var self = this;
                function initialize() {
                    //https://developers.google.com/maps/documentation/javascript/markers#add
                    var partners = Enumerable.From(self.participants()).Where(function (x) {
                        return !x.isOwner;
                    }).ToArray(), centers = Enumerable.From(self.participants()).Select(function (x) {
                        return x.center;
                    }).ToArray(), LatLngList = Enumerable.From(centers).Select(function (x) {
                        return new google.maps.LatLng(x.latitude, x.longitude);
                    }).ToArray(), map;

                    //  Make an array of the LatLng's of the markers you want to show
                    //var LatLngList = new Array(new google.maps.LatLng(52.537, -2.061), new google.maps.LatLng(52.564, -2.017));
                    //  Create a new viewpoint bound
                    var bounds = new google.maps.LatLngBounds();

                    for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
                        //  And increase the bounds to take this point
                        bounds.extend(LatLngList[i]);
                    }

                    //  Fit these bounds to the map
                    map = new google.maps.Map(document.getElementById("map-canvas"), {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapMaker: true
                    });
                    map.fitBounds(bounds);
                    //$.get($('#agreementPartners_api').text().format(self.agreementId.val))
                    //    .done((response: any): void => {
                    //        var lat = -34.397, long = 150.644, googleMapZoomLevel, mapOptions,
                    //            map;
                    //        if (response[0].center.hasValue) {
                    //            lat = response[0].center.latitude;
                    //            long = response[0].center.longitude;
                    //        }
                    //        googleMapZoomLevel = (response[0].googleMapZoomLevel) ? response[0].googleMapZoomLevel : 8;
                    //        mapOptions = {
                    //            center: new google.maps.LatLng(lat, long),
                    //            zoom: googleMapZoomLevel,
                    //            mapTypeId: google.maps.MapTypeId.ROADMAP
                    //        };
                    //        map = new google.maps.Map(document.getElementById("map-canvas"),
                    //            mapOptions);
                    //    });
                }
                google.maps.event.addDomListener(window, 'load', initialize);
            };
            return PublicView;
        })();
        ViewModels.PublicView = PublicView;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
