/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="Pagination.d.ts" />

module App {
    export class Pager<T> {

        input: PagerStatus;
        output: PagerStatus;
        items = ko.observableArray<T>();

        constructor(pageNumber: string, pageSize: string) {
            this.input = new PagerStatus(pageNumber, pageSize);
            this.output = new PagerStatus(pageNumber, pageSize);
        }

        apply(page: PageOf<T>): void {
            this.input.apply(page);
            this.output.apply(page);
            this.items(page.items);
        }
    }

    export class PagerStatus {

        pageNumberText = ko.observable<string>('1');
        pageSizeText = ko.observable<string>('10');
        itemCount = ko.observable<number>();
        itemTotal = ko.observable<number>();

        constructor(pageNumber: string, pageSize: string) {
            this.pageNumberText(pageNumber);
            this.pageSizeText(pageSize);
        }

        pageNumber: KnockoutComputed<number> = ko.computed((): number => {
            return parseInt(this.pageNumberText());
        });
        pageSize: KnockoutComputed<number> = ko.computed((): number => {
            return parseInt(this.pageSizeText());
        });

        apply(page: PageOf<any>): void {
            this.pageSizeText(page.pageSize.toString());
            this.pageNumberText(page.itemTotal > 0 ? page.pageNumber.toString() : '1');
            this.itemTotal(page.itemTotal);
            this.itemCount(page.items.length);
        }

        isItemTotalDefined: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var itemTotal = this.itemTotal();
            return itemTotal || itemTotal == 0 ? true : false;
        });

        pageCount: KnockoutComputed<number> = ko.computed((): number => {
            if (!this.isItemTotalDefined()) return undefined;
            return Math.ceil(this.itemTotal() / this.pageSize());
        });

        pageNumberOptions: KnockoutComputed<number[]> = ko.computed((): number[]=> {
            var options: number[] = [1];
            var pageCount = this.pageCount();
            if (!pageCount) return options;
            for (var i = 1; i < pageCount; i++) {
                options[i] = i + 1;
            }
            return options;
        });

        private _pageNumberChanged: KnockoutComputed<void> = ko.computed((): void => {
            // changes when applyBindings happens and after options data is loaded
            var pageNumber = this.pageNumber();
            var options = this.pageNumberOptions();
            // keep pageNumber as an option so that we don't lose it when options change
            if (options.length == 1 && options[0] != pageNumber)
                options[0] = pageNumber;
        });

        pageIndex: KnockoutComputed<number> = ko.computed((): number => {
            return this.pageNumber() - 1;
        });

        firstIndex: KnockoutComputed<number> = ko.computed((): number => {
            return this.pageIndex() * this.pageSize();
        });

        firstNumber: KnockoutComputed<number> = ko.computed((): number => {
            return this.firstIndex() + 1;
        });

        lastNumber: KnockoutComputed<number> = ko.computed((): number => {
            if (!this.isItemTotalDefined()) return 0;
            return this.firstIndex() + this.itemCount();
        });

        lastIndex: KnockoutComputed<number> = ko.computed((): number => {
            return this.lastNumber() - 1;
        });

        next(): void {
            var pageNumber = this.pageNumber() + 1;
            this.pageNumberText(pageNumber.toString());
        }

        nextAllowed: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var pageCount = this.pageCount();
            return pageCount == undefined || pageCount > this.pageNumber();
        });

        prev(): void {
            var pageNumber = this.pageNumber() - 1;
            this.pageNumberText(pageNumber.toString());
        }

        prevAllowed: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var pageNumber = this.pageNumber() - 1;
            return pageNumber > 0;
        });

        hasItems: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.isItemTotalDefined() && this.itemTotal() > 0;
        });

        hasManyItems: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.lastNumber() > this.firstNumber();
        });

        hasNoItems: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return !this.hasItems();
        });

        hasManyPages: KnockoutComputed<boolean> = ko.computed((): boolean => {
            return this.pageCount() > 1;
        });
    }
}