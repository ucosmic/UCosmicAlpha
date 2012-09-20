function EstablishmentResultViewModel(js) {
    var self = this;
    ko.mapping.fromJS(js, {}, self);

    self.nullDisplayCountryName = ko.computed(function () {
        return self.countryName() || '[Undefined]';
    });

    self.clickAction = function () {
        // placeholder for click action
    };

    self.openWebsiteUrl = function (vm, e) {
        e.stopPropagation();
        return true;
    };

    self.fitWebsiteUrl = ko.computed(function () {
        var value = self.websiteUrl();
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
}

function EstablishmentSearchViewModel() {
    var self = this;

    // query parameters
    self.countries = ko.observableArray();
    self.countryCode = ko.observable();
    self.keyword = ko.observable();
    self.throttledKeyword = ko.computed(self.keyword)
        .extend({ throttle: 400 });
    self.orderBy = ko.observable();

    // countries dropdown
    ko.computed(function () {
        $.get(app.webApiRoutes.Countries.Get())
        .success(function (response) {
            response.splice(response.length, 0, { code: '-1', name: '[Without country]' });
            self.countries(response);
        });
    })
    .extend({ throttle: 1 });

    // paging
    self.pageSize = ko.observable();
    self.pageNumber = ko.observable();
    self.itemTotal = ko.observable();
    self.pageCount = ko.observable();
    self.firstIndex = ko.observable();
    self.firstNumber = ko.observable();
    self.lastIndex = ko.observable();
    self.lastNumber = ko.observable();
    self.pageNumbers = ko.observableArray([1]);
    self.pageCount.subscribe(function (newValue) {
        var numbers = [];
        for (var i = 1; i <= newValue; i++) {
            numbers.push(i);
        }
        self.pageNumbers(numbers);
    });
    self.nextPage = function () {
        if (self.nextEnabled()) {
            var pageNumber = parseInt(self.pageNumber()) + 1;
            self.pageNumber(pageNumber);
            location.hash = '/page/' + pageNumber;
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
                return ko.utils.unwrapObservable(data.revisionId);
            },
            create: function (options) {
                return new EstablishmentResultViewModel(options.data);
            }
        },
        ignore: ['pageSize', 'pageNumber']
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
        self.stopSpinning();
    };

    self.requestResults = function () {
        if (self.pageSize() === undefined || self.orderBy() === undefined)
            return;
        self.startSpinning();

        $.get('/api/establishments', {
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

    var sam;
    self.sammy = function() {
        if (sam) return sam;
        sam = Sammy(function () {
            this.before(/.*/, function () {
                if (self.nextForceDisabled() || self.prevForceDisabled())
                    return false;

                var pageNumber = this.params['pageNumber'];

                // make sure the viewmodel pagenumber is in sync with the route
                if (pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber()))
                    self.pageNumber(parseInt(pageNumber));
                return true;
            });

            this.get('#/page/:pageNumber', function () {
                var pageNumber = this.params['pageNumber'],
                    trail = self.trail(),
                    clone;
                if (trail.length > 0 && trail[trail.length - 1] === this.path) return;
                if (trail.length > 1 && trail[trail.length - 2] === this.path) {
                    // swipe backward
                    trail.pop();
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
                    return;
                } else if (trail.length > 0) {
                    // swipe forward
                    clone = self.$itemsPage().clone(true)
                        .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
                    clone.insertBefore(self.$itemsPage());
                    self.$itemsPage().attr('data-side-swiper', 'off').hide();
                    self.lockAnimation();
                    $(window).scrollTop(0);
                    self.sideSwiper.next(1, function () {
                        self.unlockAnimation();
                        //self.nextForceDisabled(false);
                    });
                }
                trail.push(this.path);
            });

            this.get('', function () {
                this.app.runRoute('get', '#/page/1');
            });
        });
        return sam;
    };

    // results server hit
    ko.computed(self.requestResults).extend({ throttle: 1 });
}
