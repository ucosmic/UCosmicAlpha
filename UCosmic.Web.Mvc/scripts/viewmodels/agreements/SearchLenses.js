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
                this.lens = ko.observable(sessionStorage.getItem(SearchLenses.LensSessionKey) || 'map');
                //#endregion
                //#region Lensing Computeds
                this.isTableLens = ko.computed(function () {
                    return _this.lens() === 'table';
                });
                this.isMapLens = ko.computed(function () {
                    return _this.lens() === 'map';
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
                    graphicsCircleApi: this.settings.graphicsCircleApi,
                    summaryApi: this.settings.summaryApi
                });

                this.table.countryCode.subscribe(function (newValue) {
                    var mapCountry = _this.map.countryCode();
                    if (mapCountry != newValue)
                        _this.map.countryCode(newValue);
                });

                this.map.countryCode.subscribe(function (newValue) {
                    var tableCountry = _this.table.countryCode();
                    if (tableCountry != newValue)
                        _this.table.countryCode(newValue);
                });

                this.sammy.run();
                var initialLocation = this.sammy.getLocation();
                var lensRoute = '#/{0}/'.format(this.lens());
                if (initialLocation.indexOf(lensRoute) < 0) {
                    this.sammy.setLocation(lensRoute);
                }
            }
            SearchLenses.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                this.sammy.get('#/:lens/', function () {
                    var e = this;
                    viewModel._onRoute(e);
                });
            };

            SearchLenses.prototype._onRoute = function (e) {
                var lens = e.params['lens'];
                this.lens(lens);
                if (this.isTableLens()) {
                    this.table.onBeforeActivation(e);
                } else if (this.isMapLens()) {
                    this.map.onBeforeActivation(e);
                }
            };
            SearchLenses.LensSessionKey = 'AgreementSearchLens';
            return SearchLenses;
        })();
        ViewModels.SearchLenses = SearchLenses;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
