var Agreements;
(function (Agreements) {
    var ViewModels;
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
                this.contacts = ko.mapping.fromJS([]);
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
                    }
                    else {
                        return (moment(value)).format('M/D/YYYY');
                    }
                });
                this._googleMarkers = ko.observableArray();
                if (isNaN(agreementId)) {
                    agreementId = 0;
                }
                this.agreementId = agreementId;
                this.agreementVisibility = agreementVisibility || 'Public';
                this.fileListPopulator = new Agreements.FileListPopulator();
                if (this.agreementId !== 0) {
                    var dataBound = this._bindData();
                    var mapCreated = this._createMap();
                    $.when(dataBound, mapCreated).done(function () {
                        _this._bindMap();
                    });
                }
                this.files = this.fileListPopulator.files;
                this.fileListPopulator.populate(this.agreementId);
                this.populateContacts();
                if (sessionStorage.getItem("agreementSaved") == "yes") {
                    sessionStorage.setItem("agreementSaved", "no");
                    App.flasher.flash("Agreement saved");
                }
            }
            PublicView.prototype.fileHref = function (parent, data) {
                return '/api/agreements/' + parent.agreementId + '/files/' + data.id() + '/content/';
            };
            PublicView.prototype.fileDownloadHref = function (parent, data) {
                return '/api/agreements/' + parent.agreementId + '/files/' + data.id() + '/download/';
            };
            PublicView.prototype._bindData = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Agreements.get(this.agreementId))
                    .done(function (response) {
                    var mapping = {
                        participants: {
                            create: function (options) {
                                return options.data;
                            }
                        },
                    };
                    ko.mapping.fromJS(response, mapping, _this);
                    _this.participants(Enumerable.From(_this.participants())
                        .OrderBy(function (x) {
                        return x.isOwner;
                    })
                        .ThenBy(function (x) {
                        return x.establishmentTranslatedName;
                    })
                        .ToArray());
                    _this.isBound(true);
                    deferred.resolve();
                });
                return deferred;
            };
            PublicView.prototype._createMap = function () {
                google.maps.visualRefresh = true;
                var options = {
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: new google.maps.LatLng(0, 0),
                    zoom: 1,
                    draggable: true,
                    scrollwheel: false,
                    streetViewControl: false,
                    panControl: false,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                    },
                };
                this._googleMap = new google.maps.Map(document.getElementById("map-canvas"), options);
                var deferred = $.Deferred();
                google.maps.event.addListenerOnce(this._googleMap, 'idle', function () {
                    deferred.resolve();
                });
                return deferred;
            };
            PublicView.prototype._bindMap = function () {
                var _this = this;
                var partners = Enumerable.From(this.participants())
                    .Where(function (x) { return !x.isOwner; }).ToArray();
                var centers = Enumerable.From(partners)
                    .Where(function (x) { return x.center && x.center.hasValue; })
                    .Select(function (x) { return x.center; }).ToArray();
                var latLngs = Enumerable.From(centers)
                    .Select(function (x) { return new google.maps.LatLng(x.latitude, x.longitude); })
                    .ToArray();
                var bounds = new google.maps.LatLngBounds();
                $.each(latLngs, function (index, latLng) {
                    var title = Enumerable.From(partners)
                        .Single(function (x) {
                        return x.center && x.center == centers[index];
                    }).establishmentTranslatedName;
                    var options = {
                        map: _this._googleMap,
                        position: latLng,
                        title: title,
                    };
                    var marker = new google.maps.Marker(options);
                    bounds.extend(latLng);
                    _this._googleMarkers.push(marker);
                });
                if (centers.length == 1) {
                    this._googleMap.setCenter(latLngs[0]);
                    var partner = Enumerable.From(partners)
                        .Single(function (x) {
                        return x.center && x.center == centers[0];
                    });
                    var zoom = partner.googleMapZoomLevel;
                    if (zoom) {
                        this._googleMap.setZoom(zoom);
                    }
                    else if (partner.boundingBox && partner.boundingBox.hasValue) {
                        bounds = new google.maps.LatLngBounds(new google.maps.LatLng(partner.boundingBox.southWest.latitude, partner.boundingBox.southWest.longitude), new google.maps.LatLng(partner.boundingBox.northEast.latitude, partner.boundingBox.northEast.longitude));
                        this._googleMap.fitBounds(bounds);
                        this._googleMap.setCenter(latLngs[0]);
                    }
                }
                else if (centers.length > 0) {
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
            PublicView.prototype.createMap = function () {
                var self = this;
                function initialize() {
                    var partners = Enumerable.From(self.participants())
                        .Where(function (x) {
                        return !x.isOwner;
                    }).ToArray(), centers = Enumerable.From(self.participants())
                        .Select(function (x) {
                        return x.center;
                    }).ToArray(), LatLngList = Enumerable.From(centers)
                        .Select(function (x) {
                        return new google.maps.LatLng(x.latitude, x.longitude);
                    }).ToArray(), map;
                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
                        bounds.extend(LatLngList[i]);
                    }
                    map = new google.maps.Map(document.getElementById("map-canvas"), {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapMaker: true,
                    });
                    map.fitBounds(bounds);
                }
                google.maps.event.addDomListener(window, 'load', initialize);
            };
            PublicView.prototype.populateContacts = function () {
                var _this = this;
                $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId))
                    .done(function (response) {
                    ko.mapping.fromJS(response, _this.contacts);
                });
            };
            return PublicView;
        })();
        ViewModels.PublicView = PublicView;
    })(ViewModels = Agreements.ViewModels || (Agreements.ViewModels = {}));
})(Agreements || (Agreements = {}));
