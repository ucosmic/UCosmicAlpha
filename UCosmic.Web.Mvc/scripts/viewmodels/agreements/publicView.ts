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

module Agreements.ViewModels {

    export class PublicView {
        constructor(public agreementId = { val: parseInt(window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11)) }) {

            //this.agreementId.val = parseInt(this.myUrl.substring(this.myUrl.indexOf("agreements/") + 11));
            if (isNaN(this.agreementId.val)) {
                this.agreementId.val = 0;
            }
            this.populateFilesClass = new agreements.populateFiles();
            this._setupDateComputeds();
            this._setupNameComputeds();
            this.getData();
        }
        //imported classes
        populateFilesClass;

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
                });
            this.populateFilesClass.populate(this.agreementId);
            this.files = this.populateFilesClass.files;
        }

        //#region Name computeds
        
        private _setupNameComputeds(): void {
            // are the official name and translated name the same?
            this.participantsNames = ko.computed((): string => {
                var myName = "";
                ko.utils.arrayForEach(this.participants(), (item) => {
                    if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName() && item.establishmentOfficialName() != null) {
                        myName += "<strong>" + item.establishmentTranslatedName() + "</strong> (" + item.establishmentOfficialName() + ")";
                    } else if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName()) {
                        myName += "<strong>" + item.establishmentTranslatedName() + "</strong>"; 
                    } else
                    {
                        myName += "<strong>" + item.establishmentOfficialName() + "</strong>";
                    }
                    myName += "<br />";
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
                return (moment(value)).format('YYYY-MM-DD');
            });
            this.expiresOnDate = ko.computed((): string => {
                var value = this.expiresOn();
                var myDate = new Date(value);
                if (myDate.getFullYear() < 1500) {
                    return "unknown";
                } else {
                    return (moment(value)).format('YYYY-MM-DD');
                }
            });
        }
        
        ////#endregion

    }
}