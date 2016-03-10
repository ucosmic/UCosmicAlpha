module Activities.ViewModels {

    interface HTMLElement {
        value: any;
    }

    export interface SearchSettings {
        input: ApiModels.SearchInput;
        output: App.PageOf<ApiModels.SearchResult>;
        activityTypes: ApiModels.ActivityTypeSearchFilter[];
        tenantId: number;
    }

    export enum DataGraphPivot {
        activities = 1,
        people = 2,
    }

    export class ActivityTypeSearchCheckBox {
        // when activity types is null or empty, assume all are checked
        isChecked = ko.observable(!this.settings.input.activityTypeIds || !this.settings.input.activityTypeIds.length ||
            // otherwise, it is only checked when input contains the activity type id
            Enumerable.From(this.settings.input.activityTypeIds).Contains(this.activityType.activityTypeId));


        constructor(public activityType: ApiModels.ActivityTypeSearchFilter, public settings: SearchSettings) { }
    }



    export class Search {
        //#region Construction
        orderBy = ko.observable(this.settings.input.orderBy);
        keyword = ko.observable(this.settings.input.keyword);
        pager = new App.Pager<ApiModels.SearchResult>(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
        pivot = ko.observable(<DataGraphPivot>this.settings.input.pivot);

        isActivitiesChecked = ko.computed((): boolean => { return this.pivot() != DataGraphPivot.people; });
        isPeopleChecked = ko.computed((): boolean => { return this.pivot() == DataGraphPivot.people; });

        $form: JQuery;
        $location: JQuery;
        $since: JQuery;
        $until: JQuery;
        $placeIds: JQuery;
        loadingSpinner = new App.Spinner();
        //placeNames = ko.observable("");


        hasTenancyData = ko.observable<boolean>(false);
        hasEstablishmentSelects = ko.observable<boolean>(false);
        selectedTenant = ko.observable<number>(this.settings.tenantId);
        selectedEstablishment = ko.observable<number>(this.settings.input.ancestorId);
        tenantOptions = ko.observableArray<App.ApiModels.SelectOption<number>>();
        affiliations = ko.mapping.fromJS([]);
        mainCampus: number;
        static SearchOptions = 'ActivitySearchOptions'


        constructor(public settings: SearchSettings) {
            //window.sessionStorage.setItem("test", JSON.stringify(this.settings.output));
            
            //if (searchOptions) {
            //    sessionStorage.setItem(SearchMap.SearchOptions, JSON.stringify(searchOptions));
            //}
            this.pager.apply(this.settings.output);
            this._loadTenancyData();

        }
        MapDataIsLoading = ko.observable<boolean>(false);
        //MapDataIsLoading = ko.observable<boolean>(true);
        ajaxMapData;
        private _ConstructMapData() {
            var stringActivityMapData;
            var activityMapData;
            var stringActivityMapDataSearch = sessionStorage.getItem('activityMapDataSearch');
            var ancestorId = this.settings.input.ancestorId ? this.settings.input.ancestorId.toString() : "null";
            var keyword = this.settings.input.keyword ? this.settings.input.keyword : "null";

            

            if (stringActivityMapDataSearch == ancestorId + keyword) {
                stringActivityMapData = sessionStorage.getItem('activityMapData');
                activityMapData = $.parseJSON(stringActivityMapData);
            }

            if (!activityMapData || !activityMapData.length) {
                var settings = settings || {};

                var url = '/api/usf.edu/employees/map/?ancestorid=' + ancestorId;
                if (this.settings.input.keyword) {
                    url += '&keyword=' + keyword;
                }
                settings.url = url;//'/api/usf.edu/employees/map/?pivot=1&keyword=&ancestorid=3306&placeNames=&placeIds=&activityTypeIds=2&activityTypeIds=3&activityTypeIds=5&activityTypeIds=1&activityTypeIds=4&Since=&Until=&includeUndated=true&includeUndated=false';
                //check with ancestorid - use output.input.anc...

                this.ajaxMapData = $.ajax(settings)
                    .done((response: any): void => {
                        //get ancestorid and add it to the sessionStorage
                        sessionStorage.setItem('activityMapData', JSON.stringify(response));
                        sessionStorage.setItem('activityMapDataSearch', ancestorId + keyword);
                        this.MapDataIsLoading(false);
                    })
                    .fail((xhr: JQueryXHR): void => {
                        //promise.reject(xhr);
                    });
            }else{
                this.MapDataIsLoading(false);
            }
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
            while (true) {

                response.map(function (x, index, array) {
                    x.officialName = x.contextName ? x.contextName : x.officialName && x.officialName.indexOf(',') > -1 ? x.officialName.substring(0, x.officialName.indexOf(',')) : x.officialName;
                    return x;
                });

                var options: any = Enumerable.From(response)
                    .Where("x => x.parentId==" + parentId)
                    .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                    return x.rank; // sort by rank, then by name
                })
                    .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
                    return x.contextName || x.officialName;
                })
                    .Select("x =>  {value: x.id, text: x.officialName}").ToArray();
                
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
            //while (true) {
            //    var options: any = Enumerable.From(response)
            //        .Where("x => x.parentId==" + parentId)
            //        .Select("x =>  {value: x.id, text: x.officialName}")
            //        .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
            //            return x.rank; // sort by rank, then by name
            //        })
            //        .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
            //            return x.contextName || x.officialName;
            //        }).ToArray();

            //    for (var i = 0; i < options.length; i++) {
            //        if (options[i].text.indexOf(',') > 0) {
            //            options[i].text = options[i].text.substring(0, options[i].text.indexOf(','))
            //            }
            //    }

            //    if (options.length > 0) {
            //        options.unshift({ value: null, text: 'Select sub-affiliation or leave empty' });
            //        this.affiliations.unshift(ko.mapping.fromJS([{ options: options, value: previousParentId.toString() }])()[0]);
            //    }
            //    previousParentId = parentId;
            //    var parentCheck = Enumerable.From(response).Where("x => x.id==" + parentId).ToArray();
            //    if (parentCheck[0] != undefined) {
            //        parentId = parentCheck[0].parentId;
            //    } else {
            //        this.hasEstablishmentSelects(true);
            //        return;
            //    }
            //}

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
                //this._ConstructMapData();
            } else {

                var settings = settings || {};
                settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
                $.ajax(settings)
                    .done((response: ApiModels.ScalarEstablishment[]): void => {
                        promise.resolve(response);
                        sessionStorage.setItem('campuses' + this.mainCampus, JSON.stringify(response));

                        this._createEstablishmentSelects(response);
                        //this._ConstructMapData();

                    })
                    .fail((xhr: JQueryXHR): void => {
                        promise.reject(xhr);
                    });
            }

            return promise;
        }

        private _loadTenancyData(): void {
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

        }

        //#endregion
        //#region Initialization
        
        serializeObject(object): any {

            var o = {};
            var a = object.serializeArray();
            $.each(a, function () {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        }
        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            kendo.init($(element));
            this._applyKendo();
            this._applySubscriptions();
            this.$form.submit((event) => {
                var searchOptions = this.serializeObject($('form'));
                searchOptions.placeFilter = 'continents';
                sessionStorage.setItem(Search.SearchOptions, JSON.stringify(searchOptions));
                
                if(this.ajaxMapData){
                    this.ajaxMapData.abort();
                }
                sessionStorage.setItem("isMapClick", "0");
                this.loadingSpinner.start();
            });
            $('a').click(() => {
                if (this.ajaxMapData) {
                    this.ajaxMapData.abort();
                }
                sessionStorage.setItem("isMapClick", "0");
                this.loadingSpinner.start();
            });
        }
        stopAutocompleteInfiniteLoop: boolean;
        private _applyKendo(): void {
            //#region DatePickers
            //if (this.settings.input.placeNames) {
            //    this.settings.input.placeNames.forEach((value) => {
            //        this.placeNames(this.placeNames() + value);
            //    });
            //}
            //this.placeNames = this.settings.input.placeNames;
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
                    $('.eraseMe').remove();
                    var dataItem = e.sender.dataItem(e.item.index());

                    if (dataItem.placeId == -1) {
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
                    if (!this.stopAutocompleteInfiniteLoop){

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
                    }else{
                        this.stopAutocompleteInfiniteLoop = false;
                    }

                }
            });
            var comboBox: kendo.ui.ComboBox = this.$location.data('kendoComboBox');
            comboBox.list.addClass('k-ucosmic');
            //this.$placeIds.val(this.settings.input.placeIds);
            if(this.settings.input.placeIds){
                $.each(this.settings.input.placeIds, function (index, value) {
                    if (index > 0) {
                        $('<input />').attr('type', 'hidden')
                            .attr('name', "placeIds")
                            .attr('value', value)
                            .addClass('eraseMe')
                            .appendTo('form');
                    }

                });
            }
            var searchOptions = this.serializeObject($('form'));
            searchOptions.placeFilter = 'continents';
            sessionStorage.setItem(Search.SearchOptions, JSON.stringify(searchOptions));

            //$('input[name="placeNames"]').bind("click", function () {
            //    if (this.value == "") {
            //        myThis._submitForm();
            //    }
            //})
            //comboBox.bind("change keyup input", function () {
            //    if (this.value == "") {
            //        myThis._submitForm();
            //    }
            //});
            
            //this.placeNames.subscribe((newValue: string): void => {
            //    if (newValue == "") {
            //        this._submitForm();
            //    }
            //});
            //#endregion
        }

        private _applySubscriptions(): void {
            this.pager.input.pageSizeText.subscribe((newValue: string): void => { this._submitForm(); });
            this.pager.input.pageNumberText.subscribe((newValue: string): void => { this._submitForm(); });
            this.orderBy.subscribe((newValue: string): void => { this._submitForm(); });
            var myThis = this;
            setTimeout(function () {
                $('input[name="placeNames"]').bind("change keyup input", function () {
                    if (this.value == "") {
                        $('input[name="placeIds"]')[0].value = '';
                        //myThis._submitForm();
                    }
                });
                $('input[name="placeIds"]').bind("change keyup input", function () {
                    //if (this.value == "") {
                        //$('input[name="placeIds"]')[0].value = '';
                        myThis._submitForm();
                    //}
                });
            }, 500);
            
        }

        //#endregion
        //#region Automatic Form Submits

        private _submitForm(): void {
            if (this.loadingSpinner.isVisible()) return;
            this.loadingSpinner.start();
            sessionStorage.setItem("isMapClick", "0");
            this.$form.submit();
        }

        onKeywordInputSearchEvent(viewModel: Search, e: JQueryEventObject): void {
            // this will auto-submit the form when the keyword box's X icon is clicked.
            if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                this.$form.submit();
        }

        //#endregion
        //#region Activity Type CheckBoxes

        activityTypeCheckBoxes = ko.observableArray<ActivityTypeSearchCheckBox>(Enumerable.From(this.settings.activityTypes)
            .Select((x: ApiModels.ActivityTypeSearchFilter): ActivityTypeSearchCheckBox => {
                return new ActivityTypeSearchCheckBox(x, this.settings)
        }).ToArray());

        isCheckAllActivityTypesDisabled = ko.computed((): boolean => {
            return Enumerable.From(this.activityTypeCheckBoxes())
                .All((x: ActivityTypeSearchCheckBox): boolean => {
                    return x.isChecked();
                });
        });

        isUncheckAllActivityTypesDisabled = ko.computed((): boolean => {
            return Enumerable.From(this.activityTypeCheckBoxes())
                .All((x: ActivityTypeSearchCheckBox): boolean => {
                    return !x.isChecked();
                });
        });

        checkAllActivityTypes(): void {
            Enumerable.From(this.activityTypeCheckBoxes())
                .ForEach((x: ActivityTypeSearchCheckBox): void => {
                    x.isChecked(true);
                })
        }

        uncheckAllActivityTypes(): void {
            Enumerable.From(this.activityTypeCheckBoxes())
                .ForEach((x: ActivityTypeSearchCheckBox): void => {
                    x.isChecked(false);
                })
        }

        //#endregion
        //#region Date Filter Controls

        since = ko.observable(this.settings.input.since);
        until = ko.observable(this.settings.input.until);

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
    }
}