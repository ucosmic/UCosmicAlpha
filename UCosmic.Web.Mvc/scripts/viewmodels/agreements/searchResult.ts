/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="Search.ts" />
/// <reference path="ApiModels.d.ts" />

module Agreements.ViewModels {

    export class SearchResult {

        private _owner: Search;

        constructor (values: ApiModels.FlatEstablishment, owner: Search) {
            this._owner = owner;
            this._pullData(values);
            this._setupComputeds();
        }

        //#region Observable data

        id: KnockoutObservable<number>;
        establishmentOfficialName: KnockoutObservable<string>;
        establishmentTranslatedName: KnockoutObservable<string>;
        officialUrl: KnockoutObservable<string>;
        countryNames: KnockoutObservable<string>;
        countryCode: KnockoutObservable<string>;
        uCosmicCode: KnockoutObservable<string>;
        ceebCode: KnockoutObservable<string>;
        startsOn: KnockoutObservable<string>;
        expiresOn: KnockoutObservable<string>;
        name: KnockoutObservable<string>;

        private _pullData(values: ApiModels.FlatEstablishment): void {
            // map input model to observables
            ko.mapping.fromJS(values, {}, this);
        }

        //#endregion
        //#region Computeds

        private _setupComputeds(): void {
            this._setupCountryComputeds();
            this._setupDateComputeds();
            this._setupNameComputeds();
            this._setupLinkComputeds();
        }

        //#region Link computeds

        detailHref: KnockoutComputed<string>;

        private _setupLinkComputeds(): void {
            // show alternate text when Link is undefined
            this.detailHref = ko.computed((): string => {
                return "/agreements/"+this.id();
            });
        }

        //#endregion

        //#region Country computeds

        nullDisplayCountryName: KnockoutComputed<string>;
        
        private _setupCountryComputeds(): void {
            // show alternate text when country is undefined
            this.nullDisplayCountryName = ko.computed((): string => {
                return this.countryNames() || '[Unknown]';
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

        //#region Name computeds

        participantsNames: KnockoutComputed<string>;

        private _setupNameComputeds(): void {
            // are the official name and translated name the same?
            this.participantsNames = ko.computed((): string => {
                var myName = "";
                $.each(this.establishmentOfficialName(), (i, item) => {
                    //myName += this.establishmentOfficialName()[i];
                    if (this.establishmentTranslatedName()[i] != null && this.establishmentOfficialName()[i] != this.establishmentTranslatedName()[i]) {
                       // myName += "<strong>" + this.establishmentTranslatedName()[i] + "</strong> (" + this.establishmentOfficialName()[i] + ")"; 
                        myName += "<strong title='" + this.establishmentOfficialName()[i] + "'>" + this.establishmentTranslatedName()[i] + "</strong>"; 
                    } else
                    {
                        myName += "<strong>" + this.establishmentOfficialName()[i] + "</strong>";
                    }
                    myName += "<br />";
                });
                return myName;
            });
        }

        //#endregion

        //#region Click handlers

        // navigate to detail page
        clickAction(viewModel: SearchResult, e: JQueryEventObject): boolean {
            return this._owner.clickAction(viewModel, e);
        }

        //#endregion
    }
}