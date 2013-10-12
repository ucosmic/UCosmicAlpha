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
                if (isNaN(agreementId)) {
                    agreementId = 0;
                }
                this.agreementId = { val: agreementId };
                this.agreementVisibility = agreementVisibility || 'Public';
                this.populateFilesClass = new agreements.populateFiles();
                this._setupDateComputeds();
                this._setupNameComputeds();
                if (this.agreementId.val !== 0) {
                    this.getData();
                    this.createMap();
                }
            }
            //agreementId = { val: 0 }
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
                    _this.partners = response.participants;
                });
                this.populateFilesClass.populate(this.agreementId);
                this.files = this.populateFilesClass.files;
            };

            //#region Name computeds
            // TODO: do not create view elements in the viewmodel like this. do it with bindings.
            // see the removed participantsNames computed in searchResult.ts for reference.
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

            ////#endregion
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
                    var partners = Enumerable.From(self.partners).Where(function (x) {
                        return !x.isOwner;
                    }).ToArray(), centers = Enumerable.From(partners).Select(function (x) {
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
                    map = new google.maps.Map(document.getElementById("map-canvas"), { mapTypeId: google.maps.MapTypeId.ROADMAP, mapMaker: true });
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
