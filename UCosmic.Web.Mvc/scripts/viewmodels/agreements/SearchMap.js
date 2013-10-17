var Agreements;
(function (Agreements) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/linq/linq.d.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../../app/Pagination.d.ts" />
    /// <reference path="../../app/Pager.ts" />
    /// <reference path="../places/ApiModels.d.ts" />
    (function (ViewModels) {
        var SearchMap = (function () {
            //#endregion
            //#region Construction & Initialization
            function SearchMap(settings) {
                var _this = this;
                this.settings = settings;
                //#region Search Filter Inputs
                // throttle keyword to reduce number API requests
                this.keyword = ko.observable(sessionStorage.getItem(SearchMap.KeywordSessionKey) || '');
                this.keywordThrottled = ko.computed(this.keyword).extend({ throttle: 400 });
                // instead of throttling, both this and the options are observed
                this.countryCode = ko.observable(sessionStorage.getItem(SearchMap.CountrySessionKey) || 'any');
                this.zoom = ko.observable(parseInt(sessionStorage.getItem(SearchMap.ZoomSessionKey)) || 1);
                this.lat = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LatSessionKey)) || 0.0);
                this.lng = ko.observable(parseInt(sessionStorage.getItem(SearchMap.LngSessionKey)) || 0.0);
                // automatically save the search inputs to session when they change
                this._inputChanged = ko.computed(function () {
                    if (_this.countryCode() == undefined)
                        _this.countryCode('any');

                    sessionStorage.setItem(SearchMap.KeywordSessionKey, _this.keyword() || '');
                    sessionStorage.setItem(SearchMap.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(SearchMap.ZoomSessionKey, _this.zoom().toString());
                    sessionStorage.setItem(SearchMap.LatSessionKey, _this.lat().toString());
                    sessionStorage.setItem(SearchMap.LngSessionKey, _this.lng().toString());
                }).extend({ throttle: 0 });
                ////#endregion
                //#region Country Filter Options
                // initial options show loading message
                this.countryOptions = ko.observableArray([{ code: 'any', name: '[Loading...]' }]);
                this._countryChanged = ko.computed(function () {
                    _this._onCountryChanged();
                });
                this.routeFormat = '#/{0}/country/{4}/zoom/{1}/latitude/{2}/longitude/{3}/'.format(this.settings.route).replace('{4}', '{0}');
                this._isActivated = ko.observable(false);
                this._route = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeRoute();
                });
                this._loadCountryOptions();
                this.sammy = this.settings.sammy || Sammy();
                this._runSammy();
            }
            SearchMap.prototype._onCountryChanged = function () {
                // changes when applyBindings happens and after options data is loaded
                var countryCode = this.countryCode();
                var options = this.countryOptions();

                if (options.length == 1 && options[0].code != countryCode)
                    options[0].code = countryCode;
            };

            SearchMap.prototype._loadCountryOptions = function () {
                var _this = this;
                // this will run once during construction
                // this will run before sammy and applyBindings...
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                    // ...but this will run after sammy and applyBindings
                    var options = response.slice(0);

                    // customize options
                    var any = {
                        code: 'any',
                        name: '[All countries]'
                    };
                    var none = {
                        code: 'none',
                        name: '[Without country]'
                    };
                    options = Enumerable.From([any]).Concat(options).Concat([none]).ToArray();

                    _this.countryOptions(options);
                    deferred.resolve();
                });
                return deferred;
            };

            SearchMap.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                // sammy will run the first route that it matches
                var beforeRegex = new RegExp('\\{0}'.format(this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
                this.sammy.before(beforeRegex, function () {
                    var e = this;
                    return viewModel._onBeforeRoute(e);
                });

                // do this when we already have hashtag parameters in the page
                this.sammy.get(this.routeFormat.format(':country', ':zoom', ':lat', ':lng'), function () {
                    var e = this;
                    viewModel._onRoute(e);
                });

                // activate the page route (create default hashtag parameters)
                this.sammy.get(this.settings.activationRoute || this.sammy.getLocation(), function () {
                    var e = this;
                    viewModel.onBeforeActivation(e);
                });

                if (!this.settings.sammy && !this.sammy.isRunning())
                    this.sammy.run();
            };

            SearchMap.prototype._onBeforeRoute = function (e) {
                return true;
            };

            SearchMap.prototype._onRoute = function (e) {
                var country = e.params['country'];
                var zoom = e.params['zoom'];
                var lat = e.params['lat'];
                var lng = e.params['lng'];

                this.countryCode(country);

                if (!this._isActivated())
                    this._isActivated(true);
            };

            SearchMap.prototype.onBeforeActivation = function (e) {
                this._setLocation();
            };

            SearchMap.prototype._computeRoute = function () {
                // build what the route should be, based on current filter inputs
                var countryCode = this.countryCode();
                var zoom = this.zoom();
                var lat = this.lat();
                var lng = this.lng();
                var route = this.routeFormat.format(countryCode, zoom, lat, lng);
                return route;
            };

            SearchMap.prototype._setLocation = function () {
                // only set the href hashtag to trigger sammy when the current route is stale
                var route = this._route();
                if (this.sammy.getLocation().indexOf(route) < 0) {
                    this.sammy.setLocation(route);
                }
            };
            SearchMap.KeywordSessionKey = 'AgreementSearchKeyword2';
            SearchMap.CountrySessionKey = 'AgreementSearchCountry2';
            SearchMap.ZoomSessionKey = 'AgreementSearchZoom';
            SearchMap.LatSessionKey = 'AgreementSearchLat';
            SearchMap.LngSessionKey = 'AgreementSearchLng';
            return SearchMap;
        })();
        ViewModels.SearchMap = SearchMap;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
