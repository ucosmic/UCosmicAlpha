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
            function Search(initDefaultPageRoute) {
                if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
                _super.call(this);
                this.initDefaultPageRoute = initDefaultPageRoute;
                this.header = ko.observable();
                this.$searchResults = $("#searchResults");
                this.dfdFadeInOut = $.Deferred();
                this.dfdFadeInOut2 = $.Deferred();
                // sammy & URL hashing
                this.sammy = Sammy();
                this.sammyBeforeRoute = /\#\/page\/(.*)\//;
                this.sammyGetPageRoute = '#/page/:pageNumber/';
                this.sammyDefaultPageRoute = '/agreements/(.*)[\/]?';
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
                this.publicViewClass = new Agreements.ViewModels.PublicView();
                ko.applyBindings(this.publicViewClass, $('#publicView')[0]);

                this.domain = window.location.href.toLowerCase();
                this.domain = this.domain.substring(this.domain.indexOf("agreements/") + 11);
                var domainIndexOf = (this.domain.indexOf("/") > 0) ? this.domain.indexOf("/") : this.domain.length;
                this.domain = this.domain.substring(0, domainIndexOf);

                this.clickAction = this.clickAction.bind(this);

                this._setupCountryDropDown();
                this._setupPagingSubscriptions();
                this._setupLensing();

                this._setupSammy();
                this._setupPagingDefaults();
                this.changeLens(this.lenses()[0]);
                this.requestResults = this.requestResults.bind(this);
            }
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

                ko.computed(function () {
                    self.requestResults();
                }).extend({ throttle: 1 });
            };

            Search.prototype.getPage = function (sammyContext) {
                if (window.location.href.indexOf("agreements/new") != -1 || window.location.href.indexOf("agreements/settings") != -1) {
                    this.sammy.destroy();
                    window.location.hash = "";
                    window.location.reload();
                    return;
                }
                var trail = this.trail(), clone;
                if (trail.length > 0 && trail[trail.length - 1] === sammyContext.path)
                    return;
                if (trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
                    // swipe backward
                    trail.pop();

                    //this.swipeCallback = (): void => {
                    //clone = this.$itemsPage.clone(true)
                    //    .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    //clone.appendTo(this.$itemsPage.parent());
                    //this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    //this.lockAnimation();
                    //$(window).scrollTop(0);
                    //this.sideSwiper.prev(1, (): void => {
                    //    this.$itemsPage.siblings().remove();
                    //    this.unlockAnimation();
                    //});
                    //};
                    return;
                } else if (trail.length > 0) {
                    // swipe forward
                    //this.swipeCallback = (): void => {
                    //clone = this.$itemsPage.clone(true)
                    //    .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    //clone.insertBefore(this.$itemsPage);
                    //this.$itemsPage.attr('data-side-swiper', 'off').hide();
                    //this.lockAnimation();
                    //$(window).scrollTop(0);
                    //this.sideSwiper.next(1, (): void => {
                    //    this.unlockAnimation();
                    //});
                    //};
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

                //this.swipeCallback();
                this.transitionedPageNumber(this.pageNumber());
                this.dfdFadeInOut2.resolve();
            };

            Search.prototype.requestResults = function () {
                var _this = this;
                if (this.pageSize() === undefined || this.orderBy() === undefined)
                    return;
                this.spinner.start();
                $.when(this.dfdFadeInOut2).done(function () {
                    _this.spinner.stop();
                    _this.$searchResults.fadeIn(400);
                    _this.dfdFadeInOut = $.Deferred();
                    _this.dfdFadeInOut2 = $.Deferred();
                });
                if (this.$searchResults.is(":visible")) {
                    this.$searchResults.fadeOut(400, function () {
                        _this.dfdFadeInOut.resolve();
                    });
                } else {
                    this.dfdFadeInOut.resolve();
                }
                $.get(App.Routes.WebApi.Agreements.Search.get(), {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    countryCode: this.countryCode(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy(),
                    myDomain: this.domain
                }).done(function (response) {
                    $.when(_this.dfdFadeInOut).done(function () {
                        _this.receiveResults(response);
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
                //this.sammy.unload();
                //location.hash = "";
                //location.pathname = "agreements/" + viewModel.id() + "/"
                // to do the following I need to set a location with sammy
                //$("nav.bib .search").removeClass("current");
                //$("nav.bib ul").append("<li class='view current'><span> View </span></ li>");
                //this.publicViewClass.agreementId.val = viewModel.id();
                //this.publicViewClass.getData();
                //$("#search").fadeOut(500, function () {
                //    $("#publicView").fadeIn(500);
                //});
                return true;
            };

            Search.prototype.detailHref = function (id) {
                return App.Routes.Mvc.Establishments.show(id);
            };

            Search.prototype.detailTooltip = function () {
                return 'View & edit this agreement\'s details';
            };

            Search.prototype._setupPagingDefaults = function () {
                this.orderBy('country');
                this.pageSize(10);
            };
            return Search;
        })(App.PagedSearch);
        ViewModels.Search = Search;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
