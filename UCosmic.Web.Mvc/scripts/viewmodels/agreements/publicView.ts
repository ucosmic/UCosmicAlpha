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

module Agreements.ViewModels {

    export class PublicView {
        constructor(agreementId: number, agreementVisibility: string) {
            if (isNaN(agreementId)) {
                agreementId = 0;
            }
            this.agreementId = { val: agreementId, };
            this.agreementVisibility = agreementVisibility || 'Public';
            this.populateFilesClass = new agreements.populateFiles();
            this._setupDateComputeds();
            this._setupNameComputeds();
            if (this.agreementId.val !== 0) {
                this.getData();
                this.createMap();
            }
        }
        //imported classes
        populateFilesClass;

        agreementId: any;
        agreementVisibility: string;
        isBound = ko.observable(false);
        files = ko.observableArray();
        content = ko.observable();
        expiresOn = ko.observable();
        isAutoRenew = ko.observable();
        status = ko.observable();
        isExpirationEstimated = ko.observable();
        name = ko.observable();
        notes = ko.observable();
        participants = ko.observableArray();
        startsOn = ko.observable();
        type = ko.observable();
        umbrellaId = ko.observable();
        participantsNames: KnockoutComputed<string>;
        myUrl = window.location.href.toLowerCase();
        partners;
        //agreementId = { val: 0 }

        getData(): void {
            $.get(App.Routes.WebApi.Agreements.get(this.agreementId.val))
                .done((response: any): void => {
                    this.content(response.content);
                    this.expiresOn(response.expiresOn);
                    this.isAutoRenew(response.isAutoRenew);
                    this.status(response.status);
                    this.isExpirationEstimated(response.isExpirationEstimated);
                    this.name(response.name);
                    this.notes(response.notes);
                    ko.mapping.fromJS(response.participants, {}, this.participants);
                    this.startsOn(response.startsOn);
                    this.type(response.type);
                    this.umbrellaId(response.umbrellaId);
                    this.isBound(true);
                    this.partners = response.participants;
                });
            this.populateFilesClass.populate(this.agreementId);
            this.files = this.populateFilesClass.files;
        }

        //#region Name computeds

        // TODO: do not create view elements in the viewmodel like this. do it with bindings.
        // see the removed participantsNames computed in searchResult.ts for reference.
        private _setupNameComputeds(): void {
            // are the official name and translated name the same?
            this.participantsNames = ko.computed((): string => {
                var myName = "";
                ko.utils.arrayForEach(this.participants(), (item) => {
                    myName += "<div style='margin-bottom:10px'>"
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
        }

        //#endregion

        //#region Date computeds

        startsOnDate: KnockoutComputed<string>;
        expiresOnDate: KnockoutComputed<string>;

        private _setupDateComputeds(): void {
            this.startsOnDate = ko.computed((): string => {
                var value = this.startsOn();
                var myDate = new Date(value);
                if (myDate.getFullYear() < 1500) {
                    return "unknown";
                }
                return (moment(value)).format('M/D/YYYY');
            });
            this.expiresOnDate = ko.computed((): string => {
                var value = this.expiresOn();
                var myDate = new Date(value);
                if (myDate.getFullYear() < 1500) {
                    return "unknown";
                } else {
                    return (moment(value)).format('M/D/YYYY');
                }
            });
        }

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

        createMap(): void {
            var self = this;
            function initialize() {
                //https://developers.google.com/maps/documentation/javascript/markers#add
                var partners = Enumerable.From(self.partners)
                    .Where(function (x) {
                            return !x.isOwner
                        }).ToArray(),
                    centers = Enumerable.From(partners)
                        .Select(function (x) {
                            return x.center;
                        }).ToArray(),
                    LatLngList = Enumerable.From(centers)
                        .Select(function (x) {
                            return new google.maps.LatLng(x.latitude, x.longitude);
                        }).ToArray(), map;
                //  Make an array of the LatLng's of the markers you want to show
                //var LatLngList = new Array(new google.maps.LatLng(52.537, -2.061), new google.maps.LatLng(52.564, -2.017));
                //  Create a new viewpoint bound
                var bounds = new google.maps.LatLngBounds();
                //  Go through each...
                for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
                    //  And increase the bounds to take this point
                    bounds.extend(LatLngList[i]);
                }
                //  Fit these bounds to the map
                map = new google.maps.Map(document.getElementById("map-canvas"), { mapTypeId: google.maps.MapTypeId.ROADMAP, mapMaker: true })
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
        }
    }
}