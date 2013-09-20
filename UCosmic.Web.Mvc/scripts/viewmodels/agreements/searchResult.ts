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

        private _pullData(values: ApiModels.FlatEstablishment): void {
            // map input model to observables
            ko.mapping.fromJS(values, {}, this);
        }

        //#endregion
        //#region Computeds

        private _setupComputeds(): void {
            this._setupCountryComputeds();
            this._setupUrlComputeds();
            this._setupNameComputeds();
            this._setupLinkComputeds();
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
        //#region Url computeds

        fitOfficialUrl: KnockoutComputed<string>;
        officialUrlTooltip: KnockoutComputed<string>;

        private _setupUrlComputeds(): void {

            // compact URL so that it fits within page width
            this.fitOfficialUrl = ko.computed((): string => {
                var value = this.officialUrl();
                if (!value) return value;

                var computedValue = value;
                var protocolIndex = computedValue.indexOf('://');
                if (protocolIndex > 0)
                    computedValue = computedValue.substr(protocolIndex + 3);
                var slashIndex = computedValue.indexOf('/');
                if (slashIndex > 0) {
                    if (slashIndex < computedValue.length - 1) {
                        computedValue = computedValue.substr(slashIndex + 1);
                        computedValue = value.substr(0, value.indexOf(computedValue)) + '...';
                    }
                }
                return computedValue;
            });

            // inform user what clicking the link does
            this.officialUrlTooltip = ko.computed((): string => {
                var value = this.fitOfficialUrl();
                if (!value) return value;

                var computedValue = 'Visit ' + value + ' (opens a new window)';
                return computedValue;
            });
        }


        //#endregion
        //#region Name computeds

        officialNameMatchesTranslation: KnockoutComputed<boolean>;
        officialNameDoesNotMatchTranslation: KnockoutComputed<boolean>;

        private _setupNameComputeds(): void {
            // are the official name and translated name the same?
            this.officialNameMatchesTranslation = ko.computed((): boolean => {
                return this.officialName() === this.translatedName();
            });
            this.officialNameDoesNotMatchTranslation = ko.computed((): boolean => {
                return !this.officialNameMatchesTranslation();
            });
        }

        //#endregion
        //#region Link computeds

        detailHref: KnockoutComputed<string>;
        detailTooltip: KnockoutComputed<string>;

        private _setupLinkComputeds(): void {
            
            // href to navigate from search to detail / edit page
            this.detailHref = ko.computed((): string => {
                return this._owner.detailHref(this.id());
            });

            // tooltip for link to detail / edit page
            this.detailTooltip = ko.computed((): string => {
                return this._owner.detailTooltip();
            });
        }

        //#endregion

        //#endregion
        //#region Click handlers

        // navigate to detail page
        clickAction(viewModel: SearchResult, e: JQueryEventObject): boolean {
            return this._owner.clickAction(viewModel, e);
        }
         
        // open official URL page
        openOfficialUrl(viewModel: SearchResult, e: JQueryEventObject): boolean {
            e.stopPropagation();
            return true;
        }

        //#endregion
    }
}