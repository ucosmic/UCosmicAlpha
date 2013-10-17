var Agreements;
(function (Agreements) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/linq/linq.d.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/App.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../app/Spinner.ts" />
    /// <reference path="../places/ApiModels.d.ts" />
    (function (ViewModels) {
        var TableSearch = (function () {
            //#endregion
            //#region Construction & Initialization
            function TableSearch(settings) {
                var _this = this;
                this.settings = settings;
                //#region Search Filter Inputs
                // throttle keyword to reduce number API requests
                this.keyword = ko.observable(sessionStorage.getItem(TableSearch.KeywordSessionKey) || '');
                this.keywordThrottled = ko.computed(this.keyword).extend({ throttle: 400 });
                // instead of throttling, both this and the options are observed
                this.countryCode = ko.observable(sessionStorage.getItem(TableSearch.CountrySessionKey) || 'any');
                this.pager = new SearchResultPager(sessionStorage.getItem(TableSearch.PageNumberSessionKey) || 1, sessionStorage.getItem(TableSearch.PageSizeSessionKey) || 10);
                this.displayPager = new SearchResultPager(sessionStorage.getItem(TableSearch.PageNumberSessionKey) || 1, sessionStorage.getItem(TableSearch.PageSizeSessionKey) || 10);
                this.orderBy = ko.observable(sessionStorage.getItem(TableSearch.OrderBySessionKey) || 'start-desc');
                // automatically save the search inputs to session when they change
                this._inputChanged = ko.computed(function () {
                    sessionStorage.setItem(TableSearch.KeywordSessionKey, _this.keyword());
                    sessionStorage.setItem(TableSearch.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(TableSearch.PageNumberSessionKey, _this.pager.input.pageNumberText());
                    sessionStorage.setItem(TableSearch.PageSizeSessionKey, _this.pager.input.pageSizeText());
                    sessionStorage.setItem(TableSearch.OrderBySessionKey, _this.orderBy());
                }).extend({ throttle: 0 });
                ////#endregion
                //#region Country Filter Options
                // initial options show loading message
                this.countryOptions = ko.observableArray([{ code: 'any', name: '[Loading...]' }]);
                this._countryChanged = ko.computed(function () {
                    _this._onCountryChanged();
                });
                //#endregion
                //#region Sammy Routing
                this.sammy = Sammy();
                this.routeFormat = '#/{0}/country/{5}/sort/{1}/size/{2}/page/{3}/'.format(this.settings.route).replace('{5}', '{0}');
                this._isActivated = ko.observable(false);
                this._route = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeRoute();
                });
                //#endregion
                //#region API Requests
                this._requestHistory = ko.observableArray();
                this._currentRequest = ko.computed(function () {
                    // this will run once during construction
                    return _this._computeCurrentRequest();
                });
                this._requestDirty = ko.computed(function () {
                    // this will run once during construction
                    _this._onRequestDirty();
                }).extend({ throttle: 1 });
                //#endregion
                //#region Results
                this.spinner = new App.Spinner(new App.SpinnerOptions(400, true));
                this._loadCountryOptions();
                this._runSammy();
                ko.applyBindings(this, this.settings.element);
            }
            TableSearch.prototype._onCountryChanged = function () {
                // changes when applyBindings happens and after options data is loaded
                var countryCode = this.countryCode();
                var options = this.countryOptions();

                if (options.length == 1 && options[0].code != countryCode)
                    options[0].code = countryCode;
            };

            TableSearch.prototype._loadCountryOptions = function () {
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

            TableSearch.prototype._runSammy = function () {
                // this will run once during construction
                var viewModel = this;

                // sammy will run the first route that it matches
                var beforeRegex = new RegExp('\\{0}'.format(this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
                this.sammy.before(beforeRegex, function () {
                    var e = this;

                    // this will always run when the route is first activated, either explicitly from the URL
                    // or after hitting the activation route pattern
                    // it will also run when users page back & forward through the history
                    // keyword is not stored as part of the route or history
                    viewModel.countryCode(e.params['country']);
                    viewModel.orderBy(e.params['sort']);
                    viewModel.pager.input.pageSizeText(e.params['size']);
                    viewModel.pager.input.pageNumberText(e.params['number']);
                    return true;
                });

                // do this when we already have hashtag parameters in the page
                this.sammy.get(this.routeFormat.format(':country', ':sort', ':size', ':number'), function () {
                    var e = this;
                    if (!viewModel._isActivated())
                        viewModel._isActivated(true);
                });

                // activate the page route (create default hashtag parameters)
                this.sammy.get(this.settings.activationRoute || this.sammy.getLocation(), function () {
                    var e = this;
                    viewModel._setLocation();
                });

                this.sammy.run();
            };

            TableSearch.prototype._computeRoute = function () {
                // build what the route should be, based on current filter inputs
                var countryCode = this.countryCode();
                var orderBy = this.orderBy();
                var pageSize = this.pager.input.pageSize();
                var pageNumber = this.pager.input.pageNumber();
                var route = this.routeFormat.format(countryCode, orderBy, pageSize, pageNumber);
                return route;
            };

            TableSearch.prototype._setLocation = function () {
                // only set the href hashtag to trigger sammy when the current route is stale
                var route = this._route();
                if (this.sammy.getLocation().indexOf(route) < 0) {
                    this.sammy.setLocation(route);
                }
            };

            TableSearch.prototype._computeCurrentRequest = function () {
                var thisRequest = {
                    keyword: this.keywordThrottled(),
                    countryCode: this.countryCode(),
                    orderBy: this.orderBy(),
                    pageSize: this.pager.input.pageSize(),
                    pageNumber: this.pager.input.pageNumber()
                };
                return thisRequest;
            };

            TableSearch.prototype._onRequestDirty = function () {
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

            TableSearch.prototype._load = function () {
                var _this = this;
                this._request().done(function () {
                    if (_this.$results && _this.pager.output.hasItems()) {
                        _this.$results.fadeTo(0, 1);
                    }
                });
            };

            TableSearch.prototype._request = function () {
                var _this = this;
                var deferred = $.Deferred();
                var lastRequest = Enumerable.From(this._requestHistory()).Last();
                var thisRequest = this._currentRequest();
                if (thisRequest != lastRequest) {
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
                    if (thisRequest == currentRequest) {
                        if (response.itemTotal < 1 && thisRequest.pageNumber != 1)
                            // need to correct the page number here
                            _this._fixOverflowedPageNumber(thisRequest, 1);
else if (response.pageNumber != thisRequest.pageNumber)
                            // need to correct the page number here
                            _this._fixOverflowedPageNumber(thisRequest, response.pageNumber);

                        response.items = Enumerable.From(response.items).Select(function (x) {
                            return new TableRow(x, _this);
                        }).ToArray();
                        _this.pager.apply(response);
                        _this.displayPager.apply(response);
                        _this._setLocation();
                        deferred.resolve();
                        _this.spinner.stop();
                    } else {
                        deferred.reject();
                    }
                });
                return deferred;
            };

            TableSearch.prototype._fixOverflowedPageNumber = function (request, pageNumber) {
                var requests = this._requestHistory().slice(0);
                var requestToFix = requests[requests.length - 1];
                for (var i = requests.length - 1; i >= 0; i--) {
                    if (!this._areRequestsAligned(request, requests[i], true))
                        break;
                    requestToFix = requests[i];

                    if (this._requestHistory().length > 1 && this._areRequestsAligned(request, requests[i - 1], true))
                        this._requestHistory.pop();
                }
                requestToFix.pageNumber = pageNumber;
            };

            TableSearch.prototype._areRequestsAligned = function (first, second, ignorePageNumber) {
                if (typeof ignorePageNumber === "undefined") { ignorePageNumber = false; }
                var aligned = first.keyword === second.keyword && first.countryCode === second.countryCode && first.orderBy === second.orderBy && first.pageSize === second.pageSize;
                if (!ignorePageNumber)
                    aligned = aligned && first.pageNumber === second.pageNumber;
                return aligned;
            };

            TableSearch.prototype._getPageCount = function (pageNumber, pageSize, itemTotal) {
                var pageCount = Math.ceil(itemTotal / pageSize);
                return pageCount;
            };
            TableSearch.KeywordSessionKey = 'AgreementSearchKeyword2';
            TableSearch.PageSizeSessionKey = 'AgreementSearchPageSize2';
            TableSearch.OrderBySessionKey = 'AgreementSearchOrderBy2';
            TableSearch.CountrySessionKey = 'AgreementSearchCountry2';
            TableSearch.PageNumberSessionKey = 'AgreementSearchPageNumber2';
            return TableSearch;
        })();
        ViewModels.TableSearch = TableSearch;

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

        var SearchResultPager = (function () {
            function SearchResultPager(pageNumber, pageSize) {
                this.items = ko.observableArray();
                this.input = new SearchResultPagerStatus(pageNumber, pageSize);
                this.output = new SearchResultPagerStatus(pageNumber, pageSize);
            }
            SearchResultPager.prototype.apply = function (page) {
                this.input.apply(page);
                this.output.apply(page);
                this.items(page.items);
            };
            return SearchResultPager;
        })();
        ViewModels.SearchResultPager = SearchResultPager;

        var SearchResultPagerStatus = (function () {
            function SearchResultPagerStatus(pageNumber, pageSize) {
                var _this = this;
                this.pageNumberText = ko.observable('1');
                this.pageSizeText = ko.observable('10');
                this.itemCount = ko.observable();
                this.itemTotal = ko.observable();
                this.pageNumber = ko.computed(function () {
                    return parseInt(_this.pageNumberText());
                });
                this.pageSize = ko.computed(function () {
                    return parseInt(_this.pageSizeText());
                });
                this.isItemTotalDefined = ko.computed(function () {
                    var itemTotal = _this.itemTotal();
                    return itemTotal || itemTotal == 0;
                });
                this.pageCount = ko.computed(function () {
                    if (!_this.isItemTotalDefined())
                        return undefined;
                    return Math.ceil(_this.itemTotal() / _this.pageSize());
                });
                this.pageIndex = ko.computed(function () {
                    return _this.pageNumber() - 1;
                });
                this.firstIndex = ko.computed(function () {
                    return _this.pageIndex() * _this.pageSize();
                });
                this.firstNumber = ko.computed(function () {
                    return _this.firstIndex() + 1;
                });
                this.lastNumber = ko.computed(function () {
                    if (!_this.isItemTotalDefined())
                        return 0;
                    return _this.firstIndex() + _this.itemCount();
                });
                this.lastIndex = ko.computed(function () {
                    return _this.lastNumber() - 1;
                });
                this.nextAllowed = ko.computed(function () {
                    var pageCount = _this.pageCount();
                    return pageCount == undefined || pageCount > _this.pageNumber();
                });
                this.prevAllowed = ko.computed(function () {
                    var pageNumber = _this.pageNumber() - 1;
                    return pageNumber > 0;
                });
                this.hasItems = ko.computed(function () {
                    return _this.isItemTotalDefined() && _this.itemTotal() > 0;
                });
                this.hasManyItems = ko.computed(function () {
                    return _this.lastNumber() > _this.firstNumber();
                });
                this.hasNoItems = ko.computed(function () {
                    return !_this.hasItems();
                });
                this.hasManyPages = ko.computed(function () {
                    return _this.pageCount() > 1;
                });
                this.pageNumberText(pageNumber);
                this.pageSizeText(pageSize);
            }
            SearchResultPagerStatus.prototype.apply = function (page) {
                this.pageSizeText(page.pageSize.toString());
                this.pageNumberText(page.itemTotal > 0 ? page.pageNumber.toString() : '1');
                this.itemTotal(page.itemTotal);
                this.itemCount(page.items.length);
            };

            SearchResultPagerStatus.prototype.next = function () {
                var pageNumber = this.pageNumber() + 1;
                this.pageNumberText(pageNumber.toString());
            };

            SearchResultPagerStatus.prototype.prev = function () {
                var pageNumber = this.pageNumber() - 1;
                this.pageNumberText(pageNumber.toString());
            };
            return SearchResultPagerStatus;
        })();
        ViewModels.SearchResultPagerStatus = SearchResultPagerStatus;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
