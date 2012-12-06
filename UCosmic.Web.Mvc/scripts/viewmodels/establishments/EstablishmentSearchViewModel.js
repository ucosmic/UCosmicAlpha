/// <reference path="../../jquery/jquery-1.8.3.js" />
/// <reference path="../../jquery/jquery-ui-1.9.2.js" />
/// <reference path="../../ko/knockout-2.2.0.js" />
/// <reference path="../../sammy/sammy-0.7.1.js" />
/// <reference path="../../app/side-swiper.js" />
/// <reference path="../../app/app.js" />
/// <reference path="../../app/App2.js" />

function EstablishmentResultViewModel(js) {
    var self = this;
    ko.mapping.fromJS(js, {}, self);

    self.nullDisplayCountryName = ko.computed(function () {
        return self.countryName() || '[Undefined]';
    });

    self.clickAction = function (vm, e) {
        var $target = $(e.target), href;
        while ($target.length && !$target.attr('href') && !$target.attr('data-href')) {
            $target = $target.parent();
        }
        if ($target.length) {
            href = $target.attr('href') || $target.attr('data-href');
            location.href = href.replace('/0/', '/' + self.id() + '/');
        }
    };

    self.openOfficialUrl = function (vm, e) {
        e.stopPropagation();
        return true;
    };

    self.fitOfficialUrl = ko.computed(function () {
        var value = self.officialUrl();
        if (!value) return value;

        var computedValue = value;
        var protocolIndex = computedValue.indexOf('://');
        if (protocolIndex > 0)
            computedValue = computedValue.substr(protocolIndex + 3);
        var slashIndex = computedValue.indexOf('/');
        if (slashIndex > 0) {
            if (slashIndex < computedValue.length - 1) {
                computedValue = computedValue.substr(slashIndex + 1);
                computedValue = value.substr(0, value.indexOf(computedValue)) + '...';
            }
        }
        return computedValue;
    });

    self.officialNameMatchesTranslation = ko.computed(function () {
        return self.officialName() === self.translatedName();
    });

    self.officialNameDoesNotMatchTranslation = ko.computed(function () {
        return !self.officialNameMatchesTranslation();
    });
}

