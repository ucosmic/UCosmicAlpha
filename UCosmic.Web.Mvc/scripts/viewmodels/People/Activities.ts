module People.ViewModels {

    export class ActivityInputModel {
        constructor(modelData: any) {
            this.modelData = modelData;
            this.pageSize(this.modelData.PageSize);
            this.pageNumber((this.modelData.PageNumber != null) ? this.modelData.PageNumber : "1");
            this.keyword(this.modelData.Keyword);
            this.orderBy(this.modelData.OrderBy);

            this._setupCountryDropDown();
            if (this.pageNumber() >= modelData.PageCount) {
                this.nextEnabled(false);
            }
            if (parseInt(this.pageNumber()) == 1) {
                this.prevEnabled(false);
            }
            this.pageNumber.subscribe(function (newValue) {
                if (this.hasInitialized) {
                    this.search();
                }
            }, this);
            this.orderBy.subscribe(function (newValue) {
                if (this.hasInitialized) {
                    this.search();
                }
            }, this);
            this.pageSize.subscribe(function (newValue) {
                if (this.hasInitialized) {
                    this.search();
                }
                this.optionsEnabled(true);
            }, this);
            this.countryCode.subscribe(function (newValue) {
                if (this.hasInitialized) {
                    this.hasInitialized = true;
                    this.search();
                }
            }, this);
        }
        modelData;
        $form: JQuery;
        pageSize = ko.observable();
        pageNumber = ko.observable<string>();
        keyword = ko.observable();
        countries = ko.observableArray<Places.ApiModels.Country>();
        countryCode = ko.observable<string>();
        prevEnabled = ko.observable(true);
        nextEnabled = ko.observable(true);
        orderBy = ko.observable();

        nextPage(model, event): void {
            event.preventDefault();
            this.pageNumber((parseInt(this.pageNumber()) + 1).toString());
            this.search();
        }

        prevPage(model, event): void {
            event.preventDefault();
            this.pageNumber((parseInt(this.pageNumber()) - 1).toString());
            this.search();
        }


        search(): void {
            this.$form.submit();
        }
        hasInitialized = false;

        // countries dropdown
        private _setupCountryDropDown(): void {
            ko.computed((): void => {

                // populate countryCode based on last value when paging backwards
                var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                $.get(App.Routes.WebApi.Countries.get()) // hit the API
                    .done((response: Places.ApiModels.Country[]): void => {
                        // setup empty value
                        var emptyValue: Places.ApiModels.Country = {
                            code: '-1',
                            name: '[Without country]'
                        };
                        response.splice(response.length, 0, emptyValue);

                        this.countries(response); // push into observable array

                        this.countryCode(this.modelData.CountryCode);
                        this.hasInitialized = true;
                    });
            })
                .extend({ throttle: 1 });
        }
        optionsEnabled = ko.observable(false);
    }

}
