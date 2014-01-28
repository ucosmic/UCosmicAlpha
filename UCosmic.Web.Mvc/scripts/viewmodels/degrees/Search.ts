module Degrees.ViewModels {

    export interface SearchSettings {
        input: ApiModels.SearchInput;
        output: App.PageOf<ApiModels.SearchResult>;
        countryOptions: App.ApiModels.SelectOption<string>[];
    }

    export class Search {
        //#region Construction

        countryOptions = ko.observableArray(this.settings.countryOptions);
        countryCode = ko.observable(this.settings.input.countryCode);
        orderBy = ko.observable(this.settings.input.orderBy);
        keyword = ko.observable(this.settings.input.keyword);
        pager = new App.Pager<ApiModels.SearchResult>(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());

        $form: JQuery;
        loadingSpinner = new App.Spinner()

        constructor(public settings: SearchSettings) {
            this.pager.apply(this.settings.output);
        }

        //#endregion
        //#region Initialization

        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            kendo.init($(element));
            this._applySubscriptions();
        }

        private _applySubscriptions(): void {
            this.pager.input.pageSizeText.subscribe((newValue: string): void => { this._submitForm(); });
            this.pager.input.pageNumberText.subscribe((newValue: string): void => { this._submitForm(); });
            this.countryCode.subscribe((newValue: string): void => { this._submitForm(); });
            this.orderBy.subscribe((newValue: string): void => { this._submitForm(); });
        }

        //#endregion
        //#region Automatic Form Submits

        private _submitForm(): void {
            if (this.loadingSpinner.isVisible()) return;
            this.loadingSpinner.start();
            this.$form.submit();
        }

        onKeywordInputSearchEvent(viewModel: Search, e: JQueryEventObject): void {
            // this will auto-submit the form when the keyword box's X icon is clicked.
            if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                this.$form.submit();
        }

        //#endregion
    }
}