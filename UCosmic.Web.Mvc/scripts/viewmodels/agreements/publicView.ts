/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/globalize/globalize.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />

module Agreements.ViewModels {


    export class PublicView {
        constructor(public initDefaultPageRoute: boolean = true) {
            this.getData();
            this._setupNameComputeds();
            this._setupDateComputeds();
        }

        content = ko.observable();
        expiresOn = ko.observable();
        isAutoRenew = ko.observable();
        isExpirationEstimated = ko.observable();
        name = ko.observable();
        notes = ko.observable();
        participants = ko.observableArray();
        startsOn = ko.observable();
        type = ko.observable();
        umbrellaId = ko.observable();
        participantsNames: KnockoutComputed<string>;

        myUrl = window.location.href.toLowerCase();
        agreementId = parseInt(this.myUrl.substring(this.myUrl.indexOf("agreements/") + 11));

        getData(): void {
            $.get(App.Routes.WebApi.Agreements.get(this.agreementId))
                .done((response: any): void => {
                    this.content(response.content);
                    this.expiresOn(response.expiresOn);
                    this.isAutoRenew(response.isAutoRenew);
                    this.isExpirationEstimated(response.isExpirationEstimated);
                    this.name(response.name);
                    this.notes(response.notes);
                    this.participants = ko.mapping.fromJS(response.participants);
                    this.startsOn(response.startsOn);
                    this.type(response.type);
                    this.umbrellaId(response.umbrellaId);
                });
        }
        //#region Name computeds
        
        private _setupNameComputeds(): void {
            // are the official name and translated name the same?
            this.participantsNames = ko.computed((): string => {
                var myName = "";
                $.each(this.participants(), (i, item) => {
                    //myName += this.establishmentOfficialName()[i];
                    if (item.establishmentTranslatedName() != null && item.establishmentOfficialName() != item.establishmentTranslatedName()) {
                        myName += "<strong>" + item.establishmentTranslatedName() + "</strong> (" + item.establishmentOfficialName() + ")"; 
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

        // go to add new
        gotoAddBack(): boolean {
            return true;
        }

        // go to add new
        gotoAddEdit(): boolean {
            return true;
        }
    }
}