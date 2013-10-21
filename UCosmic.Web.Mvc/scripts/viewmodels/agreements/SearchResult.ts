/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="Search.ts" />
/// <reference path="ApiModels.d.ts" />

module Agreements.ViewModels {

    export class SearchResult {

        private _owner: Search;

        constructor (values: any, owner: Search) {
            this._owner = owner;
            this._pullData(values);
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

        private _pullData(values: any): void {
            // map input model to observables
            ko.mapping.fromJS(values, {}, this);
        }

        detailHref = ko.computed((): string => {
            return "/agreements/" + this.id();
        });
       
        // show alternate text when country is undefined
        nullDisplayCountryName = ko.computed((): string => {
            return this.countryNames() || '[Unknown]';
        });
        
        startsOnDate = ko.computed((): string => {
            var value = this.startsOn();
            var myDate = new Date(value);
            if (myDate.getFullYear() < 1500) {
                return "unknown";
            } else {
                return (moment(value)).format('M/D/YYYY');
            }
        });
        expiresOnDate = ko.computed((): string => {
            var value = this.expiresOn();
            if (!value) return undefined;
            var myDate = new Date(value);
            if (myDate.getFullYear() < 1500) {
                return "unknown";
            } else {
                return (moment(value)).format('M/D/YYYY');
            }
        });
        
        // navigate to detail page
        clickAction(viewModel: SearchResult, e: JQueryEventObject): boolean {
            return this._owner.clickAction(viewModel, e);
        }
    }
}