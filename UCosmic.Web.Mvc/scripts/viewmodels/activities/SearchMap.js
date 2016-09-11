var Activities;
(function (Activities) {
    var ViewModels;
    (function (ViewModels) {
        (function (DataGraphPivotTest) {
            DataGraphPivotTest[DataGraphPivotTest["activities"] = 1] = "activities";
            DataGraphPivotTest[DataGraphPivotTest["people"] = 2] = "people";
        })(ViewModels.DataGraphPivotTest || (ViewModels.DataGraphPivotTest = {}));
        var DataGraphPivotTest = ViewModels.DataGraphPivotTest;
        var ActivityTypeSearchTestCheckBox = (function () {
            function ActivityTypeSearchTestCheckBox(activityType, settings) {
                this.activityType = activityType;
                this.settings = settings;
                this.isChecked = ko.observable(!this.settings.input.activityTypeIds || !this.settings.input.activityTypeIds.length ||
                    Enumerable.From(this.settings.input.activityTypeIds).Contains(this.activityType.activityTypeId.toString()));
            }
            return ActivityTypeSearchTestCheckBox;
        })();
        ViewModels.ActivityTypeSearchTestCheckBox = ActivityTypeSearchTestCheckBox;
        var MapSearch = (function () {
            function MapSearch(settings, searchMapData) {
                var _this = this;
                this.settings = settings;
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.pivot = ko.observable(this.settings.input.pivot);
                this.isActivitiesChecked = ko.computed(function () { return _this.pivot() != DataGraphPivotTest.people; });
                this.isPeopleChecked = ko.computed(function () { return _this.pivot() == DataGraphPivotTest.people; });
                this.loadingSpinner = new App.Spinner();
                this.hasTenancyData = ko.observable(false);
                this.hasEstablishmentSelects = ko.observable(false);
                this.selectedTenant = ko.observable(this.settings.tenantId);
                this.selectedEstablishment = ko.observable(this.settings.input.ancestorId);
                this.tenantOptions = ko.observableArray();
                this.affiliations = ko.mapping.fromJS([]);
                this.includeUndated = ko.observable("Checked");
                this.placeNames = ko.observable("");
                this.placeFilter = ko.observable("");
                this.tableUrl = ko.observable();
                this.affiliationsLoaded = false;
                this.establishmentData = new App.DataCacher(function () {
                    return _this._loadEstablishmentData();
                });
                this.location_callback = function (id, text) {
                    _this.$placeIds.val(id);
                    _this.placeNames(text);
                    _this.$placeNames.val(text);
                    if (text) {
                        _this.searchMap.continentCode('all');
                    }
                    else {
                        _this.searchMap.continentCode('any');
                        _this.searchMap.placeType('continents');
                        _this.$placeFilter.val("continents");
                        _this.searchMap._receivePlaces('continents');
                    }
                    _this._submitForm();
                };
                this.keyword = ko.observable("");
                this.since = ko.observable("");
                this.until = ko.observable("");
                this.isClearSinceDisabled = ko.computed(function () {
                    return _this.since() ? false : true;
                });
                this.isClearUntilDisabled = ko.computed(function () {
                    return _this.until() ? false : true;
                });
                this.infoIsOpen = ko.observable(false);
                var searchOptions = JSON.parse(sessionStorage.getItem(ViewModels.SearchMap.SearchOptions));
                if (sessionStorage.getItem('isMapClick') == "1") {
                    if (searchOptions.placeNames.indexOf(" &") > 0) {
                        searchOptions.placeNames = searchOptions.placeNames.substring(0, searchOptions.placeNames.lastIndexOf(" &"));
                        searchOptions.placeIds.pop();
                    }
                    else {
                        searchOptions.placeNames = "";
                        if (typeof searchOptions.placeIds == 'string') {
                            searchOptions.placeIds = "";
                        }
                        else {
                            searchOptions.placeIds.pop();
                        }
                    }
                    sessionStorage.setItem(ViewModels.SearchMap.SearchOptions, JSON.stringify(searchOptions));
                }
                sessionStorage.setItem("isMapClick", "0");
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
                        this.includeUndated("");
                    }
                }
                var location_list = document.getElementById('location_list');
                searchOptions && searchOptions.placeIds ? location_list._tag.set_selected_id(searchOptions.placeIds) : null;
                this.keyword(this.settings.input.keyword);
                this.since(this.settings.input.since);
                this.until(this.settings.input.until);
                this.activityTypeCheckBoxes = ko.observableArray(Enumerable.From(this.settings.activityTypes)
                    .Select(function (x) {
                    return new ActivityTypeSearchTestCheckBox(x, _this.settings);
                }).ToArray());
                this.isCheckAllActivityTypesDisabled = ko.computed(function () {
                    return Enumerable.From(_this.activityTypeCheckBoxes())
                        .All(function (x) {
                        return x.isChecked();
                    });
                });
                this.isUncheckAllActivityTypesDisabled = ko.computed(function () {
                    return Enumerable.From(_this.activityTypeCheckBoxes())
                        .All(function (x) {
                        return !x.isChecked();
                    });
                });
                this.ancestorId = settings.input.ancestorId;
                this.oldAncestorId = settings.input.ancestorId;
                this.oldKeyword = settings.input.keyword;
                this.searchMap = new Activities.ViewModels.SearchMap(searchMapData, this);
                this.searchMap.applyBindings(document.getElementById('searchMap'));
                this._loadTenancyData();
            }
            MapSearch.prototype._createEstablishmentSelects = function (response) {
                var parentId = this.settings.input.ancestorId;
                if (!parentId) {
                    parentId = this.settings.tenantId;
                }
                var previousParentId = 0;
                this.affiliationsLoaded = true;
                this.loadingSpinner.stop();
                while (true) {
                    response.map(function (x, index, array) {
                        x.officialName = x.contextName ? x.contextName : x.officialName && x.officialName.indexOf(',') > -1 ? x.officialName.substring(0, x.officialName.indexOf(',')) : x.officialName;
                        return x;
                    });
                    var options = Enumerable.From(response)
                        .Where("x => x.parentId==" + parentId)
                        .OrderBy(function (x) {
                        return x.rank;
                    })
                        .ThenBy(function (x) {
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
                    }
                    else {
                        this.hasEstablishmentSelects(true);
                        return;
                    }
                }
            };
            MapSearch.prototype._loadEstablishmentData = function () {
                var _this = this;
                var promise = $.Deferred();
                if (!this.mainCampus) {
                    this.mainCampus = this.settings.tenantId;
                }
                var temp = sessionStorage.getItem('campuses' + this.mainCampus);
                if (temp) {
                    var response = $.parseJSON(temp);
                    this._createEstablishmentSelects(response);
                }
                else {
                    $.when(this.searchMap.dataDefered).done(function () {
                        var settings = settings || {};
                        settings.url = '/api/establishments/' + _this.mainCampus + '/offspring';
                        $.ajax(settings)
                            .done(function (response) {
                            promise.resolve(response);
                            sessionStorage.setItem('campuses' + _this.mainCampus, JSON.stringify(response));
                            _this._createEstablishmentSelects(response);
                        })
                            .fail(function (xhr) {
                            promise.reject(xhr);
                        });
                    });
                }
                return promise;
            };
            MapSearch.prototype._loadTenancyData = function () {
                var _this = this;
                $.when(this.searchMap.dataDefered).done(function () {
                    $.when(Activities.Servers.Single(_this.settings.tenantId), Activities.Servers.GetChildren(_this.settings.tenantId))
                        .done(function (parentData, childData) {
                        childData = childData || [];
                        var tenants = Enumerable.From(childData)
                            .OrderBy(function (x) {
                            return x.rank;
                        }).ToArray();
                        tenants.unshift(parentData);
                        _this.tenantOptions([]);
                        if (childData.length) {
                            var options = Enumerable.From(tenants)
                                .Select(function (x) {
                                var option = {
                                    value: x.id,
                                    text: x.contextName || x.officialName,
                                };
                                return option;
                            }).ToArray();
                            _this.tenantOptions(options);
                        }
                        _this.establishmentData.ready();
                        var myThis = _this;
                        _this.selectedTenant(_this.settings.input.ancestorId);
                        _this.selectedTenant.subscribe(function (newValue) {
                            _this.selectedEstablishment(_this.selectedTenant());
                            _this._submitForm();
                        });
                        $(".campusSelect").change(function () {
                            if (this.value != '') {
                                myThis.selectedEstablishment(this.value);
                            }
                            else {
                                var prevCampusSelect = $(this).parent().parent().prev().find(".campusSelect");
                                if (prevCampusSelect.length) {
                                    myThis.selectedEstablishment($(this).parent().parent().prev().find(".campusSelect").val());
                                }
                                else {
                                    myThis.selectedEstablishment(myThis.settings.tenantId);
                                }
                            }
                            sessionStorage.setItem('EmployeeSummaryEstablishmentId', myThis.selectedEstablishment().toString());
                            myThis._submitForm();
                        });
                        if (childData.length)
                            _this.hasTenancyData(true);
                    })
                        .fail(function (xhr) {
                        App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                    });
                });
            };
            MapSearch.prototype.applyBindings = function (element) {
                var _this = this;
                ko.applyBindings(this, element);
                kendo.init($(element));
                this._applyKendo();
                this._applySubscriptions();
                $('a').click(function (e) {
                    if (e.target.href) {
                        _this.loadingSpinner.start();
                    }
                });
            };
            MapSearch.prototype._applyKendo = function () {
                //#region DatePickers
                var _this = this;
                var kendoSince = this.$since.data('kendoDatePicker');
                kendoSince.element.val(this.settings.input.since);
                var kendoUntil = this.$until.data('kendoDatePicker');
                kendoUntil.element.val(this.settings.input.until);
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
                        parameterMap: function (data, action) {
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
                var checkDataSource = function (widget) {
                    var inputVal = $.trim(widget.input.val());
                    if (!inputVal && dataSource == 'empty')
                        return;
                    if (inputVal && dataSource == 'server')
                        return;
                    if (!inputVal && dataSource != 'empty') {
                        dataSource = 'empty';
                        widget.value('');
                        _this.$placeIds.val('');
                        if (_this.settings.input.placeIds && _this.settings.input.placeIds.length) {
                        }
                        else {
                            widget.setDataSource(emptyDataSource);
                        }
                        return;
                    }
                    if (inputVal && dataSource != 'server') {
                        dataSource = 'server';
                        widget.setDataSource(serverDataSource);
                        return;
                    }
                };
                this.$placeFilter.val("continents");
            };
            MapSearch.prototype._applySubscriptions = function () {
                var _this = this;
                this.orderBy.subscribe(function (newValue) { _this._submitForm(); });
                var myThis = this;
                $('input[name="placeNames"]').bind("change keyup input", function () {
                    if (this.value == "") {
                        myThis._submitForm();
                    }
                });
            };
            MapSearch.prototype.resetSearch = function () {
                this.checkAllActivityTypes();
                this.keyword("");
                this.placeNames("");
                this.since("");
                this.until("");
                this.selectedEstablishment(this.settings.tenantId);
                $('input[name="placeNames"]')[0].value = '';
                $('input[name="placeIds"]')[0].value = '';
                this.searchMap.clearFilter();
                this._submitForm();
            };
            MapSearch.prototype._submitForm = function () {
                if (this.oldAncestorId == this.selectedEstablishment()) {
                    this.searchMap.reloadData($('form'), false);
                }
                else {
                    this.searchMap.reloadData($('form'), true);
                }
            };
            MapSearch.prototype.onKeywordInputSearchEvent = function (viewModel, e) {
                if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form) {
                    e.preventDefault();
                    this.keyword($(e.target).val());
                    this._submitForm();
                }
            };
            MapSearch.prototype.checkAllActivityTypes = function () {
                Enumerable.From(this.activityTypeCheckBoxes())
                    .ForEach(function (x) {
                    x.isChecked(true);
                });
            };
            MapSearch.prototype.uncheckAllActivityTypes = function () {
                Enumerable.From(this.activityTypeCheckBoxes())
                    .ForEach(function (x) {
                    x.isChecked(false);
                });
            };
            MapSearch.prototype.clearSince = function () {
                this.since('');
            };
            MapSearch.prototype.clearUntil = function () {
                this.until('');
            };
            MapSearch.prototype.infoOpen = function () {
                this.infoIsOpen(true);
            };
            MapSearch.prototype.infoClose = function () {
                this.infoIsOpen(false);
            };
            return MapSearch;
        })();
        ViewModels.MapSearch = MapSearch;
    })(ViewModels = Activities.ViewModels || (Activities.ViewModels = {}));
})(Activities || (Activities = {}));
