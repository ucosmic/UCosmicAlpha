
interface HTMLElement {
    value: any;
}
module Activities.ViewModels {

    export interface SearchTestSettings {
        input: ApiModels.SearchInput;
        output: App.PageOf<ApiModels.SearchResult>;
        activityTypes: ApiModels.ActivityTypeSearchFilter[];
        tenantId: number;
    }

    export enum DataGraphPivotTest {
        activities = 1,
        people = 2,
    }

    export class ActivityTypeSearchTestCheckBox {
        // when activity types is null or empty, assume all are checked
        isChecked = ko.observable(!this.settings.input.activityTypeIds || !this.settings.input.activityTypeIds.length ||
            // otherwise, it is only checked when input contains the activity type id
            Enumerable.From(this.settings.input.activityTypeIds).Contains(this.activityType.activityTypeId.toString()));


        constructor(public activityType: ApiModels.ActivityTypeSearchFilter, public settings: SearchTestSettings) {

        }
    }



    export class MapSearch {
        //#region Construction
        orderBy = ko.observable(this.settings.input.orderBy);
        //pager = new App.Pager<ApiModels.SearchResult>(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
        pivot = ko.observable(<DataGraphPivotTest>this.settings.input.pivot);

        isActivitiesChecked = ko.computed((): boolean => { return this.pivot() != DataGraphPivotTest.people; });
        isPeopleChecked = ko.computed((): boolean => { return this.pivot() == DataGraphPivotTest.people; });

        $form: JQuery;
        $location: JQuery;
        $placeFilter: JQuery;
        $since: JQuery;
        $until: JQuery;
        $placeIds: JQuery;
        loadingSpinner = new App.Spinner();


        hasTenancyData = ko.observable<boolean>(false);
        hasEstablishmentSelects = ko.observable<boolean>(false);
        selectedTenant = ko.observable<number>(this.settings.tenantId);
        selectedEstablishment = ko.observable<number>(this.settings.input.ancestorId);
        tenantOptions = ko.observableArray<App.ApiModels.SelectOption<number>>();
        affiliations = ko.mapping.fromJS([]);
        mainCampus: number;
        searchMap;
        includeUndated = ko.observable<string>("Checked");
        ancestorId: number;
        oldKeyword: string;
        oldAncestorId: number;
        placeNames = ko.observable<string>("");
        placeFilter = ko.observable<string>("");
        tableUrl = ko.observable();
        affiliationsLoaded = false;

        constructor(public settings: SearchTestSettings, searchMapData) {
            //window.sessionStorage.setItem("test", JSON.stringify(this.settings.output));
            //this.pager.apply(this.settings.output);
            var searchOptions = JSON.parse(sessionStorage.getItem(SearchMap.SearchOptions));

            if (sessionStorage.getItem('isMapClick') == "1") {
                if (searchOptions.placeNames.indexOf(" &") > 0) {
                    searchOptions.placeNames = searchOptions.placeNames.substring(0, searchOptions.placeNames.lastIndexOf(" &"));
                    searchOptions.placeIds.pop();
                } else {
                    searchOptions.placeNames = "";
                    if (typeof searchOptions.placeIds == 'string') {
                        searchOptions.placeIds = "";
                    } else {
                        searchOptions.placeIds.pop();
                    }
                }
                sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(searchOptions));
                //SearchMap.updateSession(searchOptions);
            }
            sessionStorage.setItem("isMapClick", "0");
            //instead of doing this lets go ahead and make the sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(searchOptions)); in advanced table search.
            //if (!searchOptions) {
            //    searchOptions = settings.input;
            //    searchOptions.placeNames = settings.input.placeNames[0];
            //    $.each(settings.input.activityTypeIds, function (index, value) {
            //        searchOptions.activityTypeIds[index] = value.toString();
            //    });
            //    searchOptions.placeFilter = 'continents';


