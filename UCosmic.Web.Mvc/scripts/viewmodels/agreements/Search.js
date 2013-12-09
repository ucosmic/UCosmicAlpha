/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/PagedSearch.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../places/ApiModels.d.ts" />
/// <reference path="SearchResult.ts" />
/// <reference path="ApiModels.d.ts" />
/// <reference path="publicView.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Agreements;
(function (Agreements) {
    (function (ViewModels) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search(domain, initDefaultPageRoute) {
                if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
                var _this = this;
                _super.call(this);
                this.domain = domain;
                this.initDefaultPageRoute = initDefaultPageRoute;
                this.header = ko.observable();
                this.$searchResults = $("#searchResults");
                this.deferredFadeInOut = $.Deferred();
                this.deferredFadeInOut2 = $.Deferred();
                this.optionsEnabled = ko.observable(true);
                // sammy & URL hashing
                this.sammy = Sammy();
                this.sammyBeforeRoute = /\#\/page\/(.*)\//;
                this.sammyGetPageRoute = '#/page/:pageNumber/';
                this.sammyDefaultPageRoute = '{0}/agreements[\/]?'.format(this.domain);
                // filtering
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                // lensing
                this.lenses = ko.observableArray([
                    { text: 'Table', value: 'table' },
                    { text: 'List', value: 'list' }
                ]);
                this.lens = ko.observable();
                // items page
                this.$itemsPage = undefined;
                this.trail = ko.observableArray([]);
                // results
                this.resultsMapping = {
                    'items': {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new Agreements.ViewModels.SearchResult(options.data, options.parent);
                        }
                    },
                    ignore: ['pageSize', 'pageNumber']
                };

                this._init();
                this.changeLens(this.lenses()[0]);
                this._requestResults = this._requestResults.bind(this);
                this.prevPage = function () {
                    if (_this.pageNumber() > 1) {
                        var pageNumber = Number(_this.pageNumber()) - 1;
                        _this.pageNumber(pageNumber);
                    }
                };
                this.nextPage = function () {
                    if (_this.nextEnabled()) {
                        var pageNumber = Number(_this.pageNumber()) + 1;
                        _this.pageNumber(pageNumber);
                    }
                };
            }
            Search.prototype._init = function () {
                this._setupCountryDropDown();
                this._setupPagingSubscriptions();
                this._setupLensing();
                this._setupPagingDefaults();
                this._applySession();
                this._setupSammy();
                this._setupSessionStorage();
            };

            // countries dropdown
            Search.prototype._setupCountryDropDown = function () {
                var _this = this;
                ko.computed(function () {
                    // populate countryCode based on last value when paging backwards
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        // setup empty value
                        var emptyValue = {
                            code: '-1',
                            name: '[Without country]'
                        };
                        response.splice(response.length, 0, emptyValue);

                        _this.countries(response); // push into observable array

                        // restore selected value when paging backwards
                        if (lastCountryCode && lastCountryCode !== _this.countryCode())
                            _this.countryCode(lastCountryCode);
                    });
                }).extend({ throttle: 1 });
            };

            // paging subscriptions
            Search.prototype._setupPagingSubscriptions = function () {
                var _this = this;
                // whenever pageNumber changes, set the location for sammy
                this.pageNumber.subscribe(function (newValue) {
                    _this._setLocation();
                });
            };

            // lensing
            Search.prototype._setupLensing = function () {
                var _this = this;
                this.changeLens = function (lens) {
                    _this.lens(lens.value);
                };
            };

            Search.prototype._setupSammy = function () {
                var self = this;
                self.sammy.before(self.sammyBeforeRoute, function () {
                    self._beforePage(this);
                });

                self.sammy.get(self.sammyGetPageRoute, function () {
                    self._getPage(this);
                });

                if (self.initDefaultPageRoute) {
                    // match /establishments or /establishments/
                    self.sammy.get(self.sammyDefaultPageRoute, function () {
                        self._initPageHash(this);
                    });
                }

                ko.computed(function () {
                    self._requestResults();
                }).extend({ throttle: 1 });
            };

            Search.prototype._getPage = function (sammyContext) {
                var trail = this.trail(), clone;
                if (trail.length > 0 && trail[trail.length - 1] === sammyContext.path)
                    return;
                if (trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
                    // swipe backward
                    trail.pop();
                    return;
                } else if (trail.length > 0) {
                    // swipe forward
                }
                trail.push(sammyContext.path);
            };

            Search.prototype._beforePage = function (sammyContext) {
                var pageNumber;
                if (this.nextForceDisabled() || this.prevForceDisabled())
                    return false;

                pageNumber = sammyContext.params['pageNumber'];

                // make sure the viewmodel pagenumber is in sync with the route
                if (pageNumber && parseInt(pageNumber) !== Number(this.pageNumber()))
                    this.pageNumber(parseInt(pageNumber));
                return true;
            };

            Search.prototype._initPageHash = function (sammyContext) {
                sammyContext.app.setLocation('#/page/1/');
            };

            Search.prototype._setLocation = function () {
                var location = '#/page/' + this.pageNumber() + '/';
                if (this.sammy.getLocation() !== location)
                    this.sammy.setLocation(location);
            };

            Search.prototype.lockAnimation = function () {
                this.nextForceDisabled(true);
                this.prevForceDisabled(true);
            };
            Search.prototype.unlockAnimation = function () {
                this.nextForceDisabled(false);
                this.prevForceDisabled(false);
            };

            Search.prototype._receiveResults = function (js) {
                if (!js) {
                    ko.mapping.fromJS({
                        items: [],
                        itemTotal: 0
                    }, this.resultsMapping, this);
                } else {
                    ko.mapping.fromJS(js, this.resultsMapping, this);
                }
                App.WindowScroller.restoreTop(); // restore scroll when coming back from detail page
                this.transitionedPageNumber(this.pageNumber());
                this.deferredFadeInOut2.resolve();
            };

            Search.prototype._requestResults = function () {
                var _this = this;
                this.optionsEnabled(false);
                if (this.pageSize() === undefined || this.orderBy() === undefined || this.pageNumber() === undefined || this.keyword() !== this.throttledKeyword())
                    return;
                this.lockAnimation();
                this.spinner.start();
                this.deferredFadeInOut = $.Deferred();
                this.deferredFadeInOut2 = $.Deferred();
                $.when(this.deferredFadeInOut2).done(function () {
                    _this.spinner.stop();
                    _this.$searchResults.fadeIn(400, function () {
                        _this.unlockAnimation();
                        _this.optionsEnabled(true);
                        _this.$searchResults.children().offset({ top: _this.$searchResults.offset().top });
                    });
                });
                if (this.$searchResults.is(":visible")) {
                    this.$searchResults.fadeOut(400, function () {
                        _this.deferredFadeInOut.resolve();
                    });
                } else {
                    this.deferredFadeInOut.resolve();
                }
                $.get(App.Routes.WebApi.Agreements.Search.get(this.domain), {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    countryCode: this.countryCode(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                }).done(function (response) {
                    $.when(_this.deferredFadeInOut).done(function () {
                        _this._receiveResults(response);
                    });
                });
            };

            // go to add new
            Search.prototype.gotoAddNew = function () {
                return true;
            };

            // click item
            // TODO: is this still needed?
            Search.prototype.clickAction = function (viewModel, e) {
                return true;
            };

            // TODO: this is also not used anywhere, detailHref on SearchResult is though.
            Search.prototype.detailHref = function (id) {
                return App.Routes.Mvc.Establishments.show(id);
            };

            Search.prototype._setupPagingDefaults = function () {
                this.orderBy('country');
                this.pageSize(10);
            };

            Search.prototype._setupSessionStorage = function () {
                this.keyword.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.KeywordSessionKey, newValue);
                });
                this.pageSize.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.PageSizeSessionKey, newValue.toString());
                });
                this.orderBy.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.OrderBySessionKey, newValue);
                });
                this.countryCode.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.CountrySessionKey, newValue);
                });
                this.pageNumber.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.PageNumberSessionKey, newValue.toString());
                });
            };

            Search.prototype._applySession = function () {
                this.keyword(sessionStorage.getItem(Search.KeywordSessionKey) || this.keyword());
                this.pageSize(parseInt(sessionStorage.getItem(Search.PageSizeSessionKey)) || Number(this.pageSize()));
                this.orderBy(sessionStorage.getItem(Search.OrderBySessionKey) || this.orderBy());
                if (sessionStorage.getItem(Search.CountrySessionKey) !== "undefined") {
                    this.countryCode(sessionStorage.getItem(Search.CountrySessionKey) || this.countryCode());
                }
                this.pageNumber(this.pageNumber() || 1);
                this.pageNumber(parseInt(sessionStorage.getItem(Search.PageNumberSessionKey)) || Number(this.pageNumber()));
            };
            Search.KeywordSessionKey = 'AgreementSearchKeyword';
            Search.PageSizeSessionKey = 'AgreementSearchPageSize';
            Search.OrderBySessionKey = 'AgreementSearchOrderBy';
            Search.CountrySessionKey = 'AgreementSearchCountry';
            Search.PageNumberSessionKey = 'AgreementSearchPageNumber';
            return Search;
        })(App.PagedSearch);
        ViewModels.Search = Search;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
