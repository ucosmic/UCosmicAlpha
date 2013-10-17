/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="Pagination.d.ts" />
var App;
(function (App) {
    var Pager = (function () {
        function Pager(pageNumber, pageSize) {
            this.items = ko.observableArray();
            this.input = new PagerStatus(pageNumber, pageSize);
            this.output = new PagerStatus(pageNumber, pageSize);
        }
        Pager.prototype.apply = function (page) {
            this.input.apply(page);
            this.output.apply(page);
            this.items(page.items);
        };
        return Pager;
    })();
    App.Pager = Pager;

    var PagerStatus = (function () {
        function PagerStatus(pageNumber, pageSize) {
            var _this = this;
            this.pageNumberText = ko.observable('1');
            this.pageSizeText = ko.observable('10');
            this.itemCount = ko.observable();
            this.itemTotal = ko.observable();
            this.pageNumber = ko.computed(function () {
                return parseInt(_this.pageNumberText());
            });
            this.pageSize = ko.computed(function () {
                return parseInt(_this.pageSizeText());
            });
            this.isItemTotalDefined = ko.computed(function () {
                var itemTotal = _this.itemTotal();
                return itemTotal || itemTotal == 0;
            });
            this.pageCount = ko.computed(function () {
                if (!_this.isItemTotalDefined())
                    return undefined;
                return Math.ceil(_this.itemTotal() / _this.pageSize());
            });
            this.pageIndex = ko.computed(function () {
                return _this.pageNumber() - 1;
            });
            this.firstIndex = ko.computed(function () {
                return _this.pageIndex() * _this.pageSize();
            });
            this.firstNumber = ko.computed(function () {
                return _this.firstIndex() + 1;
            });
            this.lastNumber = ko.computed(function () {
                if (!_this.isItemTotalDefined())
                    return 0;
                return _this.firstIndex() + _this.itemCount();
            });
            this.lastIndex = ko.computed(function () {
                return _this.lastNumber() - 1;
            });
            this.nextAllowed = ko.computed(function () {
                var pageCount = _this.pageCount();
                return pageCount == undefined || pageCount > _this.pageNumber();
            });
            this.prevAllowed = ko.computed(function () {
                var pageNumber = _this.pageNumber() - 1;
                return pageNumber > 0;
            });
            this.hasItems = ko.computed(function () {
                return _this.isItemTotalDefined() && _this.itemTotal() > 0;
            });
            this.hasManyItems = ko.computed(function () {
                return _this.lastNumber() > _this.firstNumber();
            });
            this.hasNoItems = ko.computed(function () {
                return !_this.hasItems();
            });
            this.hasManyPages = ko.computed(function () {
                return _this.pageCount() > 1;
            });
            this.pageNumberText(pageNumber);
            this.pageSizeText(pageSize);
        }
        PagerStatus.prototype.apply = function (page) {
            this.pageSizeText(page.pageSize.toString());
            this.pageNumberText(page.itemTotal > 0 ? page.pageNumber.toString() : '1');
            this.itemTotal(page.itemTotal);
            this.itemCount(page.items.length);
        };

        PagerStatus.prototype.next = function () {
            var pageNumber = this.pageNumber() + 1;
            this.pageNumberText(pageNumber.toString());
        };

        PagerStatus.prototype.prev = function () {
            var pageNumber = this.pageNumber() - 1;
            this.pageNumberText(pageNumber.toString());
        };
        return PagerStatus;
    })();
    App.PagerStatus = PagerStatus;
})(App || (App = {}));
