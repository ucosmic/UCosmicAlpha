var Agreements;
(function (Agreements) {
    var ViewModels;
    (function (ViewModels) {
        var SearchTable = (function () {
            function SearchTable(settings) {
                var _this = this;
                this.settings = settings;
                this.keyword = ko.observable(sessionStorage.getItem(SearchTable.KeywordSessionKey) || '');
                this.keywordThrottled = ko.computed(this.keyword)
                    .extend({ throttle: 400 });
                this.countryCode = ko.observable(sessionStorage.getItem(SearchTable.CountrySessionKey) || 'any');
                this.typeCode = ko.observable(sessionStorage.getItem(SearchTable.TypeSessionKey) || 'any');
                this.pager = new App.Pager(sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1, sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);
                this.displayPager = new App.Pager(sessionStorage.getItem(SearchTable.PageNumberSessionKey) || 1, sessionStorage.getItem(SearchTable.PageSizeSessionKey) || 10);
                this.orderBy = ko.observable(sessionStorage.getItem(SearchTable.OrderBySessionKey) || 'start-desc');
                this.summary = {
                    agreementCount: ko.observable('?'),
                    partnerCount: ko.observable('?'),
                    countryCount: ko.observable('?'),
                };
                this._inputChanged = ko.computed(function () {
                    if (_this.countryCode() == undefined)
                        _this.countryCode('any');
                    if (_this.typeCode() == undefined)
                        _this.typeCode('any');
                    if (isNaN(_this.pager.input.pageNumber()))
                        _this.pager.input.pageNumberText('1');
                    sessionStorage.setItem(SearchTable.KeywordSessionKey, _this.keyword() || '');
                    sessionStorage.setItem(SearchTable.CountrySessionKey, _this.countryCode());
                    sessionStorage.setItem(SearchTable.TypeSessionKey, _this.typeCode());
                    sessionStorage.setItem(SearchTable.PageNumberSessionKey, _this.pager.input.pageNumberText());
                    sessionStorage.setItem(SearchTable.PageSizeSessionKey, _this.pager.input.pageSizeText());
                    sessionStorage.setItem(SearchTable.OrderBySessionKey, _this.orderBy());
                }).extend({ throttle: 0, });
                this.countryOptions = ko.observableArray([{ code: 'any', name: '[Loading...]' }]);
                this.typeOptions = ko.observableArray([{ code: 'any', name: '[Loading...]' }]);
                this._countryChanged = ko.computed(function () {
                    _this._onCountryChanged();
                });
                this._typeChanged = ko.computed(function () {
                    _this._onTypeChanged();
                });
                this._filterChanged = ko.computed(function () {
                    var keyword = _this.keywordThrottled();
                    var pageSize = _this.pager.input.pageSize();
                    var countryCode = _this.countryCode();
                    var typeCode = _this.typeCode();
                    _this.pager.input.pageNumberText("1");
                });
                this.routeFormat = '#/{0}/country/{6}/type/{1}/sort/{2}/size/{3}/page/{4}/keyword/{5}'
                    .format(this.settings.route).replace('{6}', '{0}');
                this._isActivated = ko.observable(false);
                this._route = ko.computed(function () {
                    return _this._computeRoute();
                });
                this.spinner = new App.Spinner({ delay: 400, runImmediately: true, });
                this._requestHistory = ko.observableArray();
                this._currentRequest = ko.computed(function () {
                    return _this._computeCurrentRequest();
                });
                this._requestDirty = ko.computed(function () {
                    _this._onRequestDirty();
                }).extend({ throttle: 1, });
                this._loadCountryOptions();
                this._loadAgreementTypes();
                this.sammy = this.settings.sammy || Sammy();
                this._runSammy();
                if (sessionStorage.getItem("agreementSaved") == "deleted") {
                    sessionStorage.setItem("agreementSaved", "no");
                    App.flasher.flash("Agreement deleted");
                }
            }
            SearchTable.prototype._loadSummary = function (countryCode, typeCode, keyword) {
                var _this = this;
                var url = this.settings.summaryApi;
                if (countryCode) {
                    if (keyword == null || keyword == "") {
                        keyword = "!none!";
                    }
                    url = url += "Table/" + countryCode + "/" + typeCode + "/" + keyword;
                }
                $.get(url)
                    .done(function (response) {
                    ko.mapping.fromJS(response, {}, _this.summary);
                });
            };
            SearchTable.prototype._onCountryChanged = function () {
                var countryCode = this.countryCode();
                var options = this.countryOptions();
                if (options.length == 1 && options[0].code != countryCode)
                    options[0].code = countryCode;
            };
            SearchTable.prototype._onTypeChanged = function () {
                var typeCode = this.typeCode();
                var options = this.typeOptions();
                if (options.length == 1 && options[0].code != typeCode)
                    options[0].code = typeCode;
            };
            SearchTable.prototype._loadCountryOptions = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Countries.get())
                    .done(function (response) {
                    var options = response.slice(0);
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
            SearchTable.prototype._loadAgreementTypes = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.get("/api/agreements/agreement-types/0/")
                    .done(function (response) {
                    var options = response.slice(0);
                    var any = {
                        code: 'any',
                        name: '[All types]'
                    };
                    options = Enumerable.From([any]).Concat(options).ToArray();
                    _this.typeOptions(options);
                    deferred.resolve();
                });
                return deferred;
            };
            SearchTable.prototype._runSammy = function () {
                var viewModel = this;
                var beforeRegex = new RegExp('\\{0}'.format(this.routeFormat.format('(.*)', '(.*)', '(.*)', '(.*)', '(.*)', '(.*)').replace(/\//g, '\\/')));
                this.sammy.before(beforeRegex, function () {
                    var e = this;
                    return viewModel._onBeforeRoute(e);
                });
                this.sammy.get(this.routeFormat.format(':country', ':type', ':sort', ':size', ':number', ':keyword'), function () {
                    var e = this;
                    viewModel._onRoute(e);
                });
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
                var type = e.params['type'];
                var sort = e.params['sort'];
                var size = e.params['size'];
                var page = e.params['number'];
                var keyword = e.params['keyword'];
                if (keyword == '*none*') {
                    this.keyword("");
                }
                else {
                    this.keyword(keyword);
                }
                this.countryCode(country);
                this.typeCode(type);
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
                var countryCode = this.countryCode();
                var typeCode = this.typeCode();
                var orderBy = this.orderBy();
                var pageSize = this.pager.input.pageSize();
                var pageNumber = this.pager.input.pageNumber();
                var keyword = this.keyword();
                var route = this.routeFormat.format(countryCode, typeCode, orderBy, pageSize, pageNumber, keyword);
                return route;
            };
            SearchTable.prototype.setLocation = function () {
                var route = this._route();
                if (this.sammy.getLocation().indexOf(route) < 0) {
                    this.sammy.setLocation(route);
                }
            };
            SearchTable.prototype._computeCurrentRequest = function () {
                var thisRequest = {
                    keyword: this.keywordThrottled(),
                    countryCode: this.countryCode(),
                    typeCode: this.typeCode(),
                    orderBy: this.orderBy(),
                    pageSize: this.pager.input.pageSize(),
                    pageNumber: this.pager.input.pageNumber(),
                };
                return thisRequest;
            };
            SearchTable.prototype._onRequestDirty = function () {
                //if (!this._isActivated()) return; //this was causing the sammy route to never initialize if there was # in the url, like from a back button.
                var requestHistory = this._requestHistory();
                var lastRequest = requestHistory.length
                    ? Enumerable.From(requestHistory).Last() : null;
                var thisRequest = this._currentRequest();
                if (!lastRequest || !this._areRequestsAligned(thisRequest, lastRequest)) {
                    this._requestHistory.push(thisRequest);
                    this._load();
                }
            };
            SearchTable.prototype._load = function () {
                this._request()
                    .done(function () {
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
                this._loadSummary(lastRequest.countryCode, lastRequest.typeCode, lastRequest.keyword);
                $.get(App.Routes.WebApi.Agreements.Search.get(this.settings.domain), lastRequest)
                    .done(function (response) {
                    var currentRequest = _this._currentRequest();
                    if (_this._areRequestsAligned(thisRequest, currentRequest)) {
                        if (response.itemTotal < 1 && thisRequest.pageNumber != 1) {
                            _this._fixOverflowedPageNumber(thisRequest, 1);
                        }
                        else if (response.pageNumber != thisRequest.pageNumber) {
                            _this._fixOverflowedPageNumber(thisRequest, response.pageNumber);
                        }
                        response.items = Enumerable.From(response.items)
                            .Select(function (x) {
                            return new TableRow(x, _this);
                        }).ToArray();
                        _this.pager.apply(response);
                        _this.displayPager.apply(response);
                        _this.setLocation();
                        deferred.resolve();
                    }
                    else {
                        deferred.reject();
                    }
                })
                    .fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load agreement data, please try again', true);
                })
                    .always(function () {
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
                    if (this._requestHistory().length > 1 &&
                        this._areRequestsAligned(request, requests[i - 1], true)) {
                        this._requestHistory.pop();
                    }
                }
                requestToFix.pageNumber = pageNumber;
            };
            SearchTable.prototype._areRequestsAligned = function (first, second, ignorePageNumber) {
                if (ignorePageNumber === void 0) { ignorePageNumber = false; }
                var aligned = first.keyword === second.keyword
                    && first.countryCode === second.countryCode
                    && first.typeCode === second.typeCode
                    && first.orderBy === second.orderBy
                    && first.pageSize === second.pageSize;
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
            SearchTable.TypeSessionKey = 'AgreementSearchType2';
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
                    return Enumerable.From(_this.participants())
                        .Where(function (x) {
                        return !x.isOwner();
                    })
                        .ToArray();
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
    })(ViewModels = Agreements.ViewModels || (Agreements.ViewModels = {}));
})(Agreements || (Agreements = {}));
