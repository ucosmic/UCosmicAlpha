function EstablishmentResultViewModel(js) {
    var self = this;
    ko.mapping.fromJS(js, {}, self);
}

function EstablishmentSearchViewModel() {
    var self = this;

    self.countries = ko.observableArray();
    self.countryCode = ko.observable();
    self.keyword = ko.observable();

    self.pageSize = ko.observable();
    self.pageNumber = ko.observable();
    self.itemTotal = ko.observable();
    self.pageCount = ko.observable();
    self.firstIndex = ko.observable();
    self.firstNumber = ko.observable();
    self.lastIndex = ko.observable();
    self.lastNumber = ko.observable();
    self.pageNumbers = ko.computed(function () {
        var numbers = [];
        for (var i = 1; i <= self.pageCount() ; i++) {
            numbers.push(i);
        }
        return numbers;
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

    self.items = ko.observableArray();
    self.itemsMapping = {
        key: function (data) {
            return ko.utils.unwrapObservable(data.revisionId);
        },
        create: function (options) {
            return new EstablishmentResultViewModel(options.data);
        },
        ignore: ['pageSize', 'pageNumber', 'pageIndex']
    };
    self.updateItems = function (js) {
        if (!js) {
            self.items([]);
        }
        else {
            ko.mapping.fromJS(js, self.itemsMapping, self);
        }
    };

    ko.computed(function () {
        $.get(app.webApiRoutes.Countries.Get())
        .success(function (response) {
            self.countries(response);
        });
    })
    .extend({ throttle: 1 });

    ko.computed(function () {
        if (self.pageSize() === undefined) return;
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
