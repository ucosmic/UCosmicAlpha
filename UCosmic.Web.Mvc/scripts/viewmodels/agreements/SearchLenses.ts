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
        defaultLense: string = 'map';
        lens: KnockoutObservable<string> = ko.observable(
            sessionStorage.getItem(SearchLenses.LensSessionKey) || this.defaultLense);

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
                summaryApi: this.settings.summaryApi,
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
            var needsLocationSet = initialLocation.indexOf(lensRoute) < 0;
            if (!needsLocationSet) {
                var otherParams = initialLocation.substr(initialLocation.indexOf(lensRoute) + lensRoute.length);
                if (!otherParams || otherParams.length < 2) needsLocationSet = true;
            }
            if (needsLocationSet) {
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
            if (this.lens() == 'table'){
                $(".search_table").addClass("current");
                $(".search_map").removeClass("current");
                return true;
            } else {
                return false;
            } 
        });

        isMapLens: KnockoutComputed<boolean> = ko.computed((): boolean => {
            if (this.lens() == 'map') {
                $(".search_map").addClass("current");
                $(".search_table").removeClass("current");
                return true;
            } else {
                return false;
            } 
        });

        //#endregion
        //#region Sammy Routing

        sammy: Sammy.Application = Sammy();

        private _runSammy(): void {
            // this will run once during construction
            var viewModel = this;

            this.sammy.before(/\#\/table\/(.*)\//, function () {
                viewModel.viewTable();
            });

            this.sammy.before(/\#\/map\/(.*)\//, function () {
                viewModel.viewMap();
            });

            this.sammy.get(
                '#/:lens/',
                function (): void {
                    var e: Sammy.EventContext = this;
                    viewModel.lens(e.params['lens']);
                });
        }

        //#endregion

        private _hasMapBeenResizedOnce = false;

        viewTable(): void {
            if (!this.isTableLens()) {
                this.map.deactivate();
                this.table.countryCode(this.map.countryCode());
                this.lens('table');
                this.table.activate();
            }
        }

        viewMap(): void {
            if (!this.isMapLens()) {
                this.table.deactivate();
                this.map.deactivate();
                this.map.countryCode(this.table.countryCode());
                this.map.loadViewport = 1;
                this.lens('map');
                if (this._hasMapBeenResizedOnce) {
                    this.map.activate();
                }
                else {
                    this.map.triggerMapResize()
                        .done((): void => {
                            this._hasMapBeenResizedOnce = true;
                            this.map.activate();
                        });
                }
            }
        }

        resetFilters(): void {
            this.table.keyword('');
            this.table.countryCode('any');
            this.table.pager.input.pageNumberText('1');
            this.map.continentCode('any');
            this.map.countryCode('any');
            this.map.placeId(0);
            this.map.zoom(1);
            this.map.lat(SearchMap.defaultMapCenter.lat());
            this.map.lng(SearchMap.defaultMapCenter.lng());
        }
    }
}