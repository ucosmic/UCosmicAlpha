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
    (function (ViewModels) {
        var PublicView = (function () {
            function PublicView(agreementId) {
                if (typeof agreementId === "undefined") { agreementId = { val: parseInt(window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11)) }; }
                this.agreementId = agreementId;
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
                if (isNaN(this.agreementId.val)) {
                    this.agreementId.val = 0;
                }
                this.populateFilesClass = new agreements.populateFiles();
                this._setupDateComputeds();
                this._setupNameComputeds();
                this.getData();
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
                });
                this.populateFilesClass.populate(this.agreementId);
                this.files = this.populateFilesClass.files;
            };

            //#region Name computeds
            PublicView.prototype._setupNameComputeds = function () {
                var _this = this;
                // are the official name and translated name the same?
                this.participantsNames = ko.computed(function () {
                    var myName = "";
                    ko.utils.arrayForEach(_this.participants(), function (item) {
                        if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName() && item.establishmentOfficialName() != null) {
                            myName += "<strong>" + item.establishmentTranslatedName() + "</strong> (" + item.establishmentOfficialName() + ")";
                        } else if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName()) {
                            myName += "<strong>" + item.establishmentTranslatedName() + "</strong>";
                        } else {
                            myName += "<strong>" + item.establishmentOfficialName() + "</strong>";
                        }
                        myName += "<br />";
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
                    return (moment(value)).format('YYYY-MM-DD');
                });
                this.expiresOnDate = ko.computed(function () {
                    var value = _this.expiresOn();
                    var myDate = new Date(value);
                    if (myDate.getFullYear() < 1500) {
                        return "unknown";
                    } else {
                        return (moment(value)).format('YYYY-MM-DD');
                    }
                });
            };
            return PublicView;
        })();
        ViewModels.PublicView = PublicView;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
