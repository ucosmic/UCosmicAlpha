module Activities.ViewModels {

    export interface SearchSettings {
        input: ApiModels.SearchInput;
        output: App.PageOf<ApiModels.SearchResult>;
        countryOptions: App.ApiModels.SelectOption<string>[];
    }

    export enum DataGraphPivot {
        activities = 1,
        people = 2,
    }

    export class Search {

        countryOptions = ko.observableArray(this.settings.countryOptions);
        countryCode = ko.observable(this.settings.input.countryCode);
        orderBy = ko.observable(this.settings.input.orderBy);
        keyword = ko.observable(this.settings.input.keyword);
        pager = new App.Pager<ApiModels.SearchResult>(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
        pivot = ko.observable(<DataGraphPivot>this.settings.input.pivot);

        isActivitiesChecked = ko.computed((): boolean => { return this.pivot() != DataGraphPivot.people; });
        isPeopleChecked = ko.computed((): boolean => { return this.pivot() == DataGraphPivot.people; });

        $form: JQuery;
        $location: JQuery;
        loadingSpinner = new App.Spinner()

        constructor(public settings: SearchSettings) {
            this.pager.apply(this.settings.output);
        }

        //private _areBindingsApplied = ko.observable(false);
        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            //this._areBindingsApplied(true);
            this._applyKendo();
            this._applySubscriptions();
        }

        private _applyKendo(): void {
            this.$location.kendoComboBox({
                dataTextField: 'officialName',
                dataValueField: 'placeId',
                filter: 'contains',
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: {
                            url: '/api/places/names/autocomplete',
                        },
                        parameterMap: (data: kendo.data.DataSourceTransportParameterMapData, action: string): any => {
                            if (action == 'read' && data && data.filter && data.filter.filters && data.filter.filters.length) {
                                return {
                                    terms: data.filter.filters[0].value,
                                };
                            }
                            return data;
                        }
                    }
                }),
            });
        }

        private _applySubscriptions(): void {
            this.pager.input.pageSizeText.subscribe((newValue: string): void => { this._submitForm(); });
            this.pager.input.pageNumberText.subscribe((newValue: string): void => { this._submitForm(); });
            this.countryCode.subscribe((newValue: string): void => { this._submitForm(); });
            this.orderBy.subscribe((newValue: string): void => { this._submitForm(); });
            //this.pivot.subscribe((newValue: DataGraphPivot): void => { this._submitForm(); });
        }

        private _submitForm(): void {
            this.loadingSpinner.start();
            this.$form.submit();
        }

        onKeywordInputSearchEvent(viewModel: Search, e: JQueryEventObject): void {
            // this will auto-submit the form when the keyword box's X icon is clicked.
            if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                this.$form.submit();
        }
    }
} 