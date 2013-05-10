/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="Search.ts" />
/// <reference path="ServerApiModel.d.ts" />

module ViewModels.Establishments {

    export class SearchResult {

        private _owner: Search;

        constructor (values: IServerApiFlatModel, owner: Search) {
            this._owner = owner;
            this._pullData(values);
            this._setupComputeds();
        }

        //#region Observable data

        id: KnockoutObservableNumber;
        officialName: KnockoutObservableString;
        translatedName: KnockoutObservableString;
        officialUrl: KnockoutObservableString;
        countryName: KnockoutObservableString;
        countryCode: KnockoutObservableString;
        uCosmicCode: KnockoutObservableString;
        ceebCode: KnockoutObservableString;

        private _pullData(values: IServerApiFlatModel): void {
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

        nullDisplayCountryName: KnockoutComputed;

        private _setupCountryComputeds(): void {
            // show alternate text when country is undefined
            this.nullDisplayCountryName = ko.computed((): string => {
                return this.countryName() || '[Undefined]';
            });
        }

        //#endregion
        //#region Url computeds

        fitOfficialUrl: KnockoutComputed;
        officialUrlTooltip: KnockoutComputed;

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

        officialNameMatchesTranslation: KnockoutComputed;
        officialNameDoesNotMatchTranslation: KnockoutComputed;

        private _setupNameComputeds(): void {
            // are the official name and translated name the same?
            this.officialNameMatchesTranslation = ko.computed((): bool => {
                return this.officialName() === this.translatedName();
            });
            this.officialNameDoesNotMatchTranslation = ko.computed((): bool => {
                return !this.officialNameMatchesTranslation();
            });
        }

        //#endregion
        //#region Link computeds

        detailHref: KnockoutComputed;
        detailTooltip: KnockoutComputed;

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
        clickAction(viewModel: SearchResult, e: JQueryEventObject): bool {
            return this._owner.clickAction(viewModel, e);
        }
         
        // open official URL page
        openOfficialUrl(viewModel: SearchResult, e: JQueryEventObject): bool {
            e.stopPropagation();
            return true;
        }

        //#endregion
    }
}