            //}
            //if (searchOptions) {
            //    sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(searchOptions));
            //}
            if (searchOptions) {
                this.settings.input.activityTypeIds = searchOptions.activityTypeIds;
                this.settings.input.placeNames = searchOptions.placeNames;
                this.placeNames(searchOptions.placeNames);
                this.placeFilter(searchOptions.placeFilter);
                this.settings.input.since = searchOptions.Since;
                this.settings.input.until = searchOptions.Until;
                this.settings.input.keyword = searchOptions.keyword;
                this.settings.input.includeUndated = searchOptions.includeUndated;
                if (!searchOptions.includeUndated || searchOptions.includeUndated == false) {
                    this.includeUndated("")
                }
            }
            this.keyword(this.settings.input.keyword);

            this.since(this.settings.input.since);
            this.until(this.settings.input.until);

            this.activityTypeCheckBoxes = ko.observableArray<ActivityTypeSearchTestCheckBox>(Enumerable.From(this.settings.activityTypes)
                .Select((x: ApiModels.ActivityTypeSearchFilter): ActivityTypeSearchTestCheckBox => {
                return new ActivityTypeSearchTestCheckBox(x, this.settings)
            }).ToArray());

            this.isCheckAllActivityTypesDisabled = ko.computed((): boolean => {
                return Enumerable.From(this.activityTypeCheckBoxes())
                    .All((x: ActivityTypeSearchTestCheckBox): boolean => {
                        return x.isChecked();
                    });
            });

            this.isUncheckAllActivityTypesDisabled = ko.computed((): boolean => {
                return Enumerable.From(this.activityTypeCheckBoxes())
                    .All((x: ActivityTypeSearchTestCheckBox): boolean => {
                        return !x.isChecked();
                    });
            });
            this.ancestorId = settings.input.ancestorId;
            this.oldAncestorId = settings.input.ancestorId;
            this.oldKeyword = settings.input.keyword;

            //$.each(searchOptions.activityTypeIds, function (index, value) {
            //    $.each($("input[name='activityTypeIds']"), function (index2, value2) {
            //        if(value = 
            //    });
            //});


            this.searchMap = new Activities.ViewModels.SearchMap(searchMapData, this);
            this.searchMap.applyBindings(document.getElementById('searchMap'));

            this._loadTenancyData();

        }


