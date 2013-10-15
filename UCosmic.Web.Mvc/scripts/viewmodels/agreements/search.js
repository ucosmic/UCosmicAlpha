var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Agreements;
(function (Agreements) {
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
    /// <reference path="./publicView.ts" />
    (function (ViewModels) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search(domain, initDefaultPageRoute) {
                if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
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
                //sammyDefaultPageRoute: any = '/agreements/(.*?\..*)[\/]?';
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
                this.sideSwiper = new App.SideSwiper({
                    frameWidth: 710,
                    speed: 'fast',
                    root: '#search'
                });
                this.trail = ko.observableArray([]);
                // results
                this.resultsMapping = {
                    'items': {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new ViewModels.SearchResult(options.data, options.parent);
                        }
                    },
                    ignore: ['pageSize', 'pageNumber']
                };

                //this.publicViewClass = new Agreements.ViewModels.PublicView();
                //ko.applyBindings(this.publicViewClass, $('#publicView')[0]);
                //this.domain = window.location.href.toLowerCase();
                //this.domain = this.domain.substring(this.domain.indexOf("agreements/") + 11);
                //var domainIndexOf = (this.domain.indexOf("/") > 0) ? this.domain.indexOf("/") : this.domain.length;
                //this.domain = this.domain.substring(0, domainIndexOf);
                //this.clickAction = <() => boolean > this.clickAction.bind(this);
                this._init();

                this.changeLens(this.lenses()[0]);
                this.requestResults = this.requestResults.bind(this);
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

                        _this.countries(response);

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
                    _this.setLocation();
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

                //self.beforePage(this.sammy());
                self.sammy.before(self.sammyBeforeRoute, function () {
                    self.beforePage(this);
                });

                self.sammy.get(self.sammyGetPageRoute, function () {
                    self.getPage(this);
                });

                if (self.initDefaultPageRoute) {
                    // match /establishments or /establishments/
                    self.sammy.get(self.sammyDefaultPageRoute, function () {
                        self.initPageHash(this);
                    });
                }

                //this.unlockAnimation();
                ko.computed(function () {
                    self.requestResults();
                }).extend({ throttle: 1 });
            };

            Search.prototype.getPage = function (sammyContext) {
                //var windowHref = window.location.href;
                //if (windowHref.indexOf("agreements/new") != -1
                //    || windowHref.indexOf("agreements/settings") != -1
                //    || parseInt(windowHref.substr(windowHref.indexOf("agreements/") + 11, 1)) > 0 ){
                //        this.sammy.destroy();
                //        window.location.hash = "";
                //        window.location.reload;
                //    //window.location.replace(window.location.href);
                // // to do the following I need to set a location with sammy
                ////$("nav.bib .search").removeClass("current");
                ////$("nav.bib ul").append("<li class='view current'><span> View </span></ li>");
                ////this.publicViewClass.agreementId.val = viewModel.id();
                ////this.publicViewClass.getData();
                ////$("#search").fadeOut(500, function () {
                ////    $("#publicView").fadeIn(500);
                ////});
                //    return ;
                //}
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

            Search.prototype.beforePage = function (sammyContext) {
                var pageNumber;
                if (this.nextForceDisabled() || this.prevForceDisabled())
                    return false;

                pageNumber = sammyContext.params['pageNumber'];

                if (pageNumber && parseInt(pageNumber) !== Number(this.pageNumber()))
                    this.pageNumber(parseInt(pageNumber));
                return true;
            };

            Search.prototype.initPageHash = function (sammyContext) {
                sammyContext.app.setLocation('#/page/1/');
            };

            Search.prototype.setLocation = function () {
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

            Search.prototype.swipeCallback = function () {
            };
            Search.prototype.receiveResults = function (js) {
                if (!js) {
                    ko.mapping.fromJS({
                        items: [],
                        itemTotal: 0
                    }, this.resultsMapping, this);
                } else {
                    ko.mapping.fromJS(js, this.resultsMapping, this);
                }
                App.WindowScroller.restoreTop();
                this.transitionedPageNumber(this.pageNumber());
                this.deferredFadeInOut2.resolve();
            };

            Search.prototype.requestResults = function () {
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
                    //this.deferredFadeInOut = $.Deferred();
                    //this.deferredFadeInOut2 = $.Deferred();
                });
                if (this.$searchResults.is(":visible")) {
                    this.$searchResults.fadeOut(400, function () {
                        _this.deferredFadeInOut.resolve();
                    });
                } else {
                    this.deferredFadeInOut.resolve();
                }

                //$.when(this.deferredSessionLoaded)
                //.done(() => {
                $.get(App.Routes.WebApi.Agreements.Search.get(this.domain), {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    countryCode: this.countryCode(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                }).done(function (response) {
                    $.when(_this.deferredFadeInOut).done(function () {
                        _this.receiveResults(response);
                    });
                });
                //});
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

            //detailTooltip(): string {
            //    return 'View & edit this agreement\'s details';
            //}
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

                //this.keyword.notifySubscribers;
                this.pageSize(parseInt(sessionStorage.getItem(Search.PageSizeSessionKey)) || Number(this.pageSize()));

                //this.pageSize(parseInt(window.sessionStorage.getItem('UserSearchPageSize'))
                //    || Number(this.pageSize()));
                this.orderBy(sessionStorage.getItem(Search.OrderBySessionKey) || this.orderBy());
                if (sessionStorage.getItem(Search.CountrySessionKey) !== "undefined") {
                    this.countryCode(sessionStorage.getItem(Search.CountrySessionKey) || this.countryCode());
                }

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
