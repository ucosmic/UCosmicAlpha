function EstablishmentResultViewModel(js) {
    var self = this;
    ko.mapping.fromJS(js, {}, self);
}

function EstablishmentSearchViewModel() {
    var self = this;

    // query parameters
    self.countries = ko.observableArray();
    self.countryCode = ko.observable();
    self.keyword = ko.observable();

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

    // results
    self.items = ko.observableArray();
    self.itemsMapping = {
        'items': {
            key: function (data) {
                return ko.utils.unwrapObservable(data.revisionId);
            },
            create: function (options) {
                return new EstablishmentResultViewModel(options.data);
            }
        },
        ignore: ['pageSize', 'pageNumber', 'pageIndex']
    };
    self.updateItems = function (js) {
        if (!js) {
            ko.mapping.fromJS({
                items: [],
                itemTotal: 0
            }, self.itemsMapping, self);
        }
        else {
            ko.mapping.fromJS(js, self.itemsMapping, self);
        }
    };

    // countries dropdown
    ko.computed(function () {
        $.get(app.webApiRoutes.Countries.Get())
        .success(function (response) {
            self.countries(response);
        });
    })
    .extend({ throttle: 1 });

    // results server hit
    ko.computed(function () {
        if (self.pageSize() === undefined)
            return;
        $.get('/api/establishments', {
            pageSize: self.pageSize(),
            pageNumber: self.pageNumber()
        })
        .success(function (response) {
            self.updateItems(response);
        });
    })
    .extend({ throttle: 1 });
}
