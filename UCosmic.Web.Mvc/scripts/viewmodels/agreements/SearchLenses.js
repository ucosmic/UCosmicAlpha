var Agreements;
(function (Agreements) {
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="SearchTable.ts" />
    /// <reference path="SearchMap.ts" />
    (function (ViewModels) {
        var SearchLenses = (function () {
            //#endregion
            //#region Construction & Initialization
            function SearchLenses(settings) {
                var _this = this;
                this.settings = settings;
                this.lens = ko.observable(sessionStorage.getItem(SearchLenses.LensSessionKey) || 'table');
                this._inputChanged = ko.computed(function () {
                    sessionStorage.setItem(SearchLenses.LensSessionKey, _this.lens());
                }).extend({ throttle: 0 });
                //#endregion
                //#region Lensing Computeds
                this.isTableLens = ko.computed(function () {
                    return _this.lens() == 'table';
                });
                this.isMapLens = ko.computed(function () {
                    return _this.lens() == 'map';
                });
                //#endregion
                //#region Sammy Routing
                this.sammy = Sammy();
                this._runSammy();
                this.table = new ViewModels.SearchTable({
                    element: undefined,
                    domain: this.settings.domain,
                    visibility: this.settings.visibility,
                    route: 'table',
                    activationRoute: '#/table/',
                    detailUrl: this.settings.detailUrl,
                    sammy: this.sammy
                });
                this.map = new ViewModels.SearchMap({
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
                    summaryApi: this.settings.summaryApi
                });

                this.sammy.run();
                var initialLocation = this.sammy.getLocation();
                var lensRoute = '#/{0}/'.format(this.lens());
                if (initialLocation.indexOf(lensRoute) < 0) {
                    if (this.isTableLens()) {
                        this.table.setLocation();
                        this.table.activate();
                    } else if (this.isMapLens()) {
                        this.map.setLocation();
                        this.map.activate();
                    }
                }
            }
            SearchLenses.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                this.sammy.before(/\#\/table\/(.*)\//, function () {
                    viewModel.lens('table');
                });

                this.sammy.before(/\#\/map\/(.*)\//, function () {
                    viewModel.lens('map');
                });

                this.sammy.get('#/:lens/', function () {
                    var e = this;
                    viewModel.lens(e.params['lens']);
                });
            };

            //#endregion
            SearchLenses.prototype.viewTable = function () {
                if (!this.isTableLens()) {
                    this.lens('table');
                    this.map.deactivate();
                    this.table.countryCode(this.map.countryCode());
                    this.table.activate();
                }
            };

            SearchLenses.prototype.viewMap = function () {
                if (!this.isMapLens()) {
                    this.lens('map');
                    this.table.deactivate();
                    this.map.countryCode(this.table.countryCode());
                    this.map.activate();
                }
            };

            SearchLenses.prototype.resetFilters = function () {
                this.table.keyword('');
                this.table.countryCode('any');
                this.table.pager.input.pageNumberText('1');
                this.map.continentCode('any');
                this.map.countryCode('any');
                this.map.placeId(0);
            };
            SearchLenses.LensSessionKey = 'AgreementSearchLens';
            return SearchLenses;
        })();
        ViewModels.SearchLenses = SearchLenses;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
