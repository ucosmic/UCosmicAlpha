module Activities.ViewModels {

    export interface SearchSettings {
        input: ApiModels.SearchInput;
        countryOptions: App.ApiModels.SelectOption<string>[];
    }

    export class Search {

        countryOptions = ko.observableArray(this.settings.countryOptions);
        countryCode = ko.observable(this.settings.input.countryCode);
        orderBy = ko.observable(this.settings.input.orderBy);
        pageSize = ko.observable(this.settings.input.pageSize);
        pageNumber = ko.observable(this.settings.input.pageNumber);
        keyword = ko.observable(this.settings.input.keyword);

        constructor(public settings: SearchSettings) {
        }

        private _areBindingsApplied = ko.observable(false);
        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            this._areBindingsApplied(true);
        }

        onSearchInputChangeEvent(viewModel: Search, e: JQueryEventObject): void {
            if (!this._areBindingsApplied()) return;
            $(e.target).parents('form').submit();
        }

        onKeywordInputSearchEvent(viewModel: Search, e: JQueryEventObject): void {
            // this will auto-submit the form when the keyword box's X icon is clicked.
            if ($.trim(this.keyword()) && !$.trim($(e.target).val()))
                this.onSearchInputChangeEvent(this, e);
        }
    }
} 