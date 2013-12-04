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
        var SearchTable = (function () {
            //#endregion
            //#region Construction & Initialization
            function SearchTable(settings) {
                var _this = this;
                this.settings = settings;
                //#region Search Filter Inputs
                // throttle keyword to reduce number API requests
                this.keyword = ko.observable(sessionStorage.getItem(SearchTable.KeywordSessionKey) || '');
                this.keywordThrottled = ko.computed(this.keyword).extend({ throttle: 400 });
                // instead of throttling, both this and the options are observed
                this.countryCode = ko.observable(sessionStorage.getItem(SearchTable.CountrySessionKey) || 'any');
                this.pager = new App.Pager(sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1, sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);
                this.displayPager = new App.Pager(sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1, sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);
                this.orderBy = ko.observable(sessionStorage.getItem(SearchTable.OrderBySessionKey) || 'start-desc');
                // automatically save the search inputs to session when they change
                this._inputChanged = ko.computed(function () {
                    if (_this.countryCode() == undefined)
                        _this.countryCode('any');
                    if (isNaN(_this.pager.input.pageNumber()))
                        _this.pager.input.pageNumberText('1');

                    sessionStorage.setItem(SearchTable.KeywordSessionKey, _this.keyword() || '');
                    sessionStorage.setItem(SearchTable.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(SearchTable.PageNumberSessionKey, _this.pager.input.pageNumberText());
                    sessionStorage.setItem(SearchTable.PageSizeSessionKey, _this.pager.input.pageSizeText());
                    sessionStorage.setItem(SearchTable.OrderBySessionKey, _this.orderBy());
                }).extend({ throttle: 0 });
                ////#endregion
                //#region Country Filter Options
                // initial options show loading message
                this.countryOptions = ko.observableArray([{ code: 'any', name: '[Loading...]' }]);
                this._countryChanged = ko.computed(function () {
                    _this._onCountryChanged();
                });
                //#endregion
                //#region Result Filter Pagination
                this._filterChanged = ko.computed(function () {
                    var keyword = _this.keywordThrottled();
                    var pageSize = _this.pager.input.pageSize();
                    var countryCode = _this.countryCode();

                    //alert('filter changed');
                    _this.pager.input.pageNumberText("1");
                });
                this.routeFormat = '#/{0}/country/{4}/sort/{1}/size/{2}/page/{3}/'.format(this.settings.route).replace('{4}', '{0}');
                this._isActivated = ko.observable(false);
                this._route = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeRoute();
                });
                //#endregion
                //#region API Requests
                this.spinner = new App.Spinner({ delay: 400, runImmediately: true });
                this._requestHistory = ko.observableArray();
                this._currentRequest = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeCurrentRequest();
                });
                this._requestDirty = ko.computed(function () {
                    // this will run once during construction
                    _this._onRequestDirty();
                }).extend({ throttle: 1 });
                this._loadCountryOptions();
                this.sammy = this.settings.sammy || Sammy();
                this._runSammy();
            }
            SearchTable.prototype._onCountryChanged = function () {
                // changes when applyBindings happens and after options data is loaded
                var countryCode = this.countryCode();
                var options = this.countryOptions();

                if (options.length == 1 && options[0].code != countryCode)
                    options[0].code = countryCode;
            };

            SearchTable.prototype._loadCountryOptions = function () {
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

            SearchTable.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                // sammy will run the first route that it matches
                var beforeRegex = new RegExp('\\{0}'.format(this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
                this.sammy.before(beforeRegex, function () {
                    var e = this;
                    return viewModel._onBeforeRoute(e);
                });

                // do this when we already have hashtag parameters in the page
                this.sammy.get(this.routeFormat.format(':country', ':sort', ':size', ':number'), function () {
                    var e = this;
                    viewModel._onRoute(e);
                });

                // activate the page route (create default hashtag parameters)
                this.sammy.get(this.settings.activationRoute || this.sammy.getLocation(), function () {
                    viewModel.setLocation();
                });

                if (!this.settings.sammy && !this.sammy.isRunning())
                    this.sammy.run();
            };

            SearchTable.prototype._onBeforeRoute = function (e) {
                return true;
            };

            SearchTable.prototype._onRoute = function (e) {
                var country = e.params['country'];
                var sort = e.params['sort'];
                var size = e.params['size'];
                var page = e.params['number'];

                // this will always run when the route is first activated, either explicitly from the URL
                // or after hitting the activation route pattern
                // it will also run when users page back & forward through the history
                // keyword is not stored as part of the route or history
                this.countryCode(country);
                this.orderBy(sort);
                this.pager.input.pageSizeText(size);
                this.pager.input.pageNumberText(page);
                this.activate();
            };

            SearchTable.prototype.activate = function () {
                if (!this._isActivated()) {
                    this._requestHistory([]);
                    this._isActivated(true);
                }
            };
            SearchTable.prototype.deactivate = function () {
                if (this._isActivated())
                    this._isActivated(false);
            };

            SearchTable.prototype._computeRoute = function () {
                // build what the route should be, based on current filter inputs
                var countryCode = this.countryCode();
                var orderBy = this.orderBy();
                var pageSize = this.pager.input.pageSize();
                var pageNumber = this.pager.input.pageNumber();
                var route = this.routeFormat.format(countryCode, orderBy, pageSize, pageNumber);
                return route;
            };

            SearchTable.prototype.setLocation = function () {
                // only set the href hashtag to trigger sammy when the current route is stale
                var route = this._route();
                if (this.sammy.getLocation().indexOf(route) < 0) {
                    this.sammy.setLocation(route);
                }
            };

            SearchTable.prototype._computeCurrentRequest = function () {
                var thisRequest = {
                    keyword: this.keywordThrottled(),
                    countryCode: this.countryCode(),
                    orderBy: this.orderBy(),
                    pageSize: this.pager.input.pageSize(),
                    pageNumber: this.pager.input.pageNumber()
                };
                return thisRequest;
            };

            SearchTable.prototype._onRequestDirty = function () {
                if (!this._isActivated())
                    return;

                var requestHistory = this._requestHistory();
                var lastRequest = requestHistory.length ? Enumerable.From(requestHistory).Last() : null;
                var thisRequest = this._currentRequest();

                if (!lastRequest || !this._areRequestsAligned(thisRequest, lastRequest)) {
                    this._requestHistory.push(thisRequest);
                    this._load();
                }
            };

            SearchTable.prototype._load = function () {
                this._request().done(function () {
                });
            };

            SearchTable.prototype._request = function () {
                var _this = this;
                var deferred = $.Deferred();
                var requestHistory = this._requestHistory();
                var lastRequest = requestHistory[requestHistory.length - 1];
                var thisRequest = this._currentRequest();
                if (!this._areRequestsAligned(thisRequest, lastRequest)) {
                    deferred.reject();
                    return deferred;
                }
                this.spinner.start();
                if (this.$results) {
                    this.$results.fadeTo(200, 0.5);
                }
                $.get(App.Routes.WebApi.Agreements.Search.get(this.settings.domain), lastRequest).done(function (response) {
                    // need to make sure the current inputs still match the request
                    var currentRequest = _this._currentRequest();
                    if (_this._areRequestsAligned(thisRequest, currentRequest)) {
                        if (response.itemTotal < 1 && thisRequest.pageNumber != 1) {
                            // need to correct the page number here
                            _this._fixOverflowedPageNumber(thisRequest, 1);
                        } else if (response.pageNumber != thisRequest.pageNumber) {
                            // need to correct the page number here
                            _this._fixOverflowedPageNumber(thisRequest, response.pageNumber);
                        }

                        response.items = Enumerable.From(response.items).Select(function (x) {
                            return new TableRow(x, _this);
                        }).ToArray();
                        _this.pager.apply(response);
                        _this.displayPager.apply(response);
                        _this.setLocation();
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load agreement data, please try again', true);
                }).always(function () {
                    _this.spinner.stop();
                    _this._restoreResultOpactity();
                    setTimeout(function () {
                        _this._restoreResultOpactity();
                    }, 100);
                });
                return deferred;
            };

            SearchTable.prototype._fixOverflowedPageNumber = function (request, pageNumber) {
                var requests = this._requestHistory().slice(0);
                var requestToFix = requests[requests.length - 1];
                for (var i = requests.length - 1; i >= 0; i--) {
                    if (!this._areRequestsAligned(request, requests[i], true))
                        break;
                    requestToFix = requests[i];

                    if (this._requestHistory().length > 1 && this._areRequestsAligned(request, requests[i - 1], true)) {
                        this._requestHistory.pop();
                    }
                }
                requestToFix.pageNumber = pageNumber;
            };

            SearchTable.prototype._areRequestsAligned = function (first, second, ignorePageNumber) {
                if (typeof ignorePageNumber === "undefined") { ignorePageNumber = false; }
                var aligned = first.keyword === second.keyword && first.countryCode === second.countryCode && first.orderBy === second.orderBy && first.pageSize === second.pageSize;
                if (!ignorePageNumber)
                    aligned = aligned && first.pageNumber === second.pageNumber;
                return aligned;
            };

            SearchTable.prototype._restoreResultOpactity = function () {
                if (this.$results && this.pager.output.hasItems()) {
                    this.$results.fadeTo(1, 1);
                    this.$results.css({ opacity: 1 });
                }
            };
            SearchTable.KeywordSessionKey = 'AgreementSearchKeyword2';
            SearchTable.PageSizeSessionKey = 'AgreementSearchPageSize2';
            SearchTable.OrderBySessionKey = 'AgreementSearchOrderBy2';
            SearchTable.CountrySessionKey = 'AgreementSearchCountry2';
            SearchTable.PageNumberSessionKey = 'AgreementSearchPageNumber2';
            return SearchTable;
        })();
        ViewModels.SearchTable = SearchTable;

        var TableRow = (function () {
            function TableRow(data, owner) {
                var _this = this;
                this.owner = owner;
                this.id = ko.observable();
                this.name = ko.observable();
                this.countryNames = ko.observable();
                this.startsOn = ko.observable();
                this.expiresOn = ko.observable();
                this.type = ko.observable();
                this.status = ko.observable();
                this.countries = ko.observableArray();
                this.participants = ko.observableArray();
                this.detailHref = ko.computed(function () {
                    var url = _this.owner.settings.detailUrl.format(_this.id());
                    return url;
                });
                this.hasCountries = ko.computed(function () {
                    var countries = _this.countries();
                    return countries && countries.length > 0;
                });
                this.partners = ko.computed(function () {
                    return Enumerable.From(_this.participants()).Where(function (x) {
                        return !x.isOwner();
                    }).ToArray();
                });
                this.startsOnFormatted = ko.computed(function () {
                    var startsOn = _this.startsOn();
                    return moment(startsOn).format('M/D/YYYY');
                });
                this.expiresOnFormatted = ko.computed(function () {
                    var expiresOn = _this.expiresOn();
                    if (!expiresOn)
                        return '';
                    return moment(expiresOn).format('M/D/YYYY');
                });
                ko.mapping.fromJS(data, {}, this);
            }
            TableRow.prototype.partnerTranslatedName = function (index) {
                var partner = this.partners()[index];
                return partner.establishmentTranslatedName();
            };

            TableRow.prototype.partnerOfficialName = function (index) {
                var partner = this.partners()[index];
                return partner.establishmentOfficialName();
            };
            return TableRow;
        })();
        ViewModels.TableRow = TableRow;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
//# sourceMappingURL=SearchTable.js.map