        establishmentData = new App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]>(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadEstablishmentData();
            });

        private _createEstablishmentSelects(response): void {

            var parentId = this.settings.input.ancestorId;
            if (!parentId) {
                parentId = this.settings.tenantId;
            }
            var previousParentId = 0;
            this.affiliationsLoaded = true;

            this.loadingSpinner.stop();
            while (true) {
                var options: any = Enumerable.From(response)
                    .Where("x => x.parentId==" + parentId)
                    .Select("x =>  {value: x.id, text: x.officialName}")
                    .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                        return x.rank; // sort by rank, then by name
                    })
                    .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
                        return x.contextName || x.officialName;
                    }).ToArray();

                for (var i = 0; i < options.length; i++) {
                    if (options[i].text.indexOf(',') > 0) {
                        options[i].text = options[i].text.substring(0, options[i].text.indexOf(','))
                        }
                }

                if (options.length > 0) {
                    options.unshift({ value: null, text: 'Select sub-affiliation or leave empty' });
                    this.affiliations.unshift(ko.mapping.fromJS([{ options: options, value: previousParentId.toString() }])()[0]);
                }
                previousParentId = parentId;
                var parentCheck = Enumerable.From(response).Where("x => x.id==" + parentId).ToArray();
                if (parentCheck[0] != undefined) {
                    parentId = parentCheck[0].parentId;
                } else {
                    this.hasEstablishmentSelects(true);
                    return;
                }
            }
        }

        private _loadEstablishmentData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            var promise: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            //var mainCampus = this.settings.tenantId;

            if (!this.mainCampus) {
                this.mainCampus = this.settings.tenantId;
            }

            var temp = sessionStorage.getItem('campuses' + this.mainCampus);
            if (temp) {
                var response = $.parseJSON(temp);
                this._createEstablishmentSelects(response);
            } else {

                $.when(this.searchMap.dataDefered).done(() => {
                    var settings = settings || {};
                    settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
                    $.ajax(settings)
                        .done((response: ApiModels.ScalarEstablishment[]): void => {
                            promise.resolve(response);
                            sessionStorage.setItem('campuses' + this.mainCampus, JSON.stringify(response));

                            this._createEstablishmentSelects(response);


                        })
                        .fail((xhr: JQueryXHR): void => {
                            promise.reject(xhr);
                        });
                });
            }

            return promise;
        }

        private _loadTenancyData(): void {
            $.when(this.searchMap.dataDefered).done(() => {
                $.when(Activities.Servers.Single(this.settings.tenantId), Activities.Servers.GetChildren(this.settings.tenantId))
                    .done((parentData: Activities.ApiModels.ScalarEstablishment, childData: Activities.ApiModels.ScalarEstablishment[]): void => {
                        childData = childData || [];
                        var tenants = Enumerable.From(childData)
                            .OrderBy(function (x: Activities.ApiModels.ScalarEstablishment): number {
                                return x.rank;
                            }).ToArray();
                        tenants.unshift(parentData);

                        this.tenantOptions([]);
                        if (childData.length) {
                            var options = Enumerable.From(tenants)
                                .Select(function (x: Activities.ApiModels.ScalarEstablishment): App.ApiModels.SelectOption<number> {
                                    var option: App.ApiModels.SelectOption<number> = {
                                        value: x.id,
                                        text: x.contextName || x.officialName,
                                    };
                                    return option;
                                }).ToArray();
                            this.tenantOptions(options);
                        }

                        this.establishmentData.ready();

                        var myThis = this;
                        this.selectedTenant(this.settings.input.ancestorId);
                        this.selectedTenant.subscribe((newValue: number): void => {
                            this.selectedEstablishment(this.selectedTenant());
                            this._submitForm();
                        });
                        $(".campusSelect").change(function () {
                            if (this.value != '') {
                                myThis.selectedEstablishment(this.value);
                            } else {
                                var prevCampusSelect = $(this).parent().parent().prev().find(".campusSelect");
                                if (prevCampusSelect.length) {
                                    myThis.selectedEstablishment($(this).parent().parent().prev().find(".campusSelect").val());
                                } else {
                                    myThis.selectedEstablishment(myThis.settings.tenantId);
                                }
                            }
                            sessionStorage.setItem('EmployeeSummaryEstablishmentId', myThis.selectedEstablishment().toString());

                            myThis._submitForm()
                        })
                        //deferred.resolve(tenants);
                        if (childData.length) this.hasTenancyData(true);

                    })
                    .fail((xhr: JQueryXHR): void => {
                        App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                        //deferred.reject();
                    })
                });
        }

        //#endregion
        //#region Initialization

        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            kendo.init($(element));
            this._applyKendo();
            this._applySubscriptions();

            //this.$form.submit((event) => {
            //    this.loadingSpinner.start();
            //});
            $('a').click((e:any) => {
                if (e.target.href) {
                    this.loadingSpinner.start();
                }
            });
        }

        stopAutocompleteInfiniteLoop: boolean;
        private _applyKendo(): void {
            //#region DatePickers

            var kendoSince = this.$since.data('kendoDatePicker');
            kendoSince.element.val(this.settings.input.since);
            var kendoUntil = this.$until.data('kendoDatePicker');
            kendoUntil.element.val(this.settings.input.until);

            //#endregion
            //#region ComboBox for Place(s) filter
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
                        url: Routes.Api.Places.Names.autocomplete(),
                    },
                    parameterMap: (data: kendo.data.DataSourceTransportParameterMapData, action: string): any => {
                        if (action == 'read' && data && data.filter && data.filter.filters && data.filter.filters.length) {
                            return {
                                terms: data.filter.filters[0].value,
                                maxResults: 20,
                                granularity: 2,
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
                        //this._submitForm(); // this makes changing location searches annoying
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
                suggest: true,
                animation: false,
                height: 420,
                dataTextField: 'officialName',
                dataValueField: 'placeId',
                filter: 'contains',
                dataSource: hasPlace ? serverDataSource : emptyDataSource,
                select: (e: kendo.ui.ComboBoxSelectEvent): void => {
                    var dataItem = e.sender.dataItem(e.item.index());

                    if (dataItem.placeId == -1) {
                        this.placeNames("");
                        e.sender.value('');
                        e.sender.input.val('');
                        this.$placeIds.val('');
                        e.preventDefault();
                        this._submitForm();
                        return;
                    }

                    if (dataItem.officialName == emptyDataItem.officialName) {
                        this.$placeIds.val('');
                        e.preventDefault();
                        return;
                    }

                    if (!this.settings.input.placeIds || !this.settings.input.placeIds.length ||
                        this.settings.input.placeIds[0] != dataItem.placeId) {
                        e.sender.input.val(dataItem.officialName);
                        this.$location.val(dataItem.officialName);
                        this.$placeIds.val(dataItem.placeId);
                        this.placeNames(dataItem.officialName);
                        this._submitForm();
                    }
                },
                change: (e: kendo.ui.ComboBoxEvent): void => {
                    var dataItem = e.sender.dataItem(e.sender.select());
                    if (!dataItem) {
                        this.$placeIds.val('');
                        e.sender.value('');
                        checkDataSource(e.sender);
                    } else {
                        e.sender.input.val(dataItem.officialName);
                        this.$location.val(dataItem.officialName);
                        this.$placeIds.val(dataItem.placeId);
                        if (!this.settings.input.placeIds || !this.settings.input.placeIds.length ||
                            this.settings.input.placeIds[0] != dataItem.placeId) {
                            this._submitForm();
                        }
                    }
                },
                //open: (e: kendo.ui.ComboBoxEvent): boolean => {
                //    return false;
                //},
                dataBound: (e: kendo.ui.ComboBoxEvent): void => {
                    if (!this.stopAutocompleteInfiniteLoop) {
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
                                widget.close();
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

                        var value = e.sender.value();
                        if (value) {
                            var dataSource = e.sender.dataSource;
                            var data = dataSource.data();
                            var hasClearer = Enumerable.From(data).Any(function (x: any): boolean {return x.placeId == -1 });
                            if (!hasClearer) {
                                dataSource.add({ officialName: '[Clear current selection]', placeId: -1 })
                                this.stopAutocompleteInfiniteLoop = true;
                            }
                        }
                    } else {
                        this.stopAutocompleteInfiniteLoop = false;
                    }
                }
            });
            var comboBox: kendo.ui.ComboBox = this.$location.data('kendoComboBox');
            comboBox.list.addClass('k-ucosmic');

            //this.$placeFilter.kendoDropDownList({
            //    animation: false,
            //    height: 420,
            //    dataTextField: 'name',
            //    dataValueField: 'value',
            //    dataSource: [
            //        { name: "Filter by continents", value: "continents" },
            //        { name: "Filter by bodies of water", value: "waters" },
            //        { name: "Filter by countries", value: "countries" },
            //    ],
            //    change: (e: kendo.ui.DropDownListSelectEvent): void => {
            //        var dataItem = e.sender.dataItem(e.sender.selectedIndex);
            //        //e.sender.input.val(dataItem.officialName);
            //        this.$placeFilter.val(dataItem.value);
            //        this._submitForm();
            //    }
            //});
            this.$placeFilter.val("continents")
            //var comboBox2: kendo.ui.ComboBox = this.$placeFilter.data('kendoDropDownList');
            //comboBox2.list.addClass('k-ucosmic');
            //comboBox2.element.
            //#endregion
        }

        private _applySubscriptions(): void {
            //this.pager.input.pageSizeText.subscribe((newValue: string): void => { this._submitForm(); });
            //this.pager.input.pageNumberText.subscribe((newValue: string): void => { this._submitForm(); });
            this.orderBy.subscribe((newValue: string): void => { this._submitForm(); });

            //this.placeNames.subscribe((newValue: string): void => {
            //    if (newValue == "") {
            //        this._submitForm();
            //    }
            //});
            var myThis = this;
            $('input[name="placeNames"]').bind("change keyup input", function () {
                if(this.value == ""){
                    myThis._submitForm();
                }
            })

        }

        //#endregion
        //#region Automatic Form Submits

        resetSearch(): void {
            this.checkAllActivityTypes();
            this.keyword("");
            this.placeNames("");
            this.since("");
            this.until("");
            this.selectedEstablishment(this.settings.tenantId);
            $('input[name="placeNames"]')[0].value = '';
            $('input[name="placeIds"]')[0].value = '';
            this.searchMap.clearFilter();
            //this.loadingSpinner.start();
            this._submitForm();
            //this.searchMap.reloadData($('form'), true);
        }

        private _submitForm(): void {

            if (this.oldAncestorId == this.selectedEstablishment()) {
                this.searchMap.reloadData($('form'), false);
            } else {
                //this._loadEstablishmentData()
                this.searchMap.reloadData($('form'), true);
            }

            //this.$form.submit();
        }

        onKeywordInputSearchEvent(viewModel: Search, e: JQueryEventObject): void {
            // this will auto-submit the form when the keyword box's X icon is clicked.
            if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form) {
                e.preventDefault();
                this.keyword($(e.target).val())
                this._submitForm();
                //this.$form.submit();
            }
        }

        //#endregion
        //#region Activity Type CheckBoxes

        activityTypeCheckBoxes;// = ko.observableArray<ActivityTypeSearchTestCheckBox>(Enumerable.From(this.settings.activityTypes)
        //    .Select((x: ApiModels.ActivityTypeSearchFilter): ActivityTypeSearchTestCheckBox => {
        //        return new ActivityTypeSearchTestCheckBox(x, this.settings)
        //}).ToArray());

        isCheckAllActivityTypesDisabled;// = ko.computed((): boolean => {
        //    return Enumerable.From(this.activityTypeCheckBoxes())
        //        .All((x: ActivityTypeSearchTestCheckBox): boolean => {
        //            return x.isChecked();
        //        });
        //});

        isUncheckAllActivityTypesDisabled;// = ko.computed((): boolean => {
        //    return Enumerable.From(this.activityTypeCheckBoxes())
        //        .All((x: ActivityTypeSearchTestCheckBox): boolean => {
        //            return !x.isChecked();
        //        });
        //});

        checkAllActivityTypes(): void {
            Enumerable.From(this.activityTypeCheckBoxes())
                .ForEach((x: ActivityTypeSearchTestCheckBox): void => {
                    x.isChecked(true);
                })
        }

        uncheckAllActivityTypes(): void {
            Enumerable.From(this.activityTypeCheckBoxes())
                .ForEach((x: ActivityTypeSearchTestCheckBox): void => {
                    x.isChecked(false);
                })
        }

        //#endregion
        //#region Date Filter Controls
        keyword = ko.observable<string>("");

        since = ko.observable<string>("");
        until = ko.observable<string>("");

        isClearSinceDisabled = ko.computed((): boolean => {
            return this.since() ? false : true;
        });

        isClearUntilDisabled = ko.computed((): boolean => {
            return this.until() ? false : true;
        });

        clearSince(): void {
            this.since('');
        }

        clearUntil(): void {
            this.until('');
        }

        //#endregion


        //#region map info

        infoIsOpen = ko.observable<boolean>(false);

        infoOpen() {
            this.infoIsOpen(true);
        }

        infoClose() {
            this.infoIsOpen(false);
        }
        //#endregion
    }
}