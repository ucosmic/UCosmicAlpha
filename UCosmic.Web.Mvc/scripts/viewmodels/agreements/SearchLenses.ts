/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="SearchTable.ts" />
/// <reference path="SearchMap.ts" />

module Agreements.ViewModels {

    export interface SearchLensSettings {
        element: Element;
        domain: string;
        visibility: string;
        route: string;
        activationRoute?: string;
        detailUrl: string;
        partnerPlacesApi: string;
        graphicsCircleApi: string;
        summaryApi: string;
    }

    export class SearchLenses {
        //#region Lenses

        table: SearchTable;
        map: SearchMap;
        lens: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchLenses.LensSessionKey) || 'map');

        static LensSessionKey = 'AgreementSearchLens';

        //#endregion
        //#region Construction & Initialization

        constructor(public settings: SearchLensSettings) {
            this._runSammy();
            this.table = new SearchTable({
                element: undefined,
                domain: this.settings.domain,
                visibility: this.settings.visibility,
                route: 'table',
                activationRoute: '#/table/',
                detailUrl: this.settings.detailUrl,
                sammy: this.sammy,
            });
            this.map = new SearchMap({
                element: undefined,
                domain: this.settings.domain,
                visibility: this.settings.visibility,
                route: 'map',
                activationRoute: '#/map/',
                detailUrl: this.settings.detailUrl,
                sammy: this.sammy,
                partnerPlacesApi: this.settings.partnerPlacesApi,
                graphicsCircleApi: this.settings.graphicsCircleApi,
                summaryApi: this.settings.summaryApi,
            });

            this.table.countryCode.subscribe((newValue: string): void => {
                var mapCountry = this.map.countryCode();
                if (mapCountry != newValue) this.map.countryCode(newValue);
            });

            this.map.countryCode.subscribe((newValue: string): void => {
                var tableCountry = this.table.countryCode();
                if (tableCountry != newValue) this.table.countryCode(newValue);
            });

            this.sammy.run();
            var initialLocation = this.sammy.getLocation();
            var lensRoute = '#/{0}/'.format(this.lens());
            if (initialLocation.indexOf(lensRoute) < 0) {
                this.sammy.setLocation(lensRoute);
            }
        }

        //#endregion
        //#region Lensing Computeds

        isTableLens: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.lens() === 'table';
        });

        isMapLens: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.lens() === 'map';
        });

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application = Sammy();

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            this.sammy.get(
                '#/:lens/',
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel._onRoute(e);
                });
        }

        private _onRoute(e: Sammy.EventContext): void {
            var lens = e.params['lens'];
            this.lens(lens);
            if (this.isTableLens()) {
                this.table.onBeforeActivation(e);
            }
            else if (this.isMapLens()) {
                this.map.onBeforeActivation(e);
            }
        }

        //#endregion
    }
}