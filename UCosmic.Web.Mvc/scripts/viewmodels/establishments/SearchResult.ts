/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="ServerApiModel.d.ts" />

module ViewModels.Establishments {

    export class SearchResult {

        // computed observables
        nullDisplayCountryName: KnockoutComputed;
        fitOfficialUrl: KnockoutComputed;
        officialNameMatchesTranslation: KnockoutComputed;
        officialNameDoesNotMatchTranslation: KnockoutComputed;

        constructor (values: IServerApiModel) {

            // map input model to observables
            ko.mapping.fromJS(values, {}, this);

            // show alternate text when country is undefined
            this.nullDisplayCountryName = ko.computed((): string => {
                return this.countryName() || '[Undefined]';
            });

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

            // are the official name and translated name the same?
            this.officialNameMatchesTranslation = ko.computed((): bool => {
                return this.officialName() === this.translatedName();
            });
            this.officialNameDoesNotMatchTranslation = ko.computed((): bool => {
                return !this.officialNameMatchesTranslation();
            });
        }

        // api model properties are mapped to observables
        id: KnockoutObservableNumber;
        officialName: KnockoutObservableString;
        translatedName: KnockoutObservableString;
        officialUrl: KnockoutObservableString;
        countryName: KnockoutObservableString;
        countryCode: KnockoutObservableString;
        uCosmicCode: KnockoutObservableString;
        ceebCode: KnockoutObservableString;

        // navigate to detail page
        clickAction(viewModel: SearchResult, e: JQueryEventObject): void {
            var href, $target = $(e.target);
            while ($target.length && !$target.attr('href') && !$target.attr('data-href')) {
                $target = $target.parent();
            }
            if ($target.length) {
                href = $target.attr('href') || $target.attr('data-href');
                location.href = href.replace('/0/', '/' + this.id() + '/');
            }
        }

        // open official URL page
        openOfficialUrl(viewModel: SearchResult, e: JQueryEventObject): bool {
            e.stopPropagation();
            return true;
        }
    }
}