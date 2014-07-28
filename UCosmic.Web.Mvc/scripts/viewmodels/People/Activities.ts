module People.ViewModels {
    export class ActivityInputModel {
        constructor(modelData: any) {
            this.modelData = modelData;
            this.pageSize(this.modelData.pageSize);
            this.pageNumber((this.modelData.pageNumber != null) ? this.modelData.pageNumber : "1");
            this.keyword(this.modelData.keyword);
            this.orderBy(this.modelData.orderBy);
            var pageCount = (modelData.itemTotal / parseInt(this.pageSize()));
            if (parseInt(pageCount.toString()) < pageCount) {
                pageCount = parseInt(pageCount.toString()) + 1
            }
            this._setupCountryDropDown();
            if (parseInt(this.pageNumber()) >= pageCount) {
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
            $("form").submit((event) => {
                this.loadingSpinner.start();
            });
            $('a').click(() => {
                this.loadingSpinner.start();
            });
        }
        loadingSpinner = new App.Spinner();
        modelData;
        isDraft: KnockoutComputed<boolean>;
        isPublished: KnockoutComputed<boolean>;
        $form: JQuery;
        pageSize = ko.observable<string>();
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

                        this.countryCode(this.modelData.countryCode);
                        this.hasInitialized = true;
                    });
            })
                .extend({ throttle: 1 });
        }
        optionsEnabled = ko.observable(false);

        purgeSpinner = new App.Spinner();
        $confirmDeleteActivity: JQuery;
        private _purge(expertiseId): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.Activities.del(expertiseId),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                },
                error: (xhr: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                    App.Failures.message(xhr, 'while deleting your activity', true);
                }
            });
        }
        purge(expertiseId, personId, thisData, event): void {
            this.purgeSpinner.start();
            if (this.$confirmDeleteActivity && this.$confirmDeleteActivity.length) {
                this.$confirmDeleteActivity.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: (): void => {
                                this.$confirmDeleteActivity.dialog('close');
                                this.purgeSpinner.start(true);
                                this._purge(expertiseId);
                                window.location.href = App.Routes.Mvc.People.Activities.get(personId);
                            },
                            'data-confirm-delete-link': true,
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.$confirmDeleteActivity.dialog('close');
                            },
                            'data-css-link': true,
                        }
                    ],
                    close: (): void => {
                        this.purgeSpinner.stop();
                    },
                });
            }
            else {
                if (confirm('Are you sure you want to delete this activity?')) {
                    this._purge(expertiseId);
                }
                else {
                    this.purgeSpinner.stop();
                }
            }
        }
        edit(id): void {
            window.location.href = App.Routes.Mvc.My.Activities.edit(id)
        }
        addActivity(): void {
            window.location.href = App.Routes.Mvc.My.Activities.create();
        }

    }

}
