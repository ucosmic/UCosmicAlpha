var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search() {
                var _this = this;
                        _super.call(this);
                this.sammy = Sammy();
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                this.lenses = ko.observableArray([
                    {
                        text: 'Table',
                        value: 'table'
                    }, 
                    {
                        text: 'List',
                        value: 'list'
                    }, 
                    {
                        text: 'Grid',
                        value: 'grid'
                    }, 
                    {
                        text: 'Map',
                        value: 'map'
                    }, 
                    {
                        text: 'Tree',
                        value: 'tree'
                    }
                ]);
                this.lens = ko.observable();
                this.$itemsPage = undefined;
                this.sideSwiper = new App.SideSwiper({
                    frameWidth: 710,
                    speed: 'fast',
                    root: '#search'
                });
                this.trail = ko.observableArray([]);
                this.resultsMapping = {
                    'items': {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new ViewModels.Establishments.SearchResult(options.data);
                        }
                    },
                    ignore: [
                        'pageSize', 
                        'pageNumber'
                    ]
                };
                ko.computed(function () {
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();
                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        var emptyValue = new ViewModels.Places.ServerCountryApiModel('-1', '[Without country]');
                        response.splice(response.length, 0, emptyValue);
                        _this.countries(response);
                        if(lastCountryCode && lastCountryCode !== _this.countryCode()) {
                            _this.countryCode(lastCountryCode);
                        }
                    });
                }).extend({
                    throttle: 1
                });
                this.pageNumber.subscribe(function (newValue) {
                    _this.setLocation();
                });
                this.changeLens = function (lens) {
                    _this.lens(lens.value);
                };
                var self = this;
                this.sammy.before(/\#\/page\/(.*)/, function () {
                    if(self.nextForceDisabled() || self.prevForceDisabled()) {
                        return false;
                    }
                    var pageNumber = this.params['pageNumber'];
                    if(pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber())) {
                        self.pageNumber(parseInt(pageNumber));
                    }
                    return true;
                });
                this.sammy.get('#/page/:pageNumber/', function () {
                    var trail = self.trail(), clone;
                    if(trail.length > 0 && trail[trail.length - 1] === this.path) {
                        return;
                    }
                    if(trail.length > 1 && trail[trail.length - 2] === this.path) {
                        trail.pop();
                        self.swipeCallback = function () {
                            clone = self.$itemsPage.clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                            clone.appendTo(self.$itemsPage.parent());
                            self.$itemsPage.attr('data-side-swiper', 'off').hide();
                            self.lockAnimation();
                            $(window).scrollTop(0);
                            self.sideSwiper.prev(1, function () {
                                self.$itemsPage.siblings().remove();
                                self.unlockAnimation();
                            });
                        };
                        return;
                    } else {
                        if(trail.length > 0) {
                            self.swipeCallback = function () {
                                clone = self.$itemsPage.clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                                clone.insertBefore(self.$itemsPage);
                                self.$itemsPage.attr('data-side-swiper', 'off').hide();
                                self.lockAnimation();
                                $(window).scrollTop(0);
                                self.sideSwiper.next(1, function () {
                                    self.unlockAnimation();
                                });
                            };
                        }
                    }
                    trail.push(this.path);
                });
                this.sammy.get('/establishments[\/]?', function () {
                    this.app.setLocation('#/page/1/');
                });
                ko.computed(function () {
                    _this.requestResults();
                }).extend({
                    throttle: 1
                });
            }
            Search.prototype.setLocation = function () {
                var location = '#/page/' + this.pageNumber() + '/';
                if(this.sammy.getLocation() !== location) {
                    this.sammy.setLocation(location);
                }
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
                if(!js) {
                    ko.mapping.fromJS({
                        items: [],
                        itemTotal: 0
                    }, this.resultsMapping, this);
                } else {
                    ko.mapping.fromJS(js, this.resultsMapping, this);
                }
                App.WindowScroller.restoreTop();
                this.spinner.stop();
                this.swipeCallback();
                this.transitionedPageNumber(this.pageNumber());
            };
            Search.prototype.requestResults = function () {
                var _this = this;
                if(this.pageSize() === undefined || this.orderBy() === undefined) {
                    return;
                }
                this.spinner.start();
                $.get(App.Routes.WebApi.Establishments.get(), {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    countryCode: this.countryCode(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                }).done(function (response) {
                    _this.receiveResults(response);
                });
            };
            Search.prototype.gotoAddNew = function () {
                return true;
            };
            return Search;
        })(ViewModels.PagedSearch);
        Establishments.Search = Search;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
