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
        $placeIds: JQuery;
        loadingSpinner = new App.Spinner()

        constructor(public settings: SearchSettings) {
            this.pager.apply(this.settings.output);
        }

        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            this._applyKendo();
            this._applySubscriptions();
        }

        private _applyKendo(): void {
            var inputInitialized = false;
            var emptyDataItem = {
                officialName: '[Begin typing to see options]',
                placeId: undefined,
            };
            var emptyDataSource = new kendo.data.DataSource({ data: [emptyDataItem], });
            var serverDataSource = new kendo.data.DataSource({
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
                },
            });
            var hasPlace = (this.settings.input.placeIds && this.settings.input.placeIds.length
                && this.settings.input.placeNames && this.settings.input.placeNames.length
                && this.settings.input.placeIds[0] && this.settings.input.placeNames[0]) ? true : false;
            var dataSource = hasPlace ? 'server' : 'empty';
            var checkDataSource = (widget: kendo.ui.ComboBox): void => {
                var inputVal = $.trim(widget.input.val());
                if (!inputVal && dataSource == 'empty') return;
                if (inputVal && dataSource == 'server') return;
                if (!inputVal && dataSource != 'empty') {
                    dataSource = 'empty'
                    widget.value('');
                    this.$placeIds.val('');
                    if (this.settings.input.placeIds && this.settings.input.placeIds.length) {
                        this._submitForm();
                    } else {
                        widget.setDataSource(emptyDataSource);
                    }
                    return;
                }
                if (inputVal && dataSource != 'server') {
                    dataSource = 'server';
                    widget.setDataSource(serverDataSource);
                    return;
                }
            }
            this.$location.kendoComboBox({
                animation: false,
                dataTextField: 'officialName',
                dataValueField: 'placeId',
                filter: 'contains',
                dataSource: hasPlace ? serverDataSource : emptyDataSource,
                select: (e: kendo.ui.ComboBoxSelectEvent): void => {
                    var dataItem = e.sender.dataItem(e.item.index());
                    if (dataItem.officialName == emptyDataItem.officialName) {
                        this.$placeIds.val('');
                        e.preventDefault();
                        return;
                    }

                    if (!this.settings.input.placeIds || !this.settings.input.placeIds.length ||
                        this.settings.input.placeIds[0] != dataItem.placeId) {
                        this._submitForm();
                    }
                },
                change: (e: kendo.ui.ComboBoxEvent): void => {
                    var dataItem = e.sender.dataItem(e.sender.select());
                    if (!dataItem) {
                        this.$placeIds.val();
                        e.sender.value('');
                        checkDataSource(e.sender);
                    } else {
                        this.$placeIds.val(dataItem.placeId);
                        if (!this.settings.input.placeIds || !this.settings.input.placeIds.length ||
                            this.settings.input.placeIds[0] != dataItem.placeId) {
                            this._submitForm();
                        }
                    }
                },
                dataBound: (e: kendo.ui.ComboBoxEvent): void => {
                    var widget = e.sender;
                    var input = widget.input;
                    var inputVal = $.trim(input.val());

                    if (!inputInitialized) {
                        input.attr('name', 'placeNames');
                        this.$location.attr('name', '');
                        input.on('keydown', (): void => {
                            setTimeout((): void => { checkDataSource(widget); }, 0);
                        });
                        if (hasPlace && inputVal) {
                            widget.search(inputVal);
                        }
                        inputInitialized = true;
                    }
                    else if (hasPlace) {
                        widget.select(function (dataItem: any): boolean {
                            return dataItem.placeId == this.settings.input.placeIds[0];
                        });
                        widget.close();
                        input.blur();
                        hasPlace = false;
                    }
                }
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