function EstablishmentSearchViewModel() {
    var self = this;

    self.setLocation = function () {
        var location = '#/page/' + self.pageNumber() + '/';
        if (self.sammy().getLocation() !== location)
            self.sammy().setLocation(location);
    };

    // query parameters
    self.countries = ko.observableArray();
    self.countryCode = ko.observable();
    self.keywordElement = undefined;
    var lastKeyword = $('input[type=hidden][data-bind="value: keyword"]').val();
    self.keyword = ko.observable(lastKeyword);
    self.throttledKeyword = ko.computed(self.keyword)
        .extend({ throttle: 400 });
    self.orderBy = ko.observable();

    // countries dropdown
    ko.computed(function () {
        var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();
        $.get(app.routes.webApi.countries.get())
        .success(function (response) {
            response.splice(response.length, 0, { code: '-1', name: '[Without country]' });
            self.countries(response);
            if (lastCountryCode && lastCountryCode !== self.countryCode())
                self.countryCode(lastCountryCode);
        });
    })
    .extend({ throttle: 1 });

    // paging
    self.pageSize = ko.observable();
    self.pageNumber = ko.observable();
    self.transitionedPageNumber = ko.observable();
    self.itemTotal = ko.observable();
    self.pageCount = ko.computed(function () {
        return Math.ceil(self.itemTotal() / self.pageSize());
    });
    self.pageIndex = ko.computed(function () {
        return parseInt(self.transitionedPageNumber()) - 1;
    });
    self.firstIndex = ko.computed(function () {
        return self.pageIndex() * self.pageSize();
    });
    self.firstNumber = ko.computed(function () {
        return self.firstIndex() + 1;
    });
    self.lastNumber = ko.computed(function () {
        if (!self.items) return 0;
        return self.firstIndex() + self.items().length;
    });
    self.lastIndex = ko.computed(function () {
        return self.lastNumber() - 1;
    });
    self.pageCount.subscribe(function (newValue) {
        if (self.pageNumber() && self.pageNumber() > newValue) {
            self.pageNumber(1);
        }
    });
    self.pageNumber.subscribe(self.setLocation);
    self.nextPage = function () {
        if (self.nextEnabled()) {
            var pageNumber = parseInt(self.pageNumber()) + 1;
            self.pageNumber(pageNumber);
        }
    };
    self.prevPage = function () {
        if (self.prevEnabled()) {
            history.back();
        }
    };
    self.nextForceDisabled = ko.observable(false);
    self.nextEnabled = ko.computed(function () {
        return self.pageNumber() < self.pageCount() && !self.nextForceDisabled();
    });
    self.prevForceDisabled = ko.observable(false);
    self.prevEnabled = ko.computed(function () {
        return self.pageNumber() > 1 && !self.prevForceDisabled();
    });
    self.hasManyPages = ko.computed(function () {
        return self.pageCount() > 1;
    });
    self.hasManyItems = ko.computed(function () {
        return self.lastNumber() > self.firstNumber();
    });

    // lensing
    self.lenses = ko.observableArray([
        { text: 'Table', value: 'table' },
        { text: 'List', value: 'list' },
        { text: 'Grid', value: 'grid' },
        { text: 'Map', value: 'map' },
        { text: 'Tree', value: 'tree' }
    ]);
    self.lens = ko.observable();
    self.changeLens = function (lens) {
        self.lens(lens.value);
    };

    // spinner
    self.isSpinning = ko.observable(true);
    self.showSpinner = ko.observable(false);
    self.spinnerDelay = 400;
    self.inTransition = ko.observable(false);
    self.startSpinning = function () {
        self.isSpinning(true); // we are entering an ajax call
        if (self.spinnerDelay < 1)
            self.showSpinner(true);
        else
            setTimeout(function () {
                // only show spinner when load is still being processed
                if (self.isSpinning() && !self.inTransition())
                    self.showSpinner(true);
            }, self.spinnerDelay);
    };
    self.stopSpinning = function () {
        self.inTransition(false);
        self.showSpinner(false);
        self.isSpinning(false);
    };

    // items page
    self.itemsPage = undefined;
    self.$itemsPage = function () {
        return $(self.itemsPage);
    };
    self.initialized = ko.observable(false);
    self.sideSwiper = new SideSwiper({
        frameWidth: 710,
        speed: 'fast',
        root: '#search'
    });
    self.trail = ko.observableArray([]);
    self.lockAnimation = function () {
        self.nextForceDisabled(true);
        self.prevForceDisabled(true);
    };
    self.unlockAnimation = function () {
        self.nextForceDisabled(false);
        self.prevForceDisabled(false);
    };

    // results
    self.items = ko.observableArray();
    self.hasItems = ko.computed(function () {
        return self.items() && self.items().length > 0;
    });
    self.hasNoItems = ko.computed(function () {
        return !self.isSpinning() && !self.hasItems();
    });
    self.showStatus = ko.computed(function () {
        return self.hasItems() && !self.showSpinner();
    });
    self.resultsMapping = {
        'items': {
            key: function (data) {
                return ko.utils.unwrapObservable(data.id);
            },
            create: function (options) {
                return new EstablishmentResultViewModel(options.data);
            }
        },
        ignore: ['pageSize', 'pageNumber']
    };
    self.swipeCallback = function () {
    };
    self.receiveResults = function (js) {
        if (!js) {
            ko.mapping.fromJS({
                items: [],
                itemTotal: 0
            }, self.resultsMapping, self);
        }
        else {
            ko.mapping.fromJS(js, self.resultsMapping, self);
        }
        App.WindowScroller.restoreTop(); // restore scroll when coming back from detail page
        self.stopSpinning();
        self.swipeCallback();
        self.transitionedPageNumber(self.pageNumber());
    };

    self.requestResults = function () {
        if (self.pageSize() === undefined || self.orderBy() === undefined)
            return;
        self.startSpinning();

        $.get(app.routes.webApi.establishments.get(), {
            pageSize: self.pageSize(),
            pageNumber: self.pageNumber(),
            countryCode: self.countryCode(),
            keyword: self.throttledKeyword(),
            orderBy: self.orderBy()
        })
        .success(function (response) {
            self.receiveResults(response);
            self.initialized(true);
        });
    };

    // go to add new
    self.gotoAddNew = function () {
        return true;
    };

    var sam;
    self.sammy = function () {
        if (sam) return sam;
        sam = Sammy(function () {
            this.before(/\#\/page\/(.*)/, function () {
                if (self.nextForceDisabled() || self.prevForceDisabled())
                    return false;

                var pageNumber = this.params['pageNumber'];

                // make sure the viewmodel pagenumber is in sync with the route
                if (pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber()))
                    self.pageNumber(parseInt(pageNumber));
                return true;
            });

            this.get('#/page/:pageNumber/', function () {
                var trail = self.trail(),
                    clone;
                if (trail.length > 0 && trail[trail.length - 1] === this.path) return;
                if (trail.length > 1 && trail[trail.length - 2] === this.path) {
                    // swipe backward
                    trail.pop();
                    self.swipeCallback = function () {
                        clone = self.$itemsPage().clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
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
                } else if (trail.length > 0) {
                    // swipe forward
                    self.swipeCallback = function () {
                        clone = self.$itemsPage().clone(true)
                            .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                        clone.insertBefore(self.$itemsPage());
                        self.$itemsPage().attr('data-side-swiper', 'off').hide();
                        self.lockAnimation();
                        $(window).scrollTop(0);
                        self.sideSwiper.next(1, function () {
                            self.unlockAnimation();
                        });
                    };
                }
                trail.push(this.path);
            });

            this.get('/establishments[\/]?', function () { // match /establishments or /establishments/
                this.app.setLocation('#/page/1/');
            });
        });
        return sam;
    };

    // results server hit
    ko.computed(self.requestResults).extend({ throttle: 1 });
}
