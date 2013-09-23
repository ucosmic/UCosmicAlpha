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
        officialName: KnockoutObservable<string>;
        translatedName: KnockoutObservable<string>;
        officialUrl: KnockoutObservable<string>;
        countryName: KnockoutObservable<string>;
        countryCode: KnockoutObservable<string>;
        uCosmicCode: KnockoutObservable<string>;
        ceebCode: KnockoutObservable<string>;
        startsOn: KnockoutObservable<string>;
        expiresOn: KnockoutObservable<string>;
        startsOnDateVisible = ko.observable(true);
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
        }

        //#region Country computeds

        nullDisplayCountryName: KnockoutComputed<string>;
        
        private _setupCountryComputeds(): void {
            // show alternate text when country is undefined
            this.nullDisplayCountryName = ko.computed((): string => {
                return '[undefined]';
                //return this.countryName() || '[Undefined]';
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
                    this.startsOnDateVisible(false)
                }
                return (moment(value)).format('MMMM Do YYYY');
            });
            this.expiresOnDate = ko.computed((): string => {
                var value = this.expiresOn();
                var myDate = new Date(value);
                if (myDate.getFullYear() < 1500) {
                    return "Open Ended";
                } else {
                    return (moment(value)).format('MMMM Do YYYY');
                }
            });
        }
        
        ////#endregion
        
        //#region Click handlers

        // navigate to detail page
        clickAction(viewModel: SearchResult, e: JQueryEventObject): boolean {
            return this._owner.clickAction(viewModel, e);
        }
         
        // open official URL page
        //openOfficialUrl(viewModel: SearchResult, e: JQueryEventObject): boolean {
        //    e.stopPropagation();
        //    return true;
        //}

        //#endregion
    }
}