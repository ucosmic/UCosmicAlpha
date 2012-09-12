function EstablishmentResultViewModel(js) {
    var self = this;
    ko.mapping.fromJS(js, {}, self);

    self.nullDisplayCountryName = ko.computed(function () {
        return self.countryName() || '[Undefined]';
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
    self.pageNumber = ko.observable(1);
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
            self.pageNumber(parseInt(self.pageNumber()) + 1);
        }
    };
    self.prevPage = function () {
        if (self.prevEnabled()) {
            self.pageNumber(parseInt(self.pageNumber()) - 1);
        }
    };
    self.nextEnabled = ko.computed(function () {
        return self.pageNumber() < self.pageCount();
    });
    self.prevEnabled = ko.computed(function () {
        return self.pageNumber() > 1;
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
    self.startSpinning = function() {
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
    self.updateResults = function (js) {
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

    // results server hit
    ko.computed(function () {
        if (self.pageSize() === undefined)
            return;
        self.startSpinning();
        $.get('/api/establishments', {
            pageSize: self.pageSize(),
            pageNumber: self.pageNumber(),
            countryCode: self.countryCode(),
            keyword: self.throttledKeyword()
        })
        .success(function (response) {
            self.updateResults(response);
        });
    })
    .extend({ throttle: 1 });
}
