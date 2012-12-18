var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var Search = (function () {
            function Search() {
                var _this = this;
                this.sammy = Sammy();
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                this.keywordElement = undefined;
                this.keyword = ko.observable($('input[type=hidden][data-bind="value: keyword"]').val());
                this.orderBy = ko.observable();
                this.pageSize = ko.observable();
                this.pageNumber = ko.observable();
                this.transitionedPageNumber = ko.observable();
                this.itemTotal = ko.observable();
                this.nextForceDisabled = ko.observable(false);
                this.prevForceDisabled = ko.observable(false);
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
                this.spinnerDelay = 400;
                this.isSpinning = ko.observable(true);
                this.showSpinner = ko.observable(false);
                this.inTransition = ko.observable(false);
                this.itemsPage = undefined;
                this.initialized = ko.observable(false);
                this.sideSwiper = new App.SideSwiper({
                    frameWidth: 710,
                    speed: 'fast',
                    root: '#search'
                });
                this.trail = ko.observableArray([]);
                this.items = ko.observableArray();
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
                this.throttledKeyword = ko.computed(this.keyword).extend({
                    throttle: 400
                });
                ko.computed(function () {
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();
                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        var emptyValue = new ViewModels.Countries.ServerApiModel('-1', '[Without country]');
                        response.splice(response.length, 0, emptyValue);
                        _this.countries(response);
                        if(lastCountryCode && lastCountryCode !== _this.countryCode()) {
                            _this.countryCode(lastCountryCode);
                        }
                    });
                }).extend({
                    throttle: 1
                });
                this.pageCount = ko.computed(function () {
                    return Math.ceil(_this.itemTotal() / _this.pageSize());
                });
                this.pageIndex = ko.computed(function () {
                    return parseInt(_this.transitionedPageNumber()) - 1;
                });
                this.firstIndex = ko.computed(function () {
                    return _this.pageIndex() * _this.pageSize();
                });
                this.firstNumber = ko.computed(function () {
                    return _this.firstIndex() + 1;
                });
                this.lastNumber = ko.computed(function () {
                    if(!_this.items) {
                        return 0;
                    }
                    return _this.firstIndex() + _this.items().length;
                });
                this.lastIndex = ko.computed(function () {
                    return _this.lastNumber() - 1;
                });
                this.nextEnabled = ko.computed(function () {
                    return _this.pageNumber() < _this.pageCount() && !_this.nextForceDisabled();
                });
                this.prevEnabled = ko.computed(function () {
                    return _this.pageNumber() > 1 && !_this.prevForceDisabled();
                });
                this.hasManyPages = ko.computed(function () {
                    return _this.pageCount() > 1;
                });
                this.hasManyItems = ko.computed(function () {
                    return _this.lastNumber() > _this.firstNumber();
                });
                this.pageCount.subscribe(function (newValue) {
                    if(_this.pageNumber() && _this.pageNumber() > newValue) {
                        _this.pageNumber(1);
                    }
                });
                this.pageNumber.subscribe(function (newValue) {
                    _this.setLocation();
                });
                this.hasItems = ko.computed(function () {
                    return _this.items() && _this.items().length > 0;
                });
                this.hasNoItems = ko.computed(function () {
                    return !_this.isSpinning() && !_this.hasItems();
                });
                this.showStatus = ko.computed(function () {
                    return _this.hasItems() && !_this.showSpinner();
                });
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
                    var trail = self.trail();
                    var clone;

                    if(trail.length > 0 && trail[trail.length - 1] === this.path) {
                        return;
                    }
                    if(trail.length > 1 && trail[trail.length - 2] === this.path) {
                        trail.pop();
                        self.swipeCallback = function () {
                            clone = self.$itemsPage().clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                            clone.appendTo(self.$itemsPage().parent());
                            self.$itemsPage().attr('data-side-swiper', 'off').hide();
                            self.lockAnimation();
                            $(window).scrollTop(0);
                            self.sideSwiper.prev(1, function () {
                                self.$itemsPage().siblings().remove();
                                self.unlockAnimation();
                            });
                        };
                        return;
                    } else {
                        if(trail.length > 0) {
                            self.swipeCallback = function () {
                                clone = self.$itemsPage().clone(true).removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                                clone.insertBefore(self.$itemsPage());
                                self.$itemsPage().attr('data-side-swiper', 'off').hide();
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
            Search.prototype.nextPage = function () {
                if(this.nextEnabled()) {
                    var pageNumber = parseInt(this.pageNumber()) + 1;
                    this.pageNumber(pageNumber);
                }
            };
            Search.prototype.prevPage = function () {
                if(this.prevEnabled()) {
                    history.back();
                }
            };
            Search.prototype.changeLens = function (lens) {
                this.lens(lens.value);
            };
            Search.prototype.startSpinning = function () {
                var _this = this;
                this.isSpinning(true);
                if(this.spinnerDelay < 1) {
                    this.showSpinner(true);
                } else {
                    setTimeout(function () {
                        if(_this.isSpinning() && !_this.inTransition()) {
                            _this.showSpinner(true);
                        }
                    }, this.spinnerDelay);
                }
            };
            Search.prototype.stopSpinning = function () {
                this.inTransition(false);
                this.showSpinner(false);
                this.isSpinning(false);
            };
            Search.prototype.$itemsPage = function () {
                return $(this.itemsPage);
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
                this.stopSpinning();
                this.swipeCallback();
                this.transitionedPageNumber(this.pageNumber());
            };
            Search.prototype.requestResults = function () {
                var _this = this;
                if(this.pageSize() === undefined || this.orderBy() === undefined) {
                    return;
                }
                this.startSpinning();
                $.get(App.Routes.WebApi.Establishments.get(), {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    countryCode: this.countryCode(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                }).done(function (response) {
                    _this.receiveResults(response);
                    _this.initialized(true);
                });
            };
            Search.prototype.gotoAddNew = function () {
                return true;
            };
            return Search;
        })();
        Establishments.Search = Search;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;

})(ViewModels || (ViewModels = {}));

