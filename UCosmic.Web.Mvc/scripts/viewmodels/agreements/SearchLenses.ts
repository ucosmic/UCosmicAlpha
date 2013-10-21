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
        partnersApi: string;
        graphicsCircleApi: string;
        summaryApi: string;
    }

    export class SearchLenses {
        //#region Lenses

        table: SearchTable;
        map: SearchMap;
        lens: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchLenses.LensSessionKey) || 'table');

        static LensSessionKey = 'AgreementSearchLens';

        private _inputChanged: KnockoutComputed<void> = ko.computed((): void => {

            sessionStorage.setItem(SearchLenses.LensSessionKey, this.lens());
        }).extend({ throttle: 0, });

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
                partnersApi: this.settings.partnersApi,
                graphicsCircleApi: this.settings.graphicsCircleApi,
                summaryApi: this.settings.summaryApi,
            });

            this.sammy.run();
            var initialLocation = this.sammy.getLocation();
            var lensRoute = '#/{0}/'.format(this.lens());
            if (initialLocation.indexOf(lensRoute) < 0) {
                if (this.isTableLens()) {
                    this.table.setLocation();
                    this.table.activate();
                }
                else if (this.isMapLens()) {
                    this.map.setLocation();
                    this.map.activate();
                }
            }
        }

        //#endregion
        //#region Lensing Computeds

        isTableLens: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.lens() == 'table';
        });

        isMapLens: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.lens() == 'map';
        });

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application = Sammy();

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            this.sammy.before(/\#\/table\/(.*)\//, function () {
                viewModel.lens('table');
            });

            this.sammy.before(/\#\/map\/(.*)\//, function () {
                viewModel.lens('map');
            });

            this.sammy.get(
                '#/:lens/',
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel.lens(e.params['lens']);
                });
        }

        //#endregion

        viewTable(): void {
            if (!this.isTableLens()) {
                this.lens('table');
                this.map.deactivate();
                this.table.countryCode(this.map.countryCode());
                this.table.activate();
            }
        }

        viewMap(): void {
            if (!this.isMapLens()) {
                this.lens('map');
                this.table.deactivate();
                this.map.countryCode(this.table.countryCode());
                this.map.activate();
            }
        }

        resetFilters(): void {
            this.table.keyword('');
            this.table.countryCode('any');
            this.table.pager.input.pageNumberText('1');
            this.map.continentCode('any');
            this.map.countryCode('any');
            this.map.placeId(0);
        }
    }